"use client"

import { motion } from "framer-motion"
import { signIn } from "next-auth/react"
import { 
  Clock, 
  Users, 
  DollarSign, 
  TrendingDown, 
  TrendingUp,
  Calendar,
  Zap,
  Target
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const stats = [
  {
    title: "Traditional Meetings",
    icon: Users,
    color: "text-red-400",
    bgColor: "bg-red-500/5",
    borderColor: "border-red-500/10",
    stats: [
      { label: "Time per decision", value: "4-6 hours", icon: Clock },
      { label: "People involved", value: "8-12 people", icon: Users },
      { label: "Cost per meeting", value: "$2,400", icon: DollarSign },
      { label: "Follow-up meetings", value: "3-5 meetings", icon: Calendar }
    ]
  },
  {
    title: "AI-Powered Decisions",
    icon: Zap,
    color: "text-green-400",
    bgColor: "bg-green-500/5",
    borderColor: "border-green-500/10",
    stats: [
      { label: "Time per decision", value: "15 minutes", icon: Clock },
      { label: "People involved", value: "1 person", icon: Users },
      { label: "Cost per decision", value: "$15", icon: DollarSign },
      { label: "Follow-up needed", value: "0 meetings", icon: Target }
    ]
  }
]

const savings = [
  {
    metric: "Time Saved",
    value: "95%",
    description: "From hours to minutes",
    icon: TrendingDown,
    color: "text-blue-400"
  },
  {
    metric: "Cost Reduction",
    value: "99%",
    description: "Massive cost savings",
    icon: TrendingDown,
    color: "text-green-400"
  },
  {
    metric: "Efficiency Gain",
    value: "20x",
    description: "Faster decision making",
    icon: TrendingUp,
    color: "text-purple-400"
  }
]

// Chart data
const timeData = [
  { month: 'Jan', traditional: 240, ai: 18 },
  { month: 'Feb', traditional: 280, ai: 22 },
  { month: 'Mar', traditional: 320, ai: 16 },
  { month: 'Apr', traditional: 360, ai: 12 },
  { month: 'May', traditional: 400, ai: 8 },
  { month: 'Jun', traditional: 440, ai: 5 }
]

const costData = [
  { month: 'Jan', traditional: 4800, ai: 20 },
  { month: 'Feb', traditional: 5600, ai: 25 },
  { month: 'Mar', traditional: 6400, ai: 18 },
  { month: 'Apr', traditional: 7200, ai: 12 },
  { month: 'May', traditional: 8000, ai: 8 },
  { month: 'Jun', traditional: 8800, ai: 5 }
]



export const StatsComparison = () => {
  return (
    <section id="stats-comparison" className="py-20 md:py-28">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-7xl font-semibold tracking-tighter mb-6">
            The Numbers Don&apos;t Lie
          </h2>
          <p className="text-white/70 max-w-3xl mx-auto text-lg md:text-xl">
            See how AI-powered decision making transforms your workflow from time-consuming meetings to instant insights
          </p>
        </div>

        {/* Main Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-16">
          {stats.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
                                                           className={`border ${section.borderColor} rounded-xl p-4 ${section.bgColor} backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300`}
            >
                             <div className="flex items-center gap-3 mb-4">
                 <div className={`p-2 rounded-lg ${section.bgColor} border ${section.borderColor}`}>
                   <section.icon className={`h-5 w-5 ${section.color}`} />
                 </div>
                 <h3 className={`text-lg font-semibold ${section.color}`}>
                   {section.title}
                 </h3>
               </div>
              
                             <div className="space-y-3">
                 {section.stats.map((stat, statIndex) => (
                   <motion.div
                     key={stat.label}
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.4, delay: (index * 0.2) + (statIndex * 0.1) }}
                     className="flex items-center justify-between p-2 rounded-lg bg-white/3 border border-white/5 hover:bg-white/8 transition-colors duration-200"
                   >
                     <div className="flex items-center gap-2">
                       <stat.icon className="h-3 w-3 text-white/60" />
                       <span className="text-white/80 text-xs">{stat.label}</span>
                     </div>
                     <span className={`text-sm font-semibold ${section.color}`}>
                       {stat.value}
                     </span>
                   </motion.div>
                 ))}
               </div>
            </motion.div>
          ))}
        </div>

         {/* Charts Section */}
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.3 }}
           className="mb-16"
         >
           <div className="text-center mb-12">
             <h3 className="text-3xl md:text-4xl font-semibold mb-4">
               Visual Impact
             </h3>
             <p className="text-white/70 text-lg">
               See the data that proves AI transformation
             </p>
           </div>

           

                       {/* Time Comparison Chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
            >
              <h4 className="text-lg font-semibold text-white mb-4 text-center">
                Decision Time Comparison
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#ffffff60" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#ffffff60" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}h`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #ffffff20',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '10px'
                    }}
                    labelFormatter={(label) => `Month: ${label}`}
                    formatter={(value, name) => [
                      `${value} hours`, 
                      name === 'traditional' ? 'Traditional Discussions' : 'AI Agent Discussions'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="traditional" 
                    stroke="#ef4444" 
                    strokeWidth={1.5}
                    dot={{ fill: '#ef4444', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, stroke: '#ef4444', strokeWidth: 1 }}
                    connectNulls={true}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ai" 
                    stroke="#22c55e" 
                    strokeWidth={1.5}
                    dot={{ fill: '#22c55e', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, stroke: '#22c55e', strokeWidth: 1 }}
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Cost Comparison Chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12"
            >
              <h4 className="text-lg font-semibold text-white mb-4 text-center">
                Decision Cost Comparison
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#ffffff60" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#ffffff60" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #ffffff20',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '10px'
                    }}
                    labelFormatter={(label) => `Month: ${label}`}
                    formatter={(value, name) => [
                      `$${value}`, 
                      name === 'traditional' ? 'Traditional Discussions' : 'AI Agent Discussions'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="traditional" 
                    stroke="#ef4444" 
                    strokeWidth={1.5}
                    dot={{ fill: '#ef4444', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, stroke: '#ef4444', strokeWidth: 1 }}
                    connectNulls={true}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ai" 
                    stroke="#22c55e" 
                    strokeWidth={1.5}
                    dot={{ fill: '#22c55e', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, stroke: '#22c55e', strokeWidth: 1 }}
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

           
         </motion.div>

         {/* Savings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-[#052659]/20 to-black border border-white/10 rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-semibold mb-4">
              The Impact
            </h3>
            <p className="text-white/70 text-lg">
              Transform your decision-making process with AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {savings.map((item, index) => (
              <motion.div
                key={item.metric}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className={`h-8 w-8 ${item.color}`} />
                </div>
                <div className={`text-4xl md:text-5xl font-bold mb-2 ${item.color}`}>
                  {item.value}
                </div>
                <div className="text-xl font-semibold text-white mb-2">
                  {item.metric}
                </div>
                <div className="text-white/60">
                  {item.description}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-white/80 text-lg mb-6">
            Ready to transform your decision-making process?
          </p>
          <button 
            onClick={() => {
              signIn('google', { callbackUrl: '/dashboard' });
            }}
            className="bg-white/90 text-black px-8 py-4 rounded-lg font-medium hover:bg-white transition-colors duration-200 cursor-pointer"
          >
            Start Building Your PRD
          </button>
        </motion.div>
      </div>
    </section>
  )
}