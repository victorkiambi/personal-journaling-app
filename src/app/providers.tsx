'use client';

import { AuthProvider } from "@/contexts/auth.context";
import Navigation from "@/components/layout/Navigation";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navigation />
      <main className="min-h-screen">{children}</main>
      <Toaster />
    </AuthProvider>
  );
} 