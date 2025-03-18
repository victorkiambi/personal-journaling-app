'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

// Create a default value for the context
const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  checkAuth: () => false
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    checkAuth();
    setIsLoading(false);
  }, []);

  function checkAuth(): boolean {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('auth_token');
        const authenticated = !!token;
        setIsAuthenticated(authenticated);
        return authenticated;
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        return false;
      }
    }
    return false;
  }

  function login(token: string) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('auth_token', token);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error setting auth token:', error);
      }
    }
  }

  function logout() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        router.push('/login');
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
  }

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 