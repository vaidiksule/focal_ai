'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Brain,
  AlertTriangle,
  Users
} from 'lucide-react';
import AgentWorkloadChart from './AgentWorkloadChart';
import ResponseMetricsChart from './ResponseMetricsChart';
import IterationProgressChart from './IterationProgressChart';
import StakeholderAlignmentChart from './StakeholderAlignmentChart';
import PDFGenerator from './PDFGenerator';
import DebateFlowLineGraph from './DebateFlowLineGraph';
import { RefinementResult, FeedbackIteration } from '../types/types';
import { pdf } from '@react-pdf/renderer';

// Helper function to format markdown text
const formatMarkdownText = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-300 font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-cyan-300 italic">$1</em>')
    .replace(/^(\d+)\./gm, '<span class="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-500 to-cyan-500 rounded-full text-white text-sm font-bold mr-4 shadow-xl border-2 border-white/20 relative overflow-hidden"><span class="relative z-10">$1</span><div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div></span>')
    .replace(/\*\*Priority (\d+):\*\*/g, '<div class="flex items-center mb-8"><div class="w-12 h-12 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4 shadow-xl border-2 border-yellow-300/30 relative overflow-hidden"><Award className="w-6 h-6 text-white relative z-10" /><div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div></div><span class="text-2xl font-bold text-yellow-300">Priority $1</span></div>')
    .replace(/\*\*Actionable:\*\*/g, '<span class="inline-block bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium mb-3 border border-green-500/30">Actionable</span>')
    .replace(/\*\*Balancing Strategy:\*\*/g, '<span class="inline-block bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium mb-3 border border-blue-500/30">Balancing Strategy</span>')
    .replace(/\*\*Decision:\*\*/g, '<span class="inline-block bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium mb-3 border border-purple-500/30">Decision</span>')
    .split('\n')
    .map((line, index) => {
      if (line.trim().startsWith('**Priority')) {
        return `<div class="mt-8 mb-6">${line}</div>`;
      }
      if (line.trim().startsWith('<span class="inline-flex')) {
        return `<div class="flex flex-col items-start mb-6 p-3 bg-white/5 rounded-lg border border-white/10">${line}</div>`;
      }
      if (line.trim().includes('**Actionable:**') || line.trim().includes('**Balancing Strategy:**') || line.trim().includes('**Decision:**')) {
        return `<div class="mt-4">${line}</div>`;
      }
      if (line.trim() === '') {
        return '<div class="h-3"></div>';
      }
      return `<div class="mb-3">${line}</div>`;
    })
    .join('');
};

