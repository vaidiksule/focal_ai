'use client';

import { motion } from 'framer-motion';
import { Users, CheckCircle, AlertTriangle, TrendingUp, Target } from 'lucide-react';

interface DebateEntry {
  agent: string;
  response: string;
  round: number;
  fallback?: boolean;
}

interface StakeholderAlignmentChartProps {
  debateLog: DebateEntry[];
}

export default function StakeholderAlignmentChart({ debateLog }: StakeholderAlignmentChartProps) {
  // Analyze stakeholder alignment
  const agentAnalysis = debateLog.reduce((acc, entry) => {
    if (!acc[entry.agent]) {
      acc[entry.agent] = {
        responses: [],
        sentiment: 0,
        keyThemes: new Set(),
        conflicts: 0,
        agreements: 0
      };
    }
    
    acc[entry.agent].responses.push(entry.response);
    
    // Simple sentiment analysis based on keywords
    const response = entry.response.toLowerCase();
    let sentiment = 0;
    
    // Positive indicators
    if (response.includes('potential') || response.includes('opportunity') || response.includes('benefit')) sentiment += 1;
    if (response.includes('feasible') || response.includes('achievable') || response.includes('realistic')) sentiment += 1;
    if (response.includes('value') || response.includes('advantage') || response.includes('strength')) sentiment += 1;
    
    // Negative indicators
    if (response.includes('challenge') || response.includes('risk') || response.includes('concern')) sentiment -= 1;
    if (response.includes('complex') || response.includes('difficult') || response.includes('limitation')) sentiment -= 1;
    if (response.includes('expensive') || response.includes('costly') || response.includes('time-consuming')) sentiment -= 1;
    
    acc[entry.agent].sentiment += sentiment;
    
    // Extract key themes
    const themes = ['market', 'technical', 'user', 'business', 'design', 'cost', 'timeline', 'quality'];
    themes.forEach(theme => {
      if (response.includes(theme)) {
        acc[entry.agent].keyThemes.add(theme);
      }
    });
    
    return acc;
  }, {} as Record<string, {
    responses: string[];
    sentiment: number;
    keyThemes: Set<string>;
    conflicts: number;
    agreements: number;
  }>);

  // Calculate alignment metrics
  const alignmentData = Object.entries(agentAnalysis).map(([agent, data]) => {
    const avgSentiment = data.responses.length > 0 ? data.sentiment / data.responses.length : 0;
    const themeCount = data.keyThemes.size;
    const responseCount = data.responses.length;
    
    return {
      agent,
      avgSentiment,
      themeCount,
      responseCount,
      keyThemes: Array.from(data.keyThemes)
    };
  });

  // Calculate overall alignment score
  const totalResponses = alignmentData.reduce((sum, data) => sum + data.responseCount, 0);
  const avgSentiment = alignmentData.reduce((sum, data) => sum + (data.avgSentiment * data.responseCount), 0) / totalResponses;
  const alignmentScore = Math.round(((avgSentiment + 3) / 6) * 100); // Normalize to 0-100

  // Identify potential conflicts and agreements
  const allThemes = new Set(alignmentData.flatMap(data => data.keyThemes));
  const themeAlignment = Array.from(allThemes).map(theme => {
    const agentsWithTheme = alignmentData.filter(data => data.keyThemes.includes(theme));
    return {
      theme,
      agentCount: agentsWithTheme.length,
      alignment: agentsWithTheme.length / alignmentData.length
    };
  });

  return (
    <div className="space-y-4">
      {/* Overall Alignment Score */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
        <h5 className="text-sm font-medium text-white mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2 text-cyan-400" />
          Overall Stakeholder Alignment
        </h5>
        <div className="text-center">
          <motion.div
            className="text-4xl font-bold mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <span className={alignmentScore >= 70 ? 'text-green-400' : alignmentScore >= 40 ? 'text-yellow-400' : 'text-red-400'}>
              {alignmentScore}%
            </span>
          </motion.div>
          <div className="text-sm text-gray-300 mb-3">
            {alignmentScore >= 70 ? 'High Alignment' : alignmentScore >= 40 ? 'Moderate Alignment' : 'Low Alignment'}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              className={`h-3 rounded-full ${
                alignmentScore >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                alignmentScore >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-red-500 to-pink-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${alignmentScore}%` }}
              transition={{ delay: 0.4, duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Individual Agent Analysis */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h5 className="text-sm font-medium text-white mb-4 flex items-center">
          <Users className="w-4 h-4 mr-2 text-blue-400" />
          Individual Stakeholder Analysis
        </h5>
        <div className="space-y-3">
          {alignmentData.map((data, index) => (
            <motion.div
              key={data.agent}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-lg p-3 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{data.agent}</span>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-gray-400">{data.responseCount} responses</span>
                  <span className="text-gray-400">{data.themeCount} themes</span>
                </div>
              </div>
              
              {/* Sentiment Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Sentiment</span>
                  <span className={data.avgSentiment >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {data.avgSentiment >= 0 ? '+' : ''}{data.avgSentiment.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      data.avgSentiment >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.abs(data.avgSentiment) / 3 * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                  />
                </div>
              </div>
              
              {/* Key Themes */}
              <div className="flex flex-wrap gap-1">
                {data.keyThemes.map(theme => (
                  <span
                    key={theme}
                    className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Theme Alignment Analysis */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h5 className="text-sm font-medium text-white mb-3 flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
          Theme Alignment Analysis
        </h5>
        <div className="space-y-3">
          {themeAlignment
            .sort((a, b) => b.alignment - a.alignment)
            .map((theme, index) => (
              <div key={theme.theme} className="flex items-center justify-between">
                <span className="text-xs text-gray-300 capitalize">{theme.theme}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        theme.alignment >= 0.8 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        theme.alignment >= 0.6 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${theme.alignment * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.4, duration: 0.8 }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">
                    {Math.round(theme.alignment * 100)}%
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Alignment Insights */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h5 className="text-sm font-medium text-white mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
          Alignment Insights
        </h5>
        <div className="space-y-2 text-xs text-gray-300">
          {alignmentScore >= 70 && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>High stakeholder alignment - project likely to succeed</span>
            </div>
          )}
          {alignmentScore < 70 && alignmentScore >= 40 && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span>Moderate alignment - some stakeholder concerns to address</span>
            </div>
          )}
          {alignmentScore < 40 && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>Low alignment - significant stakeholder conflicts to resolve</span>
            </div>
          )}
          <div>• <span className="text-blue-400">{themeAlignment.filter(t => t.alignment >= 0.8).length}</span> highly aligned themes</div>
          <div>• <span className="text-yellow-400">{themeAlignment.filter(t => t.alignment < 0.6).length}</span> themes need attention</div>
          <div>• <span className="text-purple-400">{totalResponses}</span> total stakeholder responses analyzed</div>
        </div>
      </div>
    </div>
  );
}
