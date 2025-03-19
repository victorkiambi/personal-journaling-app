'use client';

import Navigation from './Navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isPublicRoute = ['/', '/login', '/register'].includes(pathname);

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // For public routes or authenticated users, show content
  if (isPublicRoute || session) {
    return (
      <div className="min-h-screen bg-gray-50">
        {session && <Navigation />}
        <main className={session ? "py-6" : ""}>
          {children}
        </main>
      </div>
    );
  }

  // This should not happen due to redirects in auth context
  return null;
} 