// Timeline component for next steps
const TimelineComponent = ({ steps }: { steps: string[] }) => {
  return (
    <div className="space-y-8">
      {steps.map((step, index) => {
        const timeMatch = step.match(/\((\d+)\s*Month[s]?\)/);
        const timeText = timeMatch ? timeMatch[1] : '';
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.15,
              duration: 0.6,
              ease: "easeOut"
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="flex items-start space-x-6"
          >
            {/* Timeline dot */}
            <div className="flex-shrink-0">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-purple-600 via-purple-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl border-2 border-white/20 relative overflow-hidden"
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 0 25px rgba(147, 51, 234, 0.6)"
                }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-white text-sm font-bold relative z-10">{index + 1}</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
              </motion.div>
              {index < steps.length - 1 && (
                <motion.div 
                  className="w-1 h-16 bg-gradient-to-b from-purple-500 to-cyan-500 mx-auto mt-3 rounded-full"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
                />
              )}
            </div>
            
            {/* Content */}
            <motion.div 
              className="flex-1 bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm"
              whileHover={{ 
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderColor: "rgba(147, 51, 234, 0.3)"
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white text-lg">
                  {step.split('(')[0].replace(/^\d+\.\s*/, '')}
                </h4>
                {timeText && (
                  <motion.span 
                    className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium border border-purple-500/30"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.15 + 0.4, type: "spring", stiffness: 200 }}
                  >
                    {timeText} Month{timeText !== '1' ? 's' : ''}
                  </motion.span>
                )}
              </div>
              <div 
                className="text-purple-100 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMarkdownText(step) }}
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Feedback form component
const FeedbackForm = ({ onSubmit, isLoading, iterationNumber = 0 }: { onSubmit: (feedback: string) => void; isLoading: boolean; iterationNumber?: number }) => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim() && !isLoading) {
      onSubmit(feedback.trim());
      setFeedback('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-[#052659]/30 rounded-xl p-6 border border-[#26425A]"
    >
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#C38EB4] to-[#B6ABCF] flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white">
          Provide Feedback {iterationNumber > 0 && `(Iteration ${iterationNumber + 1})`}
        </h3>
      </div>
      
      <p className="text-[#E1CBD7] text-sm mb-4">
        What did you like or dislike about this analysis? Provide specific feedback to refine the requirements further.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-[#E1CBD7] mb-2">
            Your Feedback
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g., I liked the technical approach but the designer's suggestions were too complex. The business manager's revenue model needs more detail..."
            className="w-full px-4 py-3 border border-[#26425A] rounded-xl focus:ring-2 focus:ring-[#C38EB4] focus:border-transparent bg-[#021024]/50 text-white placeholder-[#E1CBD7]/50 resize-none transition-all duration-200"
            rows={4}
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={!feedback.trim() || isLoading}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#C38EB4] to-[#B6ABCF] text-white font-semibold rounded-xl hover:from-[#B6ABCF] hover:to-[#C38EB4] shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refining...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Refine Further (1 Credit)
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default function ResultsDisplay({ result, onFeedbackSubmit, isFeedbackLoading, iterations = [] }: { result: RefinementResult; onFeedbackSubmit?: (feedback: string) => void; isFeedbackLoading?: boolean; iterations?: FeedbackIteration[] }) {
  const [activeTab, setActiveTab] = useState<'requirements' | 'debate'>('requirements');

  if (!result.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-2xl p-6"
      >
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-200">Error</h3>
            <p className="text-red-100">{result.error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Parse the PRD content into sections
  const parsePRDSections = (prdText: string) => {
    const sections = {
      overview: '',
      problem_statement: '',
      debate_summary: '',
      objectives: '',
      scope: '',
      requirements: '',
      user_stories: '',
      trade_offs_decisions: '',
      next_steps: '',
      success_metrics: ''
    };

    const lines = prdText.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.toUpperCase().includes('1. OVERVIEW')) {
        currentSection = 'overview';
      } else if (trimmedLine.toUpperCase().includes('2. PROBLEM STATEMENT')) {
        currentSection = 'problem_statement';
      } else if (trimmedLine.toUpperCase().includes('3. DEBATE SUMMARY')) {
        currentSection = 'debate_summary';
      } else if (trimmedLine.toUpperCase().includes('4. OBJECTIVES')) {
        currentSection = 'objectives';
      } else if (trimmedLine.toUpperCase().includes('5. SCOPE')) {
        currentSection = 'scope';
      } else if (trimmedLine.toUpperCase().includes('6. REQUIREMENTS')) {
        currentSection = 'requirements';
      } else if (trimmedLine.toUpperCase().includes('7. USER STORIES')) {
        currentSection = 'user_stories';
      } else if (trimmedLine.toUpperCase().includes('8. TRADE-OFFS') || trimmedLine.toUpperCase().includes('8. TRADE OFFS')) {
        currentSection = 'trade_offs_decisions';
      } else if (trimmedLine.toUpperCase().includes('9. NEXT STEPS')) {
        currentSection = 'next_steps';
      } else if (trimmedLine.toUpperCase().includes('10. SUCCESS METRICS')) {
        currentSection = 'success_metrics';
      } else if (currentSection && trimmedLine) {
        sections[currentSection as keyof typeof sections] += trimmedLine + '\n';
      }
    }

    return sections;
  };

  // Use sections from backend if available, otherwise parse the PRD text
  const sections = result.sections || parsePRDSections(result.prd_content || '');
  
  // Parse next steps into individual steps
  const parseNextSteps = (nextStepsText: string) => {
    if (!nextStepsText || nextStepsText.trim() === '') {
      return [];
    }

    // Try different parsing strategies
    const lines = nextStepsText.split('\n').filter(line => line.trim());
    
    // Strategy 1: Look for numbered items (1., 2., etc.)
    let steps = lines.filter(line => line.trim().match(/^\d+\./));
    
    // Strategy 2: If no numbered items, look for bullet points (-, *, •)
    if (steps.length === 0) {
      steps = lines.filter(line => line.trim().match(/^[-*•]/));
    }
    
    // Strategy 3: If still no items, split by double newlines or look for key phrases
    if (steps.length === 0) {
      // Look for lines that contain action words
      steps = lines.filter(line => 
        line.trim().length > 10 && 
        /^(implement|create|develop|build|design|test|launch|deploy|analyze|research|plan|execute)/i.test(line.trim())
      );
    }
    
    // Strategy 4: If still nothing, just use non-empty lines
    if (steps.length === 0) {
      steps = lines.filter(line => line.trim().length > 5);
    }
    
    return steps.map(line => line.trim());
  };

  const nextSteps = parseNextSteps(sections.next_steps);

  // Debug logging
  console.log('Result sections:', result.sections);
  console.log('Parsed sections:', sections);
  console.log('Next steps:', nextSteps);
  console.log('Next steps text:', sections.next_steps);

  const handleDownloadPDF = async () => {
    try {
      // Generate PDF using the PDFGenerator component
      const pdfDoc = <PDFGenerator result={result} iterations={iterations} />;
      const pdfBlob = await pdf(pdfDoc).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `focal_ai_prd_${result.idea_id || new Date().getTime()}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <>
      {/* Main Results Container - Centered */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden max-w-7xl mx-auto"
      >
        {/* Fallback Warning Banner */}
        {result.fallback_used && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/30 p-4"
          >
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-200 mb-1">
                  API Quota Exceeded
                </h4>
                <p className="text-xs text-yellow-100">
                  {result.fallback_message || 'Analysis completed using fallback responses. For more detailed AI-powered analysis, please try again later when quota resets.'}
                </p>
              </div>
              {result.api_calls_made !== undefined && (
                <div className="text-xs text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded">
                  {result.api_calls_made} API calls used
                </div>
              )}
            </div>
          </motion.div>
        )}

      {/* Tab Navigation */}
      <div className="border-b border-white/10">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('requirements')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
              activeTab === 'requirements'
                ? 'text-white bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-b-2 border-purple-400'
                : 'text-purple-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-5 h-5 inline mr-2" />
              PRD Document
          </button>
          <button
            onClick={() => setActiveTab('debate')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
              activeTab === 'debate'
                ? 'text-white bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-b-2 border-purple-400'
                : 'text-purple-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Brain className="w-5 h-5 inline mr-2" />
            AI Debate ({result.debate_log?.length || 0})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'requirements' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
              {/* PRD Document */}
              {result.success && result.sections && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 rounded-xl p-8 border border-white/10 backdrop-blur-sm"
                >
                  {/* Download PDF Button */}
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-white flex items-center">
                      <svg className="w-8 h-8 mr-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PRD Document
                    </h3>
                    
                    <button
                      onClick={() => handleDownloadPDF()}
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-purple-200 hover:text-purple-100 px-6 py-3 rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 shadow-lg backdrop-blur-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium">Download PDF</span>
                    </button>
                  </div>
              <motion.div 
                className="flex flex-col items-center mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Target className="w-6 h-6 text-white" />
                </motion.div>
                    <h3 className="text-2xl font-bold text-white">Product Requirements Document (PRD)</h3>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl p-8 border border-purple-500/20 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.01 }}
              >
                    {/* Overview Section */}
                    {sections.overview && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-purple-200 mb-3 flex items-center">
                          <span className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
                          Overview
                        </h4>
                        <div 
                          className="text-purple-100 leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.overview) }}
                        />
                      </div>
                    )}

                    {/* Problem Statement Section */}
                    {sections.problem_statement && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-blue-200 mb-3 flex items-center">
                          <span className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
                          Problem Statement
                        </h4>
                        <div 
                          className="text-blue-100 leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.problem_statement) }}
                        />
                      </div>
                    )}

                    {/* Debate Summary Section */}
                    {sections.debate_summary && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-cyan-200 mb-3 flex items-center">
                          <span className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
                          Debate Summary (Agent Perspectives)
                        </h4>
                        <div 
                          className="text-cyan-100 leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.debate_summary) }}
                        />
                      </div>
                    )}

                    {/* Objectives Section */}
                    {sections.objectives && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-green-200 mb-3 flex items-center">
                          <span className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3 text-sm font-bold">4</span>
                          Objectives
                        </h4>
                        <div 
                          className="text-green-100 leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.objectives) }}
                        />
                      </div>
                    )}

                    {/* Scope Section */}
                    {sections.scope && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-yellow-200 mb-3 flex items-center">
                          <span className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mr-3 text-sm font-bold">5</span>
                          Scope
                        </h4>
                        <div 
                          className="text-yellow-100 leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.scope) }}
                        />
                </div>
                    )}

                    {/* Requirements Section */}
                    {sections.requirements && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-orange-200 mb-3 flex items-center">
                          <span className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mr-3 text-sm font-bold">6</span>
                          Requirements
                        </h4>
                        <div 
                          className="text-orange-100 leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.requirements) }}
                        />
              </div>
                    )}

                    {/* User Stories Section */}
                    {sections.user_stories && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-pink-200 mb-3 flex items-center">
                          <span className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center mr-3 text-sm font-bold">7</span>
                          User Stories
                        </h4>
                        <div 
                          className="text-pink-100 leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.user_stories) }}
                  />
                </div>
                    )}

                    {/* Trade-offs & Decisions Section */}
                    {sections.trade_offs_decisions && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-red-200 mb-3 flex items-center">
                          <span className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mr-3 text-sm font-bold">8</span>
                          Trade-offs & Decisions
                        </h4>
                        <div 
                          className="text-red-100 leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.trade_offs_decisions) }}
                        />
              </div>
                    )}

            {/* Next Steps Section */}
                    {sections.next_steps && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-indigo-200 mb-3 flex items-center">
                          <span className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center mr-3 text-sm font-bold">9</span>
                          Next Steps
                        </h4>
                        <div 
                          className="text-indigo-100 leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.next_steps) }}
                        />
                </div>
                    )}

                    {/* Success Metrics Section */}
                    {sections.success_metrics && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-teal-200 mb-3 flex items-center">
                          <span className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center mr-3 text-sm font-bold">10</span>
                          Success Metrics
                        </h4>
                        <div 
                          className="text-teal-100 leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownText(sections.success_metrics) }}
                        />
              </div>
                    )}

                    {/* Fallback raw content if sections parsing failed */}
                    {(!sections.overview && result.prd_content) && (
                      <div className="text-purple-100 leading-relaxed">
                        <div 
                          className="prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownText(result.prd_content) }}
                        />
                  </div>
                )}
            </motion.div>
              </motion.div>
              )}
          </motion.div>
        )}

        {activeTab === 'debate' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Brain className="w-6 h-6 mr-3 text-purple-400" />
              AI Stakeholder Debate
            </h3>
            
            {result.debate_log && result.debate_log.length > 0 && (
              <div className="space-y-4">
                {result.debate_log.map((debate, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-200 border border-purple-500/30">
                          <Users className="w-4 h-4 mr-2" />
                          {debate.agent}
                        </span>
                        <span className="text-sm text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
                          Round {debate.round}
                        </span>
                          {debate.fallback && (
                            <span className="text-xs text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded border border-yellow-500/30">
                              Fallback
                            </span>
                          )}
                        </div>
                    </div>
                    <div className="text-purple-100 leading-relaxed">
                      {debate.response}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Feedback Form - only show if we have a successful result and feedback handler */}
      {result.success && onFeedbackSubmit && (
        <FeedbackForm 
          onSubmit={onFeedbackSubmit} 
          isLoading={isFeedbackLoading || false} 
            iterationNumber={iterations.length}
          />
        )}
        
        {/* Feedback Iterations */}
        {iterations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="border-t border-white/10 pt-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Feedback Iterations ({iterations.length})
              </h3>
              
              <div className="space-y-6">
                {iterations.map((iteration, index) => (
                  <motion.div
                    key={iteration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
                  >
                    {/* Iteration Header */}
                    <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 p-4 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-200 border border-purple-500/30">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Iteration {index + 1}
                          </span>
                          <span className="text-sm text-purple-300">
                            {iteration.timestamp.toLocaleString()}
                          </span>
                        </div>
                        {iteration.result.fallback_used && (
                          <span className="text-xs text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded border border-yellow-500/30">
                            Fallback
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* User Feedback */}
                    <div className="p-4 bg-blue-500/10 border-b border-white/10">
                      <h4 className="text-sm font-semibold text-blue-200 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Your Feedback
                      </h4>
                      <p className="text-blue-100 text-sm leading-relaxed">
                        {iteration.feedback}
                      </p>
                    </div>
                    
                    {/* Refined Results */}
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-green-200 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Refined Requirements
                      </h4>
                      
                      {/* Show sections if available */}
                      {iteration.result.sections ? (
                        <div className="space-y-4">
                          {iteration.result.sections.overview && (
                            <div>
                              <h5 className="text-xs font-medium text-purple-300 mb-2">Overview:</h5>
                              <div className="text-sm text-purple-100 bg-purple-500/10 p-3 rounded border border-purple-500/20">
                                {iteration.result.sections.overview}
                              </div>
                            </div>
                          )}
                          
                          {iteration.result.sections.problem_statement && (
                            <div>
                              <h5 className="text-xs font-medium text-blue-300 mb-2">Problem Statement:</h5>
                              <div className="text-sm text-blue-100 bg-blue-500/10 p-3 rounded border border-blue-500/20">
                                {iteration.result.sections.problem_statement}
                              </div>
                            </div>
                          )}
                          
                          {iteration.result.sections.objectives && (
                            <div>
                              <h5 className="text-xs font-medium text-green-300 mb-2">Objectives:</h5>
                              <div className="text-sm text-green-100 bg-green-500/10 p-3 rounded border border-green-500/20">
                                {iteration.result.sections.objectives}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-purple-100 bg-purple-500/10 p-3 rounded border border-purple-500/20">
                          {iteration.result.prd_content}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Analytics Dashboard - FULL WIDTH, Outside Main Container */}
      {result.success && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 mb-8 w-full"
        >
          <div className="border-t border-white/10 pt-10 w-full">
            <div className="max-w-7xl mx-auto px-6">
              <h3 className="text-3xl font-bold text-white mb-10 flex items-center">
                <svg className="w-10 h-10 mr-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics Dashboard
              </h3>
            </div>
            
            {/* Full-width Charts Container */}
            <div className="w-full px-6">
              {/* ChartsDisplay Component - Full Width */}
              <div className="w-full mb-8">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-8 border border-blue-500/20 shadow-lg w-full">
                  <h4 className="text-xl font-semibold text-blue-200 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Debate Flow Visualization
                  </h4>
                  
                  {/* Custom Line Graph for Debate Flow */}
                  <div className="w-full h-80 bg-white/5 rounded-lg p-4 border border-white/10">
                    <DebateFlowLineGraph debateLog={result.debate_log || []} />
                  </div>
                </div>
              </div>

              {/* Analytics Charts Grid - Flexbox Layout */}
              <div className="flex flex-wrap gap-6 justify-start">
                {/* Agent Workload Chart */}
                <div className="flex-1 min-w-[400px] max-w-[500px]">
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20 shadow-lg h-full">
                    <h4 className="text-lg font-semibold text-green-200 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Agent Workload Distribution
                    </h4>
                    <AgentWorkloadChart debateLog={result.debate_log || []} />
                  </div>
                </div>

                {/* Response Metrics Chart */}
                <div className="flex-1 min-w-[400px] max-w-[500px]">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20 shadow-lg h-full">
                    <h4 className="text-lg font-semibold text-purple-200 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Response Metrics Analysis
                    </h4>
                    <ResponseMetricsChart debateLog={result.debate_log || []} />
                  </div>
                </div>

                {/* Iteration Progress Chart */}
                <div className="flex-1 min-w-[400px] max-w-[500px]">
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/20 shadow-lg h-full">
                    <h4 className="text-lg font-semibold text-orange-200 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Iteration Progress
                    </h4>
                    <IterationProgressChart iterations={iterations} />
                  </div>
                </div>

                {/* Stakeholder Alignment Chart */}
                <div className="flex-1 min-w-[400px] max-w-[500px]">
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-500/20 shadow-lg h-full">
                    <h4 className="text-lg font-semibold text-cyan-200 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Stakeholder Alignment
                    </h4>
                    <StakeholderAlignmentChart debateLog={result.debate_log || []} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}