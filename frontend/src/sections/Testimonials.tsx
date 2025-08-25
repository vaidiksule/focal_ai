"use client"

import { motion } from "framer-motion"
import { 
  Palette, 
  Code2, 
  TrendingUp, 
  ClipboardList, 
  Building2 
} from "lucide-react"

const agents = [
  {
    name: "Design Lead",
    icon: Palette,
    characteristics: "Creative vision, user empathy, visual storytelling",
    benefit: "Ensures your idea is not just functional but delightful and user-centered"
  },
  {
    name: "Engineering Lead", 
    icon: Code2,
    characteristics: "Technical feasibility, scalability, performance",
    benefit: "Validates technical implementation and identifies potential roadblocks early"
  },
  {
    name: "Marketing & Sales Head",
    icon: TrendingUp,
    characteristics: "Market positioning, customer acquisition, revenue strategy",
    benefit: "Guarantees your idea has a clear path to market and sustainable growth"
  },
  {
    name: "Product Manager",
    icon: ClipboardList,
    characteristics: "Feature prioritization, roadmap planning, stakeholder alignment",
    benefit: "Transforms your vision into actionable, prioritized development plans"
  },
  {
    name: "Business Manager",
    icon: Building2,
    characteristics: "Financial modeling, risk assessment, strategic planning",
    benefit: "Ensures your idea is financially viable and strategically sound"
  }
]

export const Testimonials = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container max-w-7xl mx-auto px-6">
        <h2 className="text-5xl text-center lg:text-7xl font-semibold tracking-tighter">
          Meet our Agents
        </h2>
        <p className="text-white/70 max-w-2xl mx-auto text-center pt-5 text-lg md:text-xl tracking-tight">
          Each AI agent brings specialized expertise to evaluate your idea from every angle
        </p>
        <div className="space-y-8 mt-16">
          {/* First row - 3 agents */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.slice(0, 3).map((agent, index) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border border-white/15 p-8 rounded-xl bg-[linear-gradient(to_bottom_left,rgb(5,38,89,.3),black)] hover:border-white/25 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-white/10 border border-white/20">
                    <agent.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Characteristics</p>
                    <p className="text-white/80 text-sm">{agent.characteristics}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">How they help</p>
                    <p className="text-white/90 text-sm">{agent.benefit}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Second row - 2 agents centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {agents.slice(3, 5).map((agent, index) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index + 3) * 0.1 }}
                className="border border-white/15 p-8 rounded-xl bg-[linear-gradient(to_bottom_left,rgb(5,38,89,.3),black)] hover:border-white/25 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-white/10 border border-white/20">
                    <agent.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Characteristics</p>
                    <p className="text-white/80 text-sm">{agent.characteristics}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">How they help</p>
                    <p className="text-white/90 text-sm">{agent.benefit}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}