'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Coins, AlertTriangle } from 'lucide-react';
import InputBox from '../../components/InputBox';
import ResultsDisplay from '../../components/ResultsDisplay';
import LoadingAnimation from '../../components/LoadingAnimation';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../contexts/UserContext';

interface RefinementResult {
  success: boolean;
  idea_id?: string;
  refined_requirements?: string;
  sections?: {
    refined_requirements: string;
    trade_offs: string;
    next_steps: string;
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

export default function Dashboard() {
  const { session, isAuthenticated, isLoading, logout, redirectToHome } = useAuth();
  const { user, updateUser, forceRefreshUser, refreshing, error: userError } = useUser();
  const [idea, setIdea] = useState('');
  const [result, setResult] = useState<RefinementResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToHome();
    }
  }, [isAuthenticated, isLoading, redirectToHome]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#021024] via-[#052659] to-[#26425A] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleRefineRequirements = async (ideaText: string) => {
    // Check if user has enough credits
    if (!user || user.credits < 2) {
      alert('Insufficient credits. You need at least 2 credits to generate requirements.');
      return;
    }

    // Check if we have an ID token
    if (!session?.idToken) {
      alert('Authentication required. Please log in again.');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/refine/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.idToken}`,
        },
        body: JSON.stringify({ idea: ideaText }),
      });

      const data = await response.json();
      
      console.log('API Response:', data);
      console.log('Response status:', response.status);
      
      if (data.success) {
        // Update user data with the response to refresh credits
        if (data.user) {
          // Update the user context with new data (including updated credits)
          // This will trigger a re-render and show the new credit balance
          updateUser(data.user);
          console.log('User data updated:', data.user);
          
          // Show success message for credit update
          if (data.user.credits !== user?.credits) {
            const creditChange = (user?.credits || 0) - (data.user.credits || 0);
            console.log(`Credits updated: ${creditChange > 0 ? '-' : '+'}${Math.abs(creditChange)} credits`);
          }
        }
        console.log('Setting result with success data:', data);
        setResult(data);
      } else {
        console.log('Setting result with error data:', data);
        setResult(data);
      }
    } catch (error) {
      console.error('API call failed:', error);
      setResult({
        success: false,
        error: 'Failed to connect to the server. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    // Check if we have a result with idea_id
    if (!result?.idea_id) {
      alert('No idea found to provide feedback on.');
      return;
    }

    // Check if we have an ID token
    if (!session?.idToken) {
      alert('Authentication required. Please log in again.');
      return;
    }

    setFeedbackLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/refine-feedback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.idToken}`,
        },
        body: JSON.stringify({ 
          idea_id: result.idea_id,
          feedback: feedback 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update user data with the response to refresh credits
        if (data.user) {
          updateUser(data.user);
          console.log('User data updated after feedback:', data.user);
        }
        
        // Update the result with new data
        setResult(data);
        console.log('Requirements refined with feedback:', data);
      } else {
        alert(data.error || 'Failed to refine requirements with feedback.');
      }
    } catch (error) {
      console.error('Feedback API call failed:', error);
      alert('Failed to connect to the server. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021024] via-[#052659] to-[#26425A] relative overflow-hidden">
      {/* Animated background elements - reduced opacity for matte look */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#C38EB4] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#B6ABCF] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-[#E1CBD7] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center py-8 px-6 max-w-7xl mx-auto"
        >
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-white via-[#E1CBD7] to-[#B6ABCF] bg-clip-text text-transparent mb-4 tracking-tight">
              🧠 Focal AI
            </h1>
            <p className="text-[#E1CBD7] text-xl max-w-2xl mx-auto font-light leading-relaxed">
              AI-powered requirement refinement through multi-agent stakeholder simulation
            </p>
          </div>
          
          {/* User Menu with Credits and Avatar */}
          <div className="flex items-center space-x-4">
            {/* Credits Display */}
            <div className="flex items-center space-x-2 bg-[#052659]/30 rounded-xl px-4 py-2 border border-[#26425A]">
              <Coins className="w-5 h-5 text-[#C38EB4]" />
              <span className="text-white text-sm font-medium">
                {user?.credits || 0} Credits
              </span>
              <button
                onClick={forceRefreshUser}
                disabled={refreshing}
                className="ml-2 p-1 hover:bg-[#052659]/50 rounded transition-colors disabled:opacity-50"
                title="Refresh credits"
              >
                {refreshing ? (
                  <svg className="w-4 h-4 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3 bg-[#052659]/30 rounded-xl px-4 py-2 border border-[#26425A]">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name || 'User'} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-[#C38EB4] to-[#B6ABCF] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-white text-sm font-medium">
                {user?.name || session?.user?.name || 'User'}
              </span>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-4 py-2 rounded-xl border border-red-500/30 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </motion.header>

        {/* Credits Warning */}
        {user && user.credits < 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mb-6"
          >
            <div className="max-w-4xl mx-auto bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-200 font-medium">Low Credits</p>
                  <p className="text-yellow-300 text-sm">
                    You have {user.credits} credits remaining. You need at least 2 credits to generate requirements.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Input box at top */}
        <div className="px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <InputBox 
              value={idea}
              onChange={setIdea}
              onSubmit={handleRefineRequirements}
              disabled={loading || !!(user && user.credits < 2)}
              credits={user?.credits}
            />
          </div>
        </div>

        {/* Results area */}
        <div className="flex-1 px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  <LoadingAnimation />
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <ResultsDisplay 
                    result={result} 
                    onFeedbackSubmit={handleFeedbackSubmit}
                    isFeedbackLoading={feedbackLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}