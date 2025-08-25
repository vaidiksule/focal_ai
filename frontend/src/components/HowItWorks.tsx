"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  Lightbulb, 
  Search, 
  Users, 
  FileText, 
  BarChart3, 
  Download,
  MessageSquare,
  RefreshCw,
  CheckCircle,
  ArrowRight,
  ZoomIn,
  ZoomOut
} from "lucide-react"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const flowSteps = [
  {
    id: 1,
    title: "Idea Input",
    description: "User submits an idea / product concept with context (domain, goals, audience)",
    icon: Lightbulb,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    id: 2,
    title: "AI Preprocessing",
    description: "Idea analyzed for keywords, domain, and complexity. Relevant startup roles selected",
    icon: Search,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    id: 3,
    title: "Multi-Agent Debate",
    description: "5 agents debate in 3 rounds: independent perspective → response → consensus",
    icon: Users,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  },
  {
    id: 4,
    title: "Debate Aggregation",
    description: "System merges multi-round debate into structured perspective log with key insights",
    icon: FileText,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  },
  {
    id: 5,
    title: "PRD Generation",
    description: "AI generates 10 structured sections from Overview to Success Metrics",
    icon: BarChart3,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20"
  },
  {
    id: 6,
    title: "Results Output",
    description: "PRD displayed in dashboard with analytics and PDF export option",
    icon: Download,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20"
  },
  {
    id: 7,
    title: "User Feedback Loop",
    description: "User reviews PRD and provides refinements / corrections",
    icon: MessageSquare,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20"
  },
  {
    id: 8,
    title: "Iterative Refinement",
    description: "Feedback triggers 2-round debate. Updated PRD generated with iteration history",
    icon: RefreshCw,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20"
  }
]

const prdSections = [
  "Overview", "Problem Statement", "Debate Summary", "Objectives",
  "Scope", "Requirements", "User Stories", "Trade-offs & Decisions",
  "Next Steps", "Success Metrics"
]

export const HowItWorks = () => {
  const [zoom, setZoom] = useState(1)
  const chartRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container align-center max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-7xl font-semibold tracking-tighter mb-6">
            How It Works
          </h2>
          <p className="text-white/70 max-w-3xl mx-auto text-lg md:text-xl">
            From idea to comprehensive PRD in minutes, not months
          </p>
        </div>

        {/* Zoomable Flow Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 flex justify-center"
        >
          <div className="h-[450px] w-full max-w-5xl border border-white/10 rounded-2xl overflow-hidden bg-gradient-to-br from-[#052659]/10 to-black/50 relative">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors duration-200"
              >
                <ZoomOut className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors duration-200"
              >
                <ZoomIn className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Zoomable Chart Container */}
            <div 
              ref={chartRef}
              onWheel={handleWheel}
              className="w-full h-full overflow-auto cursor-grab active:cursor-grabbing"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.3s ease-out'
              }}
            >
              <div className="min-w-full min-h-full flex items-center justify-center p-8">
                <div className="relative max-w-4xl">
                  {/* Row 1: Steps 1-4 */}
                  <div className="flex justify-center items-center space-x-4 mb-6">
                    {flowSteps.slice(0, 4).map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="relative"
                      >
                        {/* Flow Box */}
                        <div className={`border ${step.borderColor} rounded-lg p-3 w-40 ${step.bgColor} backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-2 rounded-lg ${step.bgColor} border ${step.borderColor}`}>
                              <step.icon className={`h-4 w-4 ${step.color}`} />
                            </div>
                            <h3 className={`text-xs font-semibold ${step.color}`}>
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-white/70 text-xs leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                        
                        {/* Arrow to next step */}
                        {index < 3 && (
                          <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: index * 0.1 + 0.5 }}
                            className="absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-white/80 to-white/40"
                          >
                            <ArrowRight className="absolute -right-1 -top-2 h-3 w-3 text-white/80" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Row 2: Steps 5-8 */}
                  <div className="flex justify-center items-center space-x-4">
                    {flowSteps.slice(4, 8).map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: (index + 4) * 0.1 }}
                        className="relative"
                      >
                        {/* Flow Box */}
                        <div className={`border ${step.borderColor} rounded-lg p-3 w-40 ${step.bgColor} backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-2 rounded-lg ${step.bgColor} border ${step.borderColor}`}>
                              <step.icon className={`h-4 w-4 ${step.color}`} />
                            </div>
                            <h3 className={`text-xs font-semibold ${step.color}`}>
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-white/70 text-xs leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                        
                        {/* Arrow to next step */}
                        {index < 3 && (
                          <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: (index + 4) * 0.1 + 0.5 }}
                            className="absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-white/80 to-white/40"
                          >
                            <ArrowRight className="absolute -right-1 -top-2 h-3 w-3 text-white/80" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PRD Sections */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-[#052659]/20 to-black border border-white/10 rounded-2xl p-8 md:p-12 mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl md:text-4xl font-semibold mb-4">
              Complete PRD Structure
            </h3>
            <p className="text-white/70 text-lg">
              AI generates 10 comprehensive sections for your product requirements document
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {prdSections.map((section, index) => (
              <motion.div
                key={section}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1 + (index * 0.05) }}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors duration-300"
              >
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-white/80 text-sm font-medium">{section}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 mb-4">
              <Users className="h-8 w-8 text-blue-400" />
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">Multi-Agent Debate</h4>
            <p className="text-white/60">
              5 specialized AI agents debate your idea from different perspectives
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 mb-4">
              <RefreshCw className="h-8 w-8 text-green-400" />
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">Iterative Refinement</h4>
            <p className="text-white/60">
              Continuous improvement through user feedback and agent re-debate
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 mb-4">
              <BarChart3 className="h-8 w-8 text-purple-400" />
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">Analytics & Insights</h4>
            <p className="text-white/60">
              Visual charts showing debate dynamics and agent contributions
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}