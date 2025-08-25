'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Users, Zap, Target, Palette, TrendingUp, MessageSquare, CheckCircle, Clock } from 'lucide-react';

interface Agent {
  name: string;
  role: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  status: 'waiting' | 'thinking' | 'responding' | 'completed';
  progress: number;
  message: string;
}

export default function LoadingAnimation() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [agents, setAgents] = useState<Agent[]>([
    {
      name: 'Product Manager',
      role: 'Product Vision & Strategy',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      status: 'waiting',
      progress: 0,
      message: 'Waiting to analyze...'
    },
    {
      name: 'Design Lead',
      role: 'UX & Visual Design',
      icon: Palette,
      color: 'from-cyan-500 to-cyan-600',
      status: 'waiting',
      progress: 0,
      message: 'Waiting to analyze...'
    },
    {
      name: 'Engineering Lead',
      role: 'Technical Feasibility',
      icon: Zap,
      color: 'from-emerald-500 to-emerald-600',
      status: 'waiting',
      progress: 0,
      message: 'Waiting to analyze...'
    },
    {
      name: 'Marketing Head',
      role: 'Market & Growth',
      icon: TrendingUp,
      color: 'from-amber-500 to-amber-600',
      status: 'waiting',
      progress: 0,
      message: 'Waiting to analyze...'
    },
    {
      name: 'Business Manager',
      role: 'Profitability & Scale',
      icon: Users,
      color: 'from-red-500 to-red-600',
      status: 'waiting',
      progress: 0,
      message: 'Waiting to analyze...'
    }
  ]);

  const phases = [
    'Initializing AI Agents...',
    'Analyzing Idea Requirements...',
    'Generating Stakeholder Perspectives...',
    'Facilitating Multi-Agent Debate...',
    'Synthesizing Final Requirements...',
    'Preparing PRD Document...'
  ];

  // Simulate agent activity
  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setCurrentPhase(prev => {
        if (prev < phases.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 3000);

    const agentInterval = setInterval(() => {
      setAgents(prevAgents => {
        return prevAgents.map(agent => {
          if (agent.status === 'waiting' && Math.random() > 0.7) {
            return { ...agent, status: 'thinking', message: 'Analyzing requirements...' };
          } else if (agent.status === 'thinking' && Math.random() > 0.6) {
            return { ...agent, status: 'responding', message: 'Formulating response...' };
          } else if (agent.status === 'responding' && Math.random() > 0.5) {
            return { ...agent, status: 'completed', message: 'Analysis complete!', progress: 100 };
          }
          
          // Update progress for active agents
          if (agent.status === 'thinking' || agent.status === 'responding') {
            const newProgress = Math.min(100, agent.progress + Math.random() * 15);
            return { ...agent, progress: newProgress };
          }
          
          return agent;
        });
      });
    }, 800);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(agentInterval);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="w-4 h-4" />;
      case 'thinking': return <Brain className="w-4 h-4" />;
      case 'responding': return <MessageSquare className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-gray-400';
      case 'thinking': return 'text-blue-400';
      case 'responding': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 max-w-4xl mx-auto">
      {/* Header with animated brain */}
      <div className="text-center mb-8">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-block mb-6"
        >
          <Brain className="w-20 h-20 text-purple-400 mx-auto" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-4"
        >
          AI Stakeholders Are Debating Your Idea
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-purple-200 text-lg mb-6"
        >
          Our multi-agent system is analyzing your idea from multiple leadership perspectives
        </motion.p>
      </div>

      {/* Current Phase Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Current Phase</h4>
          <span className="text-sm text-purple-300">{currentPhase + 1} of {phases.length}</span>
        </div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentPhase + 1) / phases.length) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
        />
        
        <motion.p
          key={currentPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-purple-200 mt-3 text-lg font-medium"
        >
          {phases[currentPhase]}
        </motion.p>
      </div>

      {/* Agent Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm"
          >
            {/* Agent Header */}
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                animate={{ 
                  scale: agent.status === 'completed' ? 1 : [1, 1.1, 1],
                  opacity: agent.status === 'completed' ? 1 : [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: agent.status === 'completed' ? 0 : 2,
                  repeat: agent.status === 'completed' ? 0 : Infinity,
                  delay: index * 0.2
                }}
                className={`w-12 h-12 rounded-lg bg-gradient-to-r ${agent.color} flex items-center justify-center shadow-lg`}
              >
                <agent.icon className="w-6 h-6 text-white" />
              </motion.div>
              
              <div className="flex-1">
                <h5 className="font-semibold text-white text-sm">{agent.name}</h5>
                <p className="text-xs text-gray-400">{agent.role}</p>
              </div>
              
              <div className={`${getStatusColor(agent.status)}`}>
                {getStatusIcon(agent.status)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(agent.progress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${agent.progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-2 rounded-full bg-gradient-to-r ${agent.color}`}
                />
              </div>
            </div>

            {/* Status Message */}
            <motion.p
              key={agent.message}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-300 text-center"
            >
              {agent.message}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
          />
          <span className="text-purple-200 font-medium">Processing...</span>
        </div>
        
        <div className="text-sm text-gray-400">
          This usually takes 30-60 seconds depending on idea complexity
        </div>
      </div>
    </div>
  );
}
