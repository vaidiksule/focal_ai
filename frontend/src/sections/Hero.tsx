"use client"

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from "../components/button"
import starsBg from "../assets/stars.png"

export const Hero = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <section 
      className="h-[600px] flex items-start pt-16 overflow-hidden relative"
      style={{
        backgroundImage: `url(${starsBg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* THE HERO SECTION PLANET THINGY */}

      {/* CONTENT */}
      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <h1 className="text-center text-8xl md:text-9xl lg:text-[200px] font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(5,38,89))] text-transparent bg-clip-text">
          focal.ai
        </h1>
        <p className="text-center mt-6 text-lg md:text-xl lg:text-2xl text-white/60 max-w-4xl mx-auto">
          Transform your ideas into comprehensive PRDs through AI-powered stakeholder debate. <br /> Skip endless meetings, get instant consensus from 5 specialized AI agents. <br />Because the smartest answer is never from one voice.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
          {/* <Button /> */}
          {status !== 'authenticated' && (
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          )}
        </div>
      </div>
    </section>
  )
}