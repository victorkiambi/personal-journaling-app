'use client';

import { Navbar } from './Navbar';
import { useAuth } from '@/contexts/auth.context';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isPublicRoute = ['/', '/login', '/register'].includes(pathname);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // For public routes or authenticated users, show content
  if (isPublicRoute || user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        <main className={user ? "py-6" : ""}>
          {children}
        </main>
      </div>
    );
  }

  // This should not happen due to redirects in auth context
  return null;
} 