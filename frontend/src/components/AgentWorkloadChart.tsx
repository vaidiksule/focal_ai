'use client';

import { motion } from 'framer-motion';
import { Users, Brain, Clock } from 'lucide-react';

interface DebateEntry {
  agent: string;
  response: string;
  round: number;
  fallback?: boolean;
}

interface AgentWorkloadChartProps {
  debateLog: DebateEntry[];
}

export default function AgentWorkloadChart({ debateLog }: AgentWorkloadChartProps) {
  // Calculate agent workload metrics
  const agentMetrics = debateLog.reduce((acc, entry) => {
    if (!acc[entry.agent]) {
      acc[entry.agent] = {
        count: 0,
        totalLength: 0,
        avgLength: 0,
        rounds: new Set(),
        fallbackCount: 0
      };
    }
    
    acc[entry.agent].count++;
    acc[entry.agent].totalLength += entry.response.length;
    acc[entry.agent].rounds.add(entry.round);
    if (entry.fallback) {
      acc[entry.agent].fallbackCount++;
    }
    
    return acc;
  }, {} as Record<string, {
    count: number;
    totalLength: number;
    avgLength: number;
    rounds: Set<number>;
    fallbackCount: number;
  }>);

  // Calculate averages and prepare data
  const chartData = Object.entries(agentMetrics).map(([agent, metrics]) => ({
    agent,
    count: metrics.count,
    avgLength: Math.round(metrics.totalLength / metrics.count),
    rounds: metrics.rounds.size,
    fallbackCount: metrics.fallbackCount,
    fallbackPercentage: Math.round((metrics.fallbackCount / metrics.count) * 100)
  }));

  // Sort by count (most active first)
  chartData.sort((a, b) => b.count - a.count);

  // Color palette for agents
  const agentColors = {
    'Business Manager': 'from-blue-500 to-blue-600',
    'Engineer': 'from-green-500 to-green-600',
    'Designer': 'from-purple-500 to-purple-600',
    'Customer': 'from-orange-500 to-orange-600',
    'Product Manager': 'from-pink-500 to-pink-600'
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-300">Total Responses</span>
          </div>
          <div className="text-lg font-bold text-white">{debateLog.length}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-300">Active Agents</span>
          </div>
          <div className="text-lg font-bold text-white">{chartData.length}</div>
        </div>
      </div>

      {/* Agent Workload Bars */}
      <div className="space-y-3">
        {chartData.map((data, index) => (
          <motion.div
            key={data.agent}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-lg p-4 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${agentColors[data.agent as keyof typeof agentColors] || 'from-gray-500 to-gray-600'}`} />
                <span className="font-medium text-white text-sm">{data.agent}</span>
              </div>
              <div className="flex items-center space-x-4 text-xs">
                <span className="text-gray-300">{data.count} responses</span>
                <span className="text-gray-400">{data.rounds} rounds</span>
              </div>
            </div>
            
            {/* Response Count Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Response Count</span>
                <span>{data.count}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.count / Math.max(...chartData.map(d => d.count))) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                />
              </div>
            </div>

            {/* Response Length Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Avg Length</span>
                <span>{data.avgLength} chars</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.avgLength / Math.max(...chartData.map(d => d.avgLength))) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.4, duration: 0.8 }}
                />
              </div>
            </div>

            {/* Fallback Indicator */}
            {data.fallbackCount > 0 && (
              <div className="flex items-center space-x-2 text-xs">
                <Clock className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400">
                  {data.fallbackCount} fallback response{data.fallbackCount > 1 ? 's' : ''} ({data.fallbackPercentage}%)
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
        <h5 className="text-xs font-medium text-gray-300 mb-2">Metrics Explained:</h5>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div>• <span className="text-blue-400">Response Count:</span> Total contributions</div>
          <div>• <span className="text-green-400">Avg Length:</span> Character count per response</div>
          <div>• <span className="text-purple-400">Rounds:</span> Debate rounds participated</div>
          <div>• <span className="text-yellow-400">Fallback:</span> API quota exceeded responses</div>
        </div>
      </div>
    </div>
  );
}
