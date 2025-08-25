'use client';

import { SessionProvider } from 'next-auth/react';
import { UserProvider } from '../contexts/UserContext';
import { usePathname } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <SessionProvider>
      {isDashboard ? (
        <UserProvider>
          {children}
        </UserProvider>
      ) : (
        children
      )}
    </SessionProvider>
  );
}
