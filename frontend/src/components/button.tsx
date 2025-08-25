'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const Button = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleClick = () => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else {
      signIn('google', { callbackUrl: '/dashboard' });
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="relative py-4 px-6 rounded-lg font-medium text-medium bg-gradient-to-b from-[#031a3d] to-[#052659] shadow-[0px_0px_12px#052659] hover:shadow-[0px_0px_20px#052659] transition-all duration-300 hover:scale-105 group"
    >
      <div className="absolute inset-0">
        <div className="border rounded-lg border-white/20 absolute inset-0 group-hover:border-white/40 transition-colors duration-300"></div>
      </div>
      <span className="relative z-10">
        {status === 'loading' ? 'Loading...' : status === 'authenticated' ? 'Go to Dashboard' : 'Sign in with Google'}
      </span>
    </button>
  )
}