'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, MessageSquare, CheckCircle } from 'lucide-react';

interface FeedbackIteration {
  id: string;
  feedback: string;
  result: {
    fallback_used?: boolean;
    api_calls_made?: number;
  };
  timestamp: Date;
}

interface IterationProgressChartProps {
  iterations: FeedbackIteration[];
}

export default function IterationProgressChart({ iterations }: IterationProgressChartProps) {
  if (iterations.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-white mb-2">No Iterations Yet</h4>
        <p className="text-orange-200 text-sm">
          Provide feedback to see how requirements evolve through iterations.
        </p>
      </div>
    );
  }

  // Calculate iteration metrics
  const iterationMetrics = iterations.map((iteration, index) => {
    const feedbackLength = iteration.feedback.length;
    const feedbackWords = iteration.feedback.split(/\s+/).length;
    const hasFallback = iteration.result?.fallback_used || false;
    const apiCalls = iteration.result?.api_calls_made || 0;
    
    return {
      iteration: index + 1,
      feedbackLength,
      feedbackWords,
      hasFallback,
      apiCalls,
      timestamp: iteration.timestamp,
      feedback: iteration.feedback
    };
  });

  // Calculate progression metrics
  const totalIterations = iterations.length;
  const avgFeedbackWords = Math.round(
    iterationMetrics.reduce((sum, m) => sum + m.feedbackWords, 0) / totalIterations
  );
  const fallbackIterations = iterationMetrics.filter(m => m.hasFallback).length;
  const totalApiCalls = iterationMetrics.reduce((sum, m) => sum + m.apiCalls, 0);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-300">Total Iterations</span>
          </div>
          <div className="text-lg font-bold text-white">{totalIterations}</div>
          <div className="text-xs text-gray-400">feedback cycles</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-300">Avg Feedback</span>
          </div>
          <div className="text-lg font-bold text-white">{avgFeedbackWords}</div>
          <div className="text-xs text-gray-400">words</div>
        </div>
      </div>

      {/* Iteration Timeline */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h5 className="text-sm font-medium text-white mb-4 flex items-center">
          <Clock className="w-4 h-4 mr-2 text-orange-400" />
          Iteration Timeline
        </h5>
        <div className="space-y-4">
          {iterationMetrics.map((metric, index) => (
            <motion.div
              key={metric.iteration}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Timeline connector */}
              {index < iterationMetrics.length - 1 && (
                <div className="absolute left-6 top-8 w-0.5 h-8 bg-gradient-to-b from-orange-500 to-orange-400" />
              )}
              
              <div className="flex items-start space-x-4">
                {/* Iteration number */}
                <div className="flex-shrink-0">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-white text-sm font-bold">{metric.iteration}</span>
                  </motion.div>
                </div>
                
                {/* Content */}
                <div className="flex-1 bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                      Iteration {metric.iteration}
                    </span>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-400">
                        {metric.timestamp.toLocaleDateString()}
                      </span>
                      {metric.hasFallback && (
                        <span className="text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded border border-yellow-500/30">
                          Fallback
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Feedback preview */}
                  <div className="text-xs text-gray-300 mb-2">
                    <span className="text-blue-400">{metric.feedbackWords} words</span> • 
                    <span className="text-purple-400 ml-2">{metric.feedbackLength} chars</span>
                    {metric.apiCalls > 0 && (
                      <span className="text-green-400 ml-2">• {metric.apiCalls} API calls</span>
                    )}
                  </div>
                  
                  {/* Feedback text */}
                  <p className="text-xs text-gray-200 line-clamp-2">
                    {metric.feedback}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progression Analysis */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h5 className="text-sm font-medium text-white mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
          Progression Analysis
        </h5>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Feedback Quality</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((avgFeedbackWords / 50) * 100, 100)}%` }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">{avgFeedbackWords}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">API Efficiency</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(100 - (totalApiCalls / (totalIterations * 6)) * 100, 0)}%` }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">{totalApiCalls}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Fallback Usage</span>
            <span className="text-sm font-medium text-yellow-400">
              {fallbackIterations} of {totalIterations} ({Math.round((fallbackIterations / totalIterations) * 100)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h5 className="text-sm font-medium text-white mb-3 flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
          Iteration Insights
        </h5>
        <div className="space-y-2 text-xs text-gray-300">
          <div>• <span className="text-green-400">{totalIterations}</span> feedback cycles completed</div>
          <div>• <span className="text-blue-400">{avgFeedbackWords}</span> words per feedback on average</div>
          <div>• <span className="text-purple-400">{totalApiCalls}</span> total API calls used</div>
          {fallbackIterations > 0 && (
            <div>• <span className="text-yellow-400">{fallbackIterations}</span> iterations used fallback responses</div>
          )}
          <div>• <span className="text-orange-400">Requirements refined</span> through iterative feedback</div>
        </div>
      </div>
    </div>
  );
}
