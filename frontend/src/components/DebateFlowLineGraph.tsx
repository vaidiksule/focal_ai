'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DebateEntry {
  agent: string;
  response: string;
  round: number;
  fallback?: boolean;
}

interface DebateFlowLineGraphProps {
  debateLog: DebateEntry[];
}

const DebateFlowLineGraph = ({ debateLog }: DebateFlowLineGraphProps) => {
  // Get color for each agent
  const getAgentColor = (agent: string) => {
    const colors = {
      'Product Manager': '#8B5CF6', // Purple
      'Design Lead': '#06B6D4',     // Cyan
      'Engineering Lead': '#10B981', // Emerald
      'Marketing & Sales Head': '#F59E0B', // Amber
      'Business Manager': '#EF4444', // Red
      'default': '#6B7280' // Gray
    };
    return colors[agent as keyof typeof colors] || colors.default;
  };

  // Process debate data for visualization
  const chartData = useMemo(() => {
    if (!debateLog || debateLog.length === 0) {
      return {
        agents: [],
        rounds: [],
        dataPoints: [],
        maxRounds: 0
      };
    }

    // Get unique agents and rounds
    const agents = [...new Set(debateLog.map(entry => entry.agent))];
    const rounds = [...new Set(debateLog.map(entry => entry.round))].sort((a, b) => a - b);
    const maxRounds = Math.max(...rounds);

    // Create data points for each agent across rounds
    const dataPoints = agents.map(agent => {
      const agentData = rounds.map(round => {
        const entry = debateLog.find(d => d.agent === agent && d.round === round);
        if (entry) {
          // Calculate a "response intensity" score based on response length and content
          const responseLength = entry.response.length;
          const hasKeywords = /(important|critical|key|essential|priority|must|should)/i.test(entry.response);
          const isFallback = entry.fallback || false;
          
          // Score: 0-100 based on response quality and length
          let score = Math.min(100, Math.max(20, responseLength / 10));
          if (hasKeywords) score += 15;
          if (isFallback) score -= 20;
          
          return {
            round,
            score: Math.max(0, Math.min(100, score)),
            response: entry.response,
            fallback: isFallback
          };
        }
        return { round, score: 0, response: '', fallback: false };
      });

      return {
        agent,
        data: agentData,
        color: getAgentColor(agent)
      };
    });

    return { agents, rounds, dataPoints, maxRounds };
  }, [debateLog]);

  if (!chartData.dataPoints.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">No debate data available</p>
          <p className="text-sm">Start a discussion to see the flow visualization</p>
        </div>
      </div>
    );
  }

  const chartHeight = 280;
  const chartWidth = 100;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // Calculate scales
  const xScale = (round: number) => margin.left + (round - 1) * (innerWidth / Math.max(1, chartData.maxRounds - 1));
  const yScale = (score: number) => margin.top + innerHeight - (score / 100) * innerHeight;

  return (
    <div className="w-full h-full">
      {/* Chart Title and Legend */}
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-lg font-semibold text-white">Multi-Agent Discussion Flow</h5>
        <div className="flex items-center space-x-4">
          {chartData.agents.map((agent, index) => (
            <div key={agent} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getAgentColor(agent) }}
              />
              <span className="text-sm text-gray-300">{agent}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="relative w-full h-64 bg-gradient-to-b from-white/5 to-transparent rounded-lg border border-white/10 p-4">
        {/* Y-axis labels */}
        <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute left-0 right-0 bottom-0 flex justify-between text-xs text-gray-400 px-4">
          {chartData.rounds.map(round => (
            <span key={round}>Round {round}</span>
          ))}
        </div>

        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {/* Horizontal grid lines */}
          {[0, 25, 50, 75, 100].map((value, index) => (
            <line
              key={index}
              x1={margin.left}
              y1={yScale(value)}
              x2={margin.left + innerWidth}
              y2={yScale(value)}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Vertical grid lines */}
          {chartData.rounds.map(round => (
            <line
              key={round}
              x1={xScale(round)}
              y1={margin.top}
              x2={xScale(round)}
              y2={margin.top + innerHeight}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
        </svg>

        {/* Data lines and points */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
          {chartData.dataPoints.map((agentData, agentIndex) => {
            const points = agentData.data
              .filter(point => point.score > 0)
              .map(point => `${xScale(point.round)},${yScale(point.score)}`)
              .join(' ');

            return (
              <g key={agentData.agent}>
                {/* Line */}
                <polyline
                  fill="none"
                  stroke={agentData.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                  opacity="0.8"
                />
                
                {/* Data points */}
                {agentData.data
                  .filter(point => point.score > 0)
                  .map((point, pointIndex) => (
                    <motion.circle
                      key={`${agentData.agent}-${point.round}`}
                      cx={xScale(point.round)}
                      cy={yScale(point.score)}
                      r="6"
                      fill={agentData.color}
                      stroke="white"
                      strokeWidth="2"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        delay: agentIndex * 0.1 + pointIndex * 0.05,
                        duration: 0.3,
                        type: "spring",
                        stiffness: 200
                      }}
                      whileHover={{ 
                        scale: 1.3,
                        filter: "brightness(1.2)"
                      }}
                      className="cursor-pointer"
                    />
                  ))}
              </g>
            );
          })}
        </svg>

        {/* Round indicators */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
          {chartData.rounds.map(round => (
            <motion.div
              key={round}
              className="w-2 h-2 bg-blue-400 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: round * 0.1, duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Chart Statistics */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{chartData.maxRounds}</div>
          <div className="text-sm text-gray-400">Total Rounds</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{chartData.agents.length}</div>
          <div className="text-sm text-gray-400">Active Agents</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {Math.round(chartData.dataPoints.reduce((acc, agent) => 
              acc + agent.data.reduce((sum, point) => sum + point.score, 0) / agent.data.length, 0
            ) / chartData.dataPoints.length)}%
          </div>
          <div className="text-sm text-gray-400">Avg. Engagement</div>
        </div>
      </div>
    </div>
  );
};

export default DebateFlowLineGraph;
