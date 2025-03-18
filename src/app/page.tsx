'use client';

import { useAuth } from '@/contexts/auth.context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Calendar, Tag, ShieldCheck, PenTool } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/journal');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-50 opacity-50 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:leading-tight">
                <span className="block">Capture moments</span>
                <span className="block text-indigo-600">that matter to you</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-3xl">
                Your personal journal for documenting life's journey. Organize your thoughts with beautiful formatting, categories, and a timeline view that helps you track your growth.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="px-8 py-6 text-base font-medium bg-indigo-600 hover:bg-indigo-700">
                    Start your journal today
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-base font-medium border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 mt-10 lg:mt-0">
              <div className="relative mx-auto w-full max-w-lg lg:max-w-xl">
                <div className="relative w-full h-80">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-indigo-50 rounded-lg transform -rotate-6 scale-105"></div>
                  <div className="absolute inset-0 bg-white rounded-lg shadow-xl transform rotate-3 scale-105"></div>
                  <div className="relative bg-white rounded-lg shadow-lg p-6">
                    <div className="space-y-4">
                      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex space-x-4">
                        <div className="h-8 w-24 bg-indigo-100 rounded"></div>
                        <div className="h-8 w-24 bg-indigo-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to journal effectively
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Simple yet powerful features to help you maintain a meaningful journaling practice.
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300 overflow-hidden p-6">
              <div>
                <span className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-md">
                  <PenTool className="h-6 w-6 text-indigo-600" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">
                  Rich Text Editor
                </h3>
                <p className="mt-3 text-base text-gray-500">
                  Express yourself with a beautiful and intuitive editor that supports formatting, lists, and more.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300 overflow-hidden p-6">
              <div>
                <span className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-md">
                  <ShieldCheck className="h-6 w-6 text-indigo-600" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">
                  Private & Secure
                </h3>
                <p className="mt-3 text-base text-gray-500">
                  Your journal entries are encrypted and only accessible to you. Your privacy is our top priority.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300 overflow-hidden p-6">
              <div>
                <span className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-md">
                  <Tag className="h-6 w-6 text-indigo-600" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">
                  Custom Categories
                </h3>
                <p className="mt-3 text-base text-gray-500">
                  Organize your entries with personalized categories that help you track different areas of your life and interests.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300 overflow-hidden p-6">
              <div>
                <span className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-md">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">
                  Timeline View
                </h3>
                <p className="mt-3 text-base text-gray-500">
                  Visualize your journey with a beautiful timeline that helps you see patterns and growth over time.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300 overflow-hidden p-6">
              <div>
                <span className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-md">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">
                  Search & Filter
                </h3>
                <p className="mt-3 text-base text-gray-500">
                  Easily find past entries with powerful search and filtering capabilities across your entire journal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 relative">
        <div className="absolute inset-0 opacity-10 bg-pattern"></div>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 lg:py-20 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <span className="block">Ready to start your</span>
                <span className="block">journaling practice?</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-indigo-100">
                Join thousands of others who are documenting their lives, tracking their progress, and finding clarity through journaling.
              </p>
              <div className="mt-8 flex space-x-4">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                    Create your account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-indigo-700">
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
