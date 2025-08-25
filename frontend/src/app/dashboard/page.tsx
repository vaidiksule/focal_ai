'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Coins, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import InputBox from '../../components/InputBox';
import ResultsDisplay from '../../components/ResultsDisplay';
import LoadingAnimation from '../../components/LoadingAnimation';
import ChatSidebar from '../../components/ChatSidebar';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../contexts/UserContext';
import { RefinementResult, FeedbackIteration, ChatSession, ChatMessage } from '../../types/types';

export default function Dashboard() {
  const { session, isAuthenticated, isLoading, logout, redirectToHome } = useAuth();
  const { user, updateUser, forceRefreshUser, refreshing } = useUser();
  const [idea, setIdea] = useState('');
  const [result, setResult] = useState<RefinementResult | null>(null);
  const [iterations, setIterations] = useState<FeedbackIteration[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  
  // Chat session management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToHome();
    }
  }, [isAuthenticated, isLoading, redirectToHome]);

  // Session management functions
  const handleNewChat = () => {
    setCurrentSessionId(null);
    setCurrentSession(null);
    setSessionMessages([]);
    setResult(null);
    setIterations([]);
    setIdea('');
    setSidebarOpen(false);
  };

  const handleSessionSelect = async (sessionId: string) => {
    if (!sessionId) {
      handleNewChat();
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/chat/sessions/${sessionId}/`, {
        headers: {
          'Authorization': `Bearer ${session?.idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentSessionId(sessionId);
          setCurrentSession(data.session);
          setSessionMessages(data.messages);
          
          // Try to reconstruct the result from session data
          if (data.session.idea_summary) {
            setIdea(data.session.idea_summary);
          }
          
          setSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const createChatSession = async (ideaText: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/chat/sessions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.idToken}`,
        },
        body: JSON.stringify({
          title: ideaText.substring(0, 50) + (ideaText.length > 50 ? '...' : ''),
          idea_summary: ideaText
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentSessionId(data.session_id);
          return data.session_id;
        }
      }
    } catch (error) {
      console.error('Error creating chat session:', error);
    }
    return null;
  };

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
    setIterations([]); // Clear previous iterations for new idea
    
    try {
      // Create or get chat session
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await createChatSession(ideaText);
      }
      
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
        
        // Create a new iteration instead of replacing the result
        const newIteration: FeedbackIteration = {
          id: `iteration-${Date.now()}`,
          feedback: feedback,
          result: data,
          timestamp: new Date()
        };
        
        // Add the new iteration to the list
        setIterations(prev => [...prev, newIteration]);
        console.log('New iteration created:', newIteration);
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
    <div className="min-h-screen bg-gradient-to-br from-[#021024] via-[#052659] to-[#26425A]">
      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        sessionToken={session?.idToken || null}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#052659]/40 to-[#26425A]/40 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                {/* <div className="w-12 h-12 bg-gradient-to-r from-[#C38EB4] to-[#B6ABCF] rounded-xl flex items-center justify-center shadow-lg"> */}
                  <Image
                    src="/icon.svg"
                    alt="Focal AI Logo"
                    width={55}
                    height={55}
                    className="text-white"
                  />
                {/* </div> */}
                <div>
                  <h1 className="text-2xl font-bold text-white">focal.ai</h1>
                  <p className="text-[#E1CBD7] text-sm">AI-Powered Requirement Refinement</p>
                </div>
              </div>
            
              {/* User Menu with Credits and Avatar - Right Aligned */}
              <div className="flex items-center space-x-4">
                {/* Credits Display */}
                <div className="flex items-center space-x-3 bg-gradient-to-r from-[#052659]/40 to-[#26425A]/40 rounded-xl px-5 py-3 border border-[#26425A]/50 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-5 h-5 text-[#C38EB4]" />
                    <span className="text-white text-sm font-semibold">
                      {user?.credits || 0} Credits
                    </span>
                  </div>
                  <button
                    onClick={forceRefreshUser}
                    disabled={refreshing}
                    className="ml-3 p-2 hover:bg-[#052659]/60 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-105"
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
                <div className="flex items-center space-x-3 bg-gradient-to-r from-[#052659]/40 to-[#26425A]/40 rounded-xl px-5 py-3 border border-[#26425A]/50 backdrop-blur-sm shadow-lg">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || 'User'}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-gradient-to-r from-[#C38EB4] to-[#B6ABCF] rounded-full flex items-center justify-center border-2 border-[#C38EB4]/30">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-semibold">
                      {user?.name || session?.user?.name || 'User'}
                    </span>
                    <span className="text-[#E1CBD7] text-xs opacity-80">
                      {user?.email || session?.user?.email || 'user@example.com'}
                    </span>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-300 hover:text-red-200 px-5 py-3 rounded-xl border border-red-500/40 transition-all duration-300 hover:scale-105 shadow-lg backdrop-blur-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Body Content */}
        <div className="mt-8 max-w-7xl mx-auto px-6 pb-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <InputBox
              value={idea}
              onChange={setIdea}
              onSubmit={handleRefineRequirements}
              disabled={loading || !!(user && user.credits < 2)}
              credits={user?.credits}
            />
          </motion.div>

          {/* Loading Animation */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <LoadingAnimation />
            </motion.div>
          )}

          {/* Results Display */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <ResultsDisplay
                result={result}
                onFeedbackSubmit={handleFeedbackSubmit}
                isFeedbackLoading={feedbackLoading}
                iterations={iterations}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}