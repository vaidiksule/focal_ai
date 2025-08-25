"use client"

import { signIn, useSession } from 'next-auth/react'
import Gridbg from "../assets/grid-lines.png"
import { Button } from "../components/button"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion"
import { RefObject, useEffect, useRef } from "react"

//for follow mouse hover, we created a custom hook
const useRelativeMousePosition = (to: RefObject<HTMLDivElement | null>) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const updateMousePosition = (event: MouseEvent) => {
    if (!to.current) return
    const { top, left } = to.current.getBoundingClientRect()
    mouseX.set(event.x - left)
    mouseY.set(event.y - top)
  }

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
    }
  }, [])

  return [mouseX, mouseY]
}
//MAIN FUNCTION
export const CallToAction = () => {
  const borderedDivRef = useRef<HTMLDivElement>(null)

  const [mouseX, mouseY] = useRelativeMousePosition(borderedDivRef)

  const maskImage = useMotionTemplate`radial-gradient(50% 50% at ${mouseX}px ${mouseY}px, black, transparent)`
  return (
    <section className="p-20 md:p-28">
      <div
        ref={borderedDivRef}
        className="border border-white/10 py-28 rounded-xl overflow-hidden relative group bg-gradient-to-br from-[#052659]/20 to-black"
      >
        {/*this one for initial masking */}
        <div
          //we have a grop-hover class to help as manage teh bg-mask
          className="absolute inset-0 bg-[#052659] bg-blend-overlay [mask-image:radial-gradient(50%_50%_at_50%_35%,black,transparent)] group-hover:opacity-0 transition duration-1000"
          style={{
            backgroundImage: `url(${Gridbg.src})`,
          }}
        ></div>
        {/* this one for mouse hover */}
        <motion.div
          className="absolute inset-0 bg-[#052659] bg-blend-overlay  opacity-0 group-hover:opacity-100 transition duration-1000 "
          style={{
            maskImage,
            backgroundImage: `url(${Gridbg.src})`,
          }}
        ></motion.div>
        <div className="container max-w-7xl mx-auto px-6">
          <div className="relative">
            <h2 className="text-2xl md:text-2xl lg:text-4xl font-semibold tracking-tighter text-center max-w-lg mx-auto">
            Because the smartest answer <br /> is never from one voice.
            </h2>
            <p className="text-lg text-white/70 text-center mt-10 max-w-xl mx-auto">
            Transform your ideas into comprehensive PRDs through AI-powered stakeholder debate. Skip endless meetings, get instant consensus.
            </p>
            <div className="text-center mt-10">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button 
                  onClick={() => {
                    const element = document.getElementById('how-it-works')
                    if (element) {
                      // Calculate offset for sticky header
                      const headerHeight = 80; // Approximate header height
                      const elementPosition = element.offsetTop - headerHeight;
                      
                      window.scrollTo({
                        top: elementPosition,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className="inline-block bg-white/70 text-black px-8 py-4 rounded-lg font-medium hover:bg-white/80 transition-colors duration-200 cursor-pointer"
                >
                  See How It Works
                </button>
                
                {useSession().status !== 'authenticated' && (
                  <button
                    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#FFFFFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#FFFFFF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FFFFFF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#FFFFFF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Start Building Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}