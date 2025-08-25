import os
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from django.conf import settings
import json
import time


ROUNDS = 3

class MultiAgentSystem:
    """Multi-agent system for requirement refinement using LangChain + Gemini"""
    
    def __init__(self):
        # Configure Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.7,
            max_retries=0  # Disable retries to prevent quota waste
        )
        
        # Track API usage to prevent quota exhaustion
        self.api_calls_made = 0
        self.max_api_calls = 45  # Leave some buffer for other operations
        
        # Define agent personas
        self.agents = {
            'product_manager': {
                'name': 'Product Manager',
                'focus': 'product vision, strategy, feature prioritization, roadmap',
                'system_prompt': """You are a Product Manager focused on defining product vision and strategy. 
                Frame discussions, clarify goals, and balance trade-offs between design, engineering, marketing, and business needs. 
                Prioritize features, align the team around user value, and outline a clear product roadmap."""
            },
            'design_lead': {
                'name': 'Design Lead',
                'focus': 'usability, aesthetics, user experience, accessibility',
                'system_prompt': """You are a Design Lead focused on user experience and visual design. 
                Consider usability, accessibility, aesthetics, and how users will interact with the product. 
                Propose intuitive user flows, wireframes, and interface principles that ensure a delightful experience."""
            },
            'engineering_lead': {
                'name': 'Engineering Lead',
                'focus': 'technical feasibility, architecture, scalability, development timeline',
                'system_prompt': """You are an Engineering Lead focused on technical feasibility and system architecture. 
                Evaluate implementation complexity, scalability, performance, and security. 
                Suggest technology stacks, break down development milestones, and estimate realistic timelines."""
            },
            'marketing_sales_head': {
                'name': 'Marketing & Sales Head',
                'focus': 'market positioning, customer acquisition, go-to-market strategy',
                'system_prompt': """You are the Marketing & Sales Head focused on market adoption and growth. 
                Consider customer acquisition channels, target audience, competition, and branding. 
                Propose go-to-market strategies, pricing models, and sales approaches that ensure adoption and revenue."""
            },
            'business_manager': {
                'name': 'Business Manager',
                'focus': 'profitability, scalability, revenue model, long-term sustainability',
                'system_prompt': """You are a Business Manager focused on profitability and scalability. 
                Analyze revenue models, cost structures, market opportunities, and competitive advantages. 
                Ensure the product can be financially sustainable and scalable in the long term."""
            }
        }
    
    def check_api_quota(self):
        """Check if we have API calls remaining"""
        return self.api_calls_made < self.max_api_calls
    
    def increment_api_calls(self):
        """Increment API call counter"""
        self.api_calls_made += 1
    
    def get_agent_response(self, agent_key, idea, context="", previous_debate="", user_feedback=""):
        """Get response from a specific agent with context from previous debate and user feedback"""
        agent = self.agents[agent_key]
        
        # Check if we should use fallback due to quota
        if not self.check_api_quota():
            return self._get_fallback_response(agent_key, idea)
        
        # Build context string
        context_parts = []
        if context:
            context_parts.append(f"Previous context: {context}")
        if previous_debate:
            context_parts.append(f"Previous debate: {previous_debate}")
        if user_feedback:
            context_parts.append(f"User feedback: {user_feedback}")
        
        full_context = "\n\n".join(context_parts)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", agent['system_prompt']),
            ("human", f"""Product Idea: {idea}
            
            {full_context}
            
            As a {agent['name']}, provide your perspective on this product idea. Focus on {agent['focus']}.
            
            If this is a feedback iteration, consider the user's feedback and previous discussion when forming your response.
            
            Provide a concise but thoughtful response (2-3 paragraphs) that includes:
            1. Your thoughts on the idea and any feedback provided
            2. Key considerations from your perspective
            3. How your perspective addresses or builds upon previous discussion
            4. Specific suggestions for improvement
            
            Be specific and actionable in your feedback.""")
        ])
        
        try:
            self.increment_api_calls()
            response = self.llm.invoke(prompt.format_messages())
            return response.content
        except Exception as e:
            error_msg = str(e)
            if "quota" in error_msg.lower() or "rate limit" in error_msg.lower() or "429" in error_msg:
                # Mark quota as exhausted
                self.api_calls_made = self.max_api_calls
                return self._get_fallback_response(agent_key, idea)
            else:
                return f"Error getting response from {agent['name']}: {error_msg}"
    
    def _get_fallback_response(self, agent_key, idea):
        """Provide fallback responses when rate limit is hit"""
        fallback_responses = {
            'product_manager': f"""As a Product Manager, I see potential in this idea: {idea[:100]}... 

Key considerations: Product vision, strategy, feature prioritization, and roadmap.

Challenges: Balancing competing priorities and creating a successful product roadmap.

Suggestions: Define clear success metrics, prioritize features based on user value, and iterate based on feedback.""",
            
            'design_lead': f"""As a Design Lead, I'm thinking about the user experience for: {idea[:100]}...

Key considerations: Usability, aesthetics, user experience, and accessibility.

Challenges: Creating intuitive and engaging user interactions.

Suggestions: Focus on user research, create wireframes, and test with real users.""",
            
            'engineering_lead': f"""As an Engineering Lead, I'm analyzing the technical feasibility of: {idea[:100]}...

Key considerations: Technical feasibility, architecture, scalability, and development timeline.

Challenges: Ensuring robust architecture and meeting performance requirements.

Suggestions: Start with MVP approach, choose proven technologies, and plan for scalability.""",
            
            'marketing_sales_head': f"""As a Marketing & Sales Head, I'm considering if this product would be valuable: {idea[:100]}...

Key considerations: Market positioning, customer acquisition, go-to-market strategy.

Challenges: Understanding if this addresses actual user needs and pain points.

Suggestions: Validate with target users, focus on core value proposition, and ensure ease of use.""",
            
            'business_manager': f"""As a Business Manager, I'm evaluating the product strategy for: {idea[:100]}...

Key considerations: Profitability, scalability, revenue model, and long-term sustainability.

Challenges: Balancing competing priorities and creating a successful product roadmap.

Suggestions: Define clear success metrics, prioritize features based on user value, and iterate based on feedback."""
        }
        
        return fallback_responses.get(agent_key, f"Analysis from {self.agents[agent_key]['name']}: {idea[:100]}...")
    
    def run_debate(self, idea, rounds=ROUNDS):
        """Run multi-agent debate for the given idea with proper round implementation"""
        debate_log = []
        
        # Check if we should use fallback mode from the start
        if not self.check_api_quota():
            # Use fallback responses for all agents
            for agent_key in self.agents.keys():
                response = self._get_fallback_response(agent_key, idea)
                debate_log.append({
                    'agent': self.agents[agent_key]['name'],
                    'response': response,
                    'round': 1,
                    'fallback': True
                })
            return debate_log
        
        # Run multiple rounds as intended
        for round_num in range(1, rounds + 1):
            round_responses = []
            
            # Each agent responds in this round
            for agent_key in self.agents.keys():
                # Build context from previous rounds
                previous_context = ""
                if round_num > 1:
                    previous_responses = [resp for resp in debate_log if resp['round'] == round_num - 1]
                    previous_context = "\n\n".join([
                        f"{resp['agent']}: {resp['response']}"
                        for resp in previous_responses
                    ])
                
                response = self.get_agent_response(agent_key, idea, previous_context)
                round_responses.append({
                    'agent': self.agents[agent_key]['name'],
                    'response': response,
                    'round': round_num,
                    'fallback': not self.check_api_quota()  # Mark if we hit quota during processing
                })
            
            # Add round responses to debate log
            debate_log.extend(round_responses)
            
            # Check if we've hit quota limit
            if not self.check_api_quota():
                break
        
        return debate_log
    
    def run_feedback_debate(self, idea, previous_debate_log, user_feedback, rounds=2):
        """Run multi-agent debate based on user feedback and previous discussion with proper rounds"""
        debate_log = []
        
        # Check if we should use fallback mode
        if not self.check_api_quota():
            # Use fallback responses for all agents
            for agent_key in self.agents.keys():
                response = self._get_fallback_response(agent_key, idea)
                debate_log.append({
                    'agent': self.agents[agent_key]['name'],
                    'response': response,
                    'round': len(previous_debate_log) // len(self.agents) + 1,
                    'fallback': True
                })
            return debate_log
        
        # Create context from previous debate
        previous_debate_context = "\n\n".join([
            f"{resp['agent']}: {resp['response']}"
            for resp in previous_debate_log
        ])
        
        # Run multiple rounds for feedback iteration
        for round_num in range(1, rounds + 1):
            round_responses = []
            
            for agent_key in self.agents.keys():
                # Build context including previous rounds of this feedback session
                current_context = previous_debate_context
                if round_num > 1:
                    current_round_responses = [resp for resp in debate_log if resp['round'] == round_num - 1]
                    current_context += "\n\n" + "\n\n".join([
                        f"{resp['agent']}: {resp['response']}"
                        for resp in current_round_responses
                    ])
                
                response = self.get_agent_response(
                    agent_key, 
                    idea, 
                    context=current_context,
                    previous_debate="",
                    user_feedback=user_feedback
                )
                round_responses.append({
                    'agent': self.agents[agent_key]['name'],
                    'response': response,
                    'round': len(previous_debate_log) // len(self.agents) + round_num,
                    'fallback': not self.check_api_quota()
                })
            
            # Add round responses to debate log
            debate_log.extend(round_responses)
            
            # Check if we've hit quota limit
            if not self.check_api_quota():
                break
        
        return debate_log
    
    def aggregate_results(self, idea, debate_log):
        """Aggregate debate results into PRD format"""
        # Check if we should use fallback aggregation
        if not self.check_api_quota():
            return self._get_fallback_aggregation(idea, debate_log)
        
        # Create summary of all responses
        all_responses = "\n\n".join([
            f"{resp['agent']} (Round {resp['round']}): {resp['response']}"
            for resp in debate_log
        ])
        
        aggregation_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert product strategist who can synthesize multiple stakeholder perspectives into a comprehensive Product Requirements Document (PRD)."""),
            ("human", f"""Product Idea: {idea}

            Stakeholder Debate Summary:
            {all_responses}

            Based on this multi-stakeholder debate, create a comprehensive Product Requirements Document (PRD) with the following 10 sections:

            1. OVERVIEW:
            - Give an overview about the product, what it intends to do, and its purpose
            - Provide a clear, concise description of the product vision

            2. PROBLEM STATEMENT:
            - What problem are we solving and how does it improve or facilitate the user's life or workflow
            - Clearly articulate the pain points and value proposition

            3. DEBATE SUMMARY (AGENT PERSPECTIVES):
            - Capture the perspectives of all key stakeholders (Business, Engineer, Designer, Customer, Product Manager)
            - Summarize their concerns, priorities, and any conflicts, followed by the final consensus or decision

            4. OBJECTIVES:
            - List the high-level goals of the product
            - These are guiding principles that describe what success looks like and how the product will deliver value to users and the business

            5. SCOPE:
            - Define what will be delivered in this product version (in-scope) and what will not be delivered (out-of-scope)
            - This ensures alignment and prevents scope creep
            - Include both In-Scope and Out-of-Scope sections

            6. REQUIREMENTS:
            - Functional Requirements: Clearly defined features the product must have to work as intended (e.g., "system must allow users to…")
            - Non-Functional Requirements: Qualities the system must exhibit, such as performance, scalability, security, or usability standards

            7. USER STORIES:
            - Describe the product from the end-user's perspective using the format: "As a [role], I want [feature], so that [benefit]."
            - This ensures features are directly tied to user needs

            8. TRADE-OFFS & DECISIONS:
            - Document any compromises made during discussions
            - Which features were deprioritized, what was postponed to a later version, and why those choices were made

            9. NEXT STEPS:
            - List concrete action items after the PRD is agreed upon
            - These could include development milestones, design deliverables, testing timelines, or launch preparations

            10. SUCCESS METRICS:
            - Define how success will be measured
            - These are KPIs (Key Performance Indicators) or benchmarks that indicate whether the product achieved its goals

            Format your response clearly with these 10 numbered sections. Each section should be comprehensive and actionable.""")
        ])
        
        try:
            self.increment_api_calls()
            response = self.llm.invoke(aggregation_prompt.format_messages())
            return response.content
        except Exception as e:
            error_msg = str(e)
            if "quota" in error_msg.lower() or "rate limit" in error_msg.lower() or "429" in error_msg:
                self.api_calls_made = self.max_api_calls
                return self._get_fallback_aggregation(idea, debate_log)
            else:
                return f"Error aggregating results: {str(e)}"
    
    def _get_fallback_aggregation(self, idea, debate_log):
        """Provide fallback aggregation when API quota is exhausted"""
        # Extract key points from debate log
        key_points = []
        for resp in debate_log:
            if resp['response'] and len(resp['response']) > 50:
                key_points.append(f"{resp['agent']}: {resp['response'][:200]}...")
        
        fallback_aggregation = f"""Based on the stakeholder analysis of: {idea[:100]}...

1. OVERVIEW:
This product aims to address the identified market need through a comprehensive solution that balances user needs, technical feasibility, and business viability. The product will serve as a platform that connects users with the value they seek while maintaining sustainable business operations.

2. PROBLEM STATEMENT:
The core problem being solved is the gap between user needs and available solutions in the market. Users currently face challenges with existing tools and processes, leading to inefficiencies and unmet expectations. This product will streamline workflows and provide a more intuitive, effective solution.

3. DEBATE SUMMARY (AGENT PERSPECTIVES):
Product Manager: Focuses on product vision, strategy, feature prioritization, and roadmap.
Design Lead: Prioritizes usability, aesthetics, user experience, and accessibility.
Engineering Lead: Considers technical feasibility, architecture, scalability, and development timeline.
Marketing & Sales Head: Considers market positioning, customer acquisition, go-to-market strategy.
Business Manager: Analyzes profitability, scalability, revenue model, and long-term sustainability.

4. OBJECTIVES:
- Deliver a user-centric solution that addresses identified pain points
- Establish a sustainable business model with clear revenue streams
- Create a scalable, maintainable technical architecture
- Provide an intuitive, accessible user experience
- Achieve market differentiation and competitive advantage

5. SCOPE:
In-Scope: Core functionality, essential user features, basic integration capabilities, fundamental security measures, and primary user workflows.
Out-of-Scope: Advanced features, third-party integrations beyond core requirements, extensive customization options, and platform-specific optimizations for initial release.

6. REQUIREMENTS:
Functional Requirements:
- System must allow users to perform core tasks efficiently
- System must provide clear feedback and status updates
- System must support basic data management and retrieval
- System must ensure data security and privacy

Non-Functional Requirements:
- Performance: Response times under 2 seconds for key operations
- Scalability: Support for 10x user growth without major rearchitecture
- Security: Industry-standard encryption and authentication
- Usability: Intuitive interface requiring minimal training

7. USER STORIES:
- As a primary user, I want to complete my main tasks quickly, so that I can be more productive
- As a business user, I want to track my usage and results, so that I can measure value
- As a technical user, I want reliable performance, so that I can depend on the system
- As a new user, I want an intuitive interface, so that I can get started without extensive training

8. TRADE-OFFS & DECISIONS:
- Speed to market vs. comprehensive feature set: Prioritizing core functionality for initial release
- Technical complexity vs. user experience: Ensuring usability while maintaining robust architecture
- Cost vs. quality: Balancing development resources with user expectations
- Scalability vs. development time: Planning for growth while maintaining development velocity

9. NEXT STEPS:
- Week 1-2: Finalize technical specifications and architecture
- Week 3-4: Create detailed design mockups and user flows
- Week 5-6: Develop MVP prototype with core functionality
- Week 7-8: Conduct user testing and gather feedback
- Week 9-10: Iterate based on feedback and prepare for development

