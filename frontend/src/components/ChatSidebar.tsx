'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CheckCircle,
  Archive
} from 'lucide-react';
import { ChatSession, ChatMessage } from '../types/types';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  sessionToken: string | null;
}

export default function ChatSidebar({ 
  isOpen, 
  onToggle, 
  currentSessionId, 
  onSessionSelect, 
  onNewChat, 
  sessionToken 
}: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Fetch chat sessions on component mount
  useEffect(() => {
    if (isOpen) {
      fetchChatSessions();
    }
  }, [isOpen]);

  const fetchChatSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/sessions/list/`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessions(data.sessions);
        }
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this chat session?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/sessions/${sessionId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (response.ok) {
        // Remove from local state
        setSessions(sessions.filter(s => s._id !== sessionId));
        
        // If this was the current session, clear it
        if (currentSessionId === sessionId) {
          onSessionSelect('');
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleUpdateSession = async (sessionId: string) => {
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/sessions/${sessionId}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      if (response.ok) {
        // Update local state
        setSessions(sessions.map(s => 
          s._id === sessionId ? { ...s, title: editTitle.trim() } : s
        ));
        setEditingSession(null);
        setEditTitle('');
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed left-4 top-4 z-50 p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-white" />
        ) : (
          <ChevronRight className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed left-0 top-0 h-full w-80 bg-white/5 backdrop-blur-md border-r border-white/10 z-40"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Chat History
                </h2>
              </div>
              
              {/* New Chat Button */}
              <button
                onClick={onNewChat}
                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 text-white font-medium rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No chat sessions yet</p>
                  <p className="text-sm">Start a new chat to begin</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <motion.div
                      key={session._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group relative p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        currentSessionId === session._id
                          ? 'bg-purple-500/20 border-purple-500/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                      onClick={() => onSessionSelect(session._id)}
                    >
                      {/* Session Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(session.status)}
                          <span className="text-xs text-gray-400">
                            {formatDate(session.updated_at)}
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSession(session._id);
                              setEditTitle(session.title);
                            }}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <Edit3 className="w-3 h-3 text-gray-400 hover:text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session._id);
                            }}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Session Title */}
                      {editingSession === session._id ? (
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            placeholder="Enter title..."
                            autoFocus
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateSession(session._id)}
                              className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded hover:bg-green-500/30"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingSession(null);
                                setEditTitle('');
                              }}
                              className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded hover:bg-gray-500/30"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <h3 className="font-medium text-white text-sm line-clamp-2">
                          {session.title}
                        </h3>
                      )}

                      {/* Session Summary */}
                      {session.idea_summary && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                          {session.idea_summary}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
