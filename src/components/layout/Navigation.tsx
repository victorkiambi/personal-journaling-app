'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Book, 
  LogOut, 
  Menu, 
  X, 
  User, 
  PlusCircle, 
  Tag, 
  BarChart 
} from 'lucide-react';
import { useAuth } from '@/contexts/auth.context';
import { Loader2 } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Close mobile menu when route changes
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  // Don't render navigation while loading
  if (loading) {
    return (
      <nav className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Don't render navigation for public routes
  if (!user && ['/login', '/register'].includes(pathname)) {
    return null;
  }

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary">
                Shamiri Journal
              </Link>
            </div>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <Link href="/" passHref>
                  <Button
                    variant={isActive('/') ? 'default' : 'ghost'}
                    className="text-sm font-medium"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link href="/journal/new" passHref>
                  <Button
                    variant={isActive('/journal/new') ? 'default' : 'ghost'}
                    className="text-sm font-medium"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Entry
                  </Button>
                </Link>
                <Link href="/categories" passHref>
                  <Button
                    variant={isActive('/categories') ? 'default' : 'ghost'}
                    className="text-sm font-medium"
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Categories
                  </Button>
                </Link>
                <Link href="/analytics" passHref>
                  <Button
                    variant={isActive('/analytics') ? 'default' : 'ghost'}
                    className="text-sm font-medium"
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/profile" passHref>
                  <Button
                    variant={isActive('/profile') ? 'default' : 'ghost'}
                    className="text-sm font-medium"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-sm font-medium"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" passHref>
                  <Button
                    variant={isActive('/login') ? 'default' : 'ghost'}
                    className="text-sm font-medium"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register" passHref>
                  <Button
                    variant={isActive('/register') ? 'default' : 'ghost'}
                    className="text-sm font-medium"
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link href="/" passHref>
                  <Button
                    variant={isActive('/') ? 'default' : 'ghost'}
                    className="justify-start w-full"
                    onClick={closeMenu}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link href="/journal/new" passHref>
                  <Button
                    variant={isActive('/journal/new') ? 'default' : 'ghost'}
                    className="justify-start w-full"
                    onClick={closeMenu}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Entry
                  </Button>
                </Link>
                <Link href="/categories" passHref>
                  <Button
                    variant={isActive('/categories') ? 'default' : 'ghost'}
                    className="justify-start w-full"
                    onClick={closeMenu}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Categories
                  </Button>
                </Link>
                <Link href="/analytics" passHref>
                  <Button
                    variant={isActive('/analytics') ? 'default' : 'ghost'}
                    className="justify-start w-full"
                    onClick={closeMenu}
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/profile" passHref>
                  <Button
                    variant={isActive('/profile') ? 'default' : 'ghost'}
                    className="justify-start w-full"
                    onClick={closeMenu}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="justify-start w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" passHref>
                  <Button
                    variant={isActive('/login') ? 'default' : 'ghost'}
                    className="justify-start w-full"
                    onClick={closeMenu}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register" passHref>
                  <Button
                    variant={isActive('/register') ? 'default' : 'ghost'}
                    className="justify-start w-full"
                    onClick={closeMenu}
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 