10. SUCCESS METRICS:
- User Adoption: 80% of target users successfully complete onboarding
- Performance: 95% of operations complete within 2 seconds
- User Satisfaction: Average rating of 4.5/5 on usability surveys
- Business Metrics: Achieve 20% month-over-month user growth
- Technical Metrics: 99.9% uptime and <1% error rate

Note: This analysis was generated using fallback responses due to API quota limitations. For more detailed AI-powered analysis, please try again later when quota resets."""
        
        return fallback_aggregation
    
    def refine_requirements(self, idea):
        """Main function to create PRD using multi-agent debate"""
        try:
            # Reset API call counter for this session
            self.api_calls_made = 0
            
            # Run the debate
            debate_log = self.run_debate(idea, rounds=4)
            
            # Check if we used fallback responses
            used_fallback = any(resp.get('fallback', False) for resp in debate_log)
            
            # Aggregate results
            prd_content = self.aggregate_results(idea, debate_log)
            
            return {
                'success': True,
                'debate_log': debate_log,
                'prd_content': prd_content,
                'used_fallback': used_fallback or not self.check_api_quota(),
                'api_calls_made': self.api_calls_made
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'debate_log': [],
                'prd_content': "",
                'used_fallback': True,
                'api_calls_made': self.api_calls_made
            }
    
    def refine_requirements_with_feedback(self, idea, previous_debate_log, user_feedback):
        """Create PRD based on user feedback and previous debate"""
        try:
            # Reset API call counter for this session
            self.api_calls_made = 0
            
            # Run feedback-based debate
            debate_log = self.run_feedback_debate(idea, previous_debate_log, user_feedback)
            
            # Check if we used fallback responses
            used_fallback = any(resp.get('fallback', False) for resp in debate_log)
            
            # Aggregate results
            prd_content = self.aggregate_results(idea, debate_log)
            
            return {
                'success': True,
                'debate_log': debate_log,
                'prd_content': prd_content,
                'used_fallback': used_fallback or not self.check_api_quota(),
                'api_calls_made': self.api_calls_made
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'debate_log': [],
                'prd_content': "",
                'used_fallback': True,
                'api_calls_made': self.api_calls_made
            }
