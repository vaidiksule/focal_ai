export interface RefinementResult {
  success: boolean;
  idea_id?: string;
  prd_content?: string;
  sections?: {
    overview: string;
    problem_statement: string;
    debate_summary: string;
    objectives: string;
    scope: string;
    requirements: string;
    user_stories: string;
    trade_offs_decisions: string;
    next_steps: string;
    success_metrics: string;
  };
  debate_log?: Array<{
    agent: string;
    response: string;
    round: number;
    fallback?: boolean;
  }>;
  error?: string;
  fallback_used?: boolean;
  fallback_message?: string;
  api_calls_made?: number;
}

export interface FeedbackIteration {
  id: string;
  feedback: string;
  result: RefinementResult;
  timestamp: Date;
}

export interface ChatSession {
  _id: string;
  user_id: string;
  title: string;
  idea_summary: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  _id: string;
  session_id: string;
  role: 'user' | 'product_manager' | 'design_lead' | 'engineering_lead' | 'marketing_sales_head' | 'business_manager' | 'system';
  content: string;
  round_number: number;
  timestamp: string;
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}
