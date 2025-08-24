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
            'business_manager': {
                'name': 'Business Manager',
                'focus': 'profit, scalability, market opportunity, revenue model',
                'system_prompt': """You are a Business Manager focused on profitability, scalability, and market opportunities. 
                Consider revenue models, market size, competitive advantages, and business viability. 
                Be practical about business constraints and opportunities."""
            },
            'engineer': {
                'name': 'Engineer',
                'focus': 'technical feasibility, implementation complexity, technology stack',
                'system_prompt': """You are a Senior Engineer focused on technical feasibility and implementation. 
                Consider technology stack, development complexity, scalability, security, and technical constraints. 
                Be realistic about what can be built and how long it would take."""
            },
            'designer': {
                'name': 'Designer',
                'focus': 'usability, aesthetics, user experience, interface design',
                'system_prompt': """You are a UX/UI Designer focused on user experience and design. 
                Consider usability, aesthetics, user flows, accessibility, and design principles. 
                Think about how users will interact with the product."""
            },
            'customer': {
                'name': 'Customer',
                'focus': 'needs, pain points, user value, real-world usage',
                'system_prompt': """You are a Customer representing end users. 
                Focus on real needs, pain points, user value, and how people would actually use this product. 
                Think about what problems this solves and what would make you want to use it."""
            },
            'product_manager': {
                'name': 'Product Manager',
                'focus': 'balance trade-offs, prioritize features, product strategy',
                'system_prompt': """You are a Product Manager focused on balancing trade-offs and product strategy. 
                Consider feature prioritization, user needs vs business needs, and how to create a successful product. 
                Think about the overall product vision and roadmap."""
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
            'business_manager': f"""As a Business Manager, I see potential in this idea: {idea[:100]}... 

Key considerations: Market opportunity, revenue potential, scalability, and competitive positioning need careful evaluation.

Challenges: Need to validate market demand and develop a sustainable business model.

Suggestions: Conduct market research, define clear value proposition, and establish revenue streams.""",
            
            'engineer': f"""As an Engineer, I'm analyzing the technical feasibility of: {idea[:100]}...

Key considerations: Technology stack selection, development complexity, scalability requirements, and security considerations.

Challenges: Ensuring robust architecture and meeting performance requirements.

Suggestions: Start with MVP approach, choose proven technologies, and plan for scalability.""",
            
            'designer': f"""As a Designer, I'm thinking about the user experience for: {idea[:100]}...

Key considerations: User interface design, user flows, accessibility, and overall user experience.

Challenges: Creating intuitive and engaging user interactions.

Suggestions: Focus on user research, create wireframes, and test with real users.""",
            
            'customer': f"""As a Customer, I'm considering if I would use: {idea[:100]}...

Key considerations: Does this solve a real problem I have? Is it easy to use? What's the value to me?

Challenges: Understanding if this addresses actual user needs and pain points.

Suggestions: Validate with target users, focus on core value proposition, and ensure ease of use.""",
            
            'product_manager': f"""As a Product Manager, I'm evaluating the product strategy for: {idea[:100]}...

Key considerations: Feature prioritization, user needs vs business needs, and product-market fit.

Challenges: Balancing competing priorities and creating a successful product roadmap.

Suggestions: Define clear success metrics, prioritize features based on user value, and iterate based on feedback."""
        }
        
        return fallback_responses.get(agent_key, f"Analysis from {self.agents[agent_key]['name']}: {idea[:100]}...")
    
    def run_debate(self, idea, rounds=ROUNDS):
        """Run multi-agent debate for the given idea - optimized for rate limits"""
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
        
        # Single round with all agents to reduce API calls
        round_responses = []
        
        for agent_key in self.agents.keys():
            response = self.get_agent_response(agent_key, idea, "")
            round_responses.append({
                'agent': self.agents[agent_key]['name'],
                'response': response,
                'round': 1,
                'fallback': not self.check_api_quota()  # Mark if we hit quota during processing
            })
        
        # Add responses to debate log
        debate_log.extend(round_responses)
        
        return debate_log
    
    def run_feedback_debate(self, idea, previous_debate_log, user_feedback):
        """Run multi-agent debate based on user feedback and previous discussion"""
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
        
        # Single round with all agents considering feedback
        round_responses = []
        
        for agent_key in self.agents.keys():
            response = self.get_agent_response(
                agent_key, 
                idea, 
                context="",
                previous_debate=previous_debate_context,
                user_feedback=user_feedback
            )
            round_responses.append({
                'agent': self.agents[agent_key]['name'],
                'response': response,
                'round': len(previous_debate_log) // len(self.agents) + 1,
                'fallback': not self.check_api_quota()
            })
        
        # Add responses to debate log
        debate_log.extend(round_responses)
        
        return debate_log
    
    def aggregate_results(self, idea, debate_log):
        """Aggregate debate results into refined requirements"""
        # Check if we should use fallback aggregation
        if not self.check_api_quota():
            return self._get_fallback_aggregation(idea, debate_log)
        
        # Create summary of all responses
        all_responses = "\n\n".join([
            f"{resp['agent']} (Round {resp['round']}): {resp['response']}"
            for resp in debate_log
        ])
        
        aggregation_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert product strategist who can synthesize multiple stakeholder perspectives into clear, actionable requirements."""),
            ("human", f"""Product Idea: {idea}

            Stakeholder Debate Summary:
            {all_responses}

            Based on this multi-stakeholder debate, create a comprehensive requirements document with three sections:

            1. REFINED REQUIREMENTS:
            - List 5-8 key requirements that address the main concerns and opportunities identified
            - Be specific and actionable
            - Prioritize by importance

            2. TRADE-OFFS:
            - Identify 3-5 key trade-offs that need to be considered
            - Explain the implications of each choice
            - Suggest how to balance competing priorities

            3. NEXT STEPS:
            - Provide 3-5 concrete next steps to move forward
            - Include timeline suggestions
            - Identify key decisions that need to be made

            Format your response clearly with these three sections.""")
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

1. REFINED REQUIREMENTS:
- Conduct market research to validate demand and identify target users
- Define clear value proposition and competitive positioning
- Establish technical architecture and development roadmap
- Create user experience design and interface mockups
- Develop business model and revenue strategy
- Plan for scalability and future growth
- Address security and compliance requirements
- Establish success metrics and measurement framework

2. TRADE-OFFS:
- Speed to market vs. comprehensive feature set - balance MVP approach with user expectations
- Technical complexity vs. user experience - ensure technology choices support usability goals
- Cost vs. quality - prioritize features that deliver maximum user value
- Scalability vs. development time - plan for growth while maintaining development velocity
- User customization vs. simplicity - find the right balance for target users

3. NEXT STEPS:
- Week 1-2: Conduct user research and market validation
- Week 3-4: Create detailed technical specifications and architecture
- Week 5-6: Develop wireframes and user interface designs
- Week 7-8: Build MVP prototype and conduct user testing
- Week 9-10: Iterate based on feedback and prepare for development

Note: This analysis was generated using fallback responses due to API quota limitations. For more detailed AI-powered analysis, please try again later when quota resets."""
        
        return fallback_aggregation
    
    def refine_requirements(self, idea):
        """Main function to refine requirements using multi-agent debate"""
        try:
            # Reset API call counter for this session
            self.api_calls_made = 0
            
            # Run the debate
            debate_log = self.run_debate(idea, rounds=4)
            
            # Check if we used fallback responses
            used_fallback = any(resp.get('fallback', False) for resp in debate_log)
            
            # Aggregate results
            refined_requirements = self.aggregate_results(idea, debate_log)
            
            return {
                'success': True,
                'debate_log': debate_log,
                'refined_requirements': refined_requirements,
                'used_fallback': used_fallback or not self.check_api_quota(),
                'api_calls_made': self.api_calls_made
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'debate_log': [],
                'refined_requirements': "",
                'used_fallback': True,
                'api_calls_made': self.api_calls_made
            }
    
    def refine_requirements_with_feedback(self, idea, previous_debate_log, user_feedback):
        """Refine requirements based on user feedback and previous debate"""
        try:
            # Reset API call counter for this session
            self.api_calls_made = 0
            
            # Run feedback-based debate
            debate_log = self.run_feedback_debate(idea, previous_debate_log, user_feedback)
            
            # Check if we used fallback responses
            used_fallback = any(resp.get('fallback', False) for resp in debate_log)
            
            # Aggregate results
            refined_requirements = self.aggregate_results(idea, debate_log)
            
            return {
                'success': True,
                'debate_log': debate_log,
                'refined_requirements': refined_requirements,
                'used_fallback': used_fallback or not self.check_api_quota(),
                'api_calls_made': self.api_calls_made
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'debate_log': [],
                'refined_requirements': "",
                'used_fallback': True,
                'api_calls_made': self.api_calls_made
            }
