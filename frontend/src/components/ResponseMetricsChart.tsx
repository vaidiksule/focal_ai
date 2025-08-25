'use client';

import { motion } from 'framer-motion';
import { BarChart3, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';

interface DebateEntry {
  agent: string;
  response: string;
  round: number;
  fallback?: boolean;
}

interface ResponseMetricsChartProps {
  debateLog: DebateEntry[];
}

export default function ResponseMetricsChart({ debateLog }: ResponseMetricsChartProps) {
  // Calculate response metrics
  const metrics = debateLog.reduce((acc, entry) => {
    const length = entry.response.length;
    const wordCount = entry.response.split(/\s+/).length;
    const hasFallback = entry.fallback || false;
    
    acc.totalResponses++;
    acc.totalLength += length;
    acc.totalWords += wordCount;
    acc.lengths.push(length);
    acc.wordCounts.push(wordCount);
    
    if (hasFallback) {
      acc.fallbackCount++;
    }
    
    // Categorize by length
    if (length < 100) acc.shortResponses++;
    else if (length < 300) acc.mediumResponses++;
    else acc.longResponses++;
    
    // Categorize by word count
    if (wordCount < 20) acc.shortWordCount++;
    else if (wordCount < 50) acc.mediumWordCount++;
    else acc.longWordCount++;
    
    return acc;
  }, {
    totalResponses: 0,
    totalLength: 0,
    totalWords: 0,
    lengths: [] as number[],
    wordCounts: [] as number[],
    fallbackCount: 0,
    shortResponses: 0,
    mediumResponses: 0,
    longResponses: 0,
    shortWordCount: 0,
    mediumWordCount: 0,
    longWordCount: 0
  });

  const avgLength = Math.round(metrics.totalLength / metrics.totalResponses);
  const avgWords = Math.round(metrics.totalWords / metrics.totalResponses);
  const fallbackPercentage = Math.round((metrics.fallbackCount / metrics.totalResponses) * 100);

  // Quality indicators
  const qualityScore = Math.round(
    ((metrics.mediumResponses + metrics.longResponses) / metrics.totalResponses) * 100
  );

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-300">Avg Length</span>
          </div>
          <div className="text-lg font-bold text-white">{avgLength}</div>
          <div className="text-xs text-gray-400">characters</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-300">Quality Score</span>
          </div>
          <div className="text-lg font-bold text-white">{qualityScore}%</div>
          <div className="text-xs text-gray-400">detailed responses</div>
        </div>
      </div>

      {/* Response Length Distribution */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h5 className="text-sm font-medium text-white mb-3 flex items-center">
          <BarChart3 className="w-4 h-4 mr-2 text-purple-400" />
          Response Length Distribution
        </h5>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Short (&lt; 100 chars)</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(metrics.shortResponses / metrics.totalResponses) * 100}%` }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">{metrics.shortResponses}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Medium (100-300 chars)</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(metrics.mediumResponses / metrics.totalResponses) * 100}%` }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">{metrics.mediumResponses}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Long (&gt; 300 chars)</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(metrics.longResponses / metrics.totalResponses) * 100}%` }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">{metrics.longResponses}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Word Count Analysis */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h5 className="text-sm font-medium text-white mb-3 flex items-center">
          <MessageSquare className="w-4 h-4 mr-2 text-cyan-400" />
          Word Count Analysis
        </h5>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Average Words</span>
            <span className="text-sm font-medium text-white">{avgWords}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Total Words</span>
            <span className="text-sm font-medium text-white">{metrics.totalWords.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Words per Response</span>
            <span className="text-sm font-medium text-white">{Math.round(metrics.totalWords / metrics.totalResponses)}</span>
          </div>
        </div>
      </div>

      {/* Fallback Analysis */}
      {metrics.fallbackCount > 0 && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h5 className="text-sm font-medium text-white mb-3 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
            Fallback Response Analysis
          </h5>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Fallback Responses</span>
              <span className="text-sm font-medium text-yellow-400">{metrics.fallbackCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Fallback Percentage</span>
              <span className="text-sm font-medium text-yellow-400">{fallbackPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${fallbackPercentage}%` }}
                transition={{ delay: 0.8, duration: 0.8 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quality Insights */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h5 className="text-sm font-medium text-white mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
          Quality Insights
        </h5>
        <div className="space-y-2 text-xs text-gray-300">
          <div>• <span className="text-green-400">{qualityScore}%</span> of responses are detailed (100+ chars)</div>
          <div>• <span className="text-blue-400">{Math.round((metrics.longResponses / metrics.totalResponses) * 100)}%</span> are comprehensive (300+ chars)</div>
          <div>• <span className="text-purple-400">{avgWords}</span> words per response on average</div>
          {metrics.fallbackCount > 0 && (
            <div>• <span className="text-yellow-400">{fallbackPercentage}%</span> used fallback responses due to API quota</div>
          )}
        </div>
      </div>
    </div>
  );
}
