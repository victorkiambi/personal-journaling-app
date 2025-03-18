'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Calendar, Tag, ShieldCheck, PenTool } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/journal');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (isAuthenticated) {
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
            <div className="mt-12 lg:mt-0 lg:w-1/2">
              <div className="relative mx-auto rounded-xl shadow-xl overflow-hidden max-w-md lg:max-w-xl bg-white">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="p-6 lg:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="font-semibold text-lg text-gray-800">My Journal</span>
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border-l-4 border-indigo-500 pl-4 py-2">
                      <div className="text-sm text-gray-500">June 15, 2023</div>
                      <h3 className="font-medium text-gray-900">Reflections on my journey</h3>
                      <p className="text-gray-600 text-sm mt-1">Today I reflected on how far I've come this year. The challenges I faced in the spring seemed insurmountable at the time, but looking back...</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4 py-2">
                      <div className="text-sm text-gray-500">June 10, 2023</div>
                      <h3 className="font-medium text-gray-900">Morning meditation insights</h3>
                      <p className="text-gray-600 text-sm mt-1">My morning meditation practice has been transformative. Today I noticed how my thoughts are becoming less scattered and more focused...</p>
                    </div>
                    <div className="border-l-4 border-pink-500 pl-4 py-2">
                      <div className="text-sm text-gray-500">June 5, 2023</div>
                      <h3 className="font-medium text-gray-900">New project ideas</h3>
                      <p className="text-gray-600 text-sm mt-1">I've been brainstorming some new ideas for creative projects. The concept of combining photography with journaling feels particularly exciting...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Everything you need to journal effectively
            </p>
            <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-500">
              Our carefully designed features help you capture, organize, and reflect on your thoughts.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-y-12 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    Express yourself with formatting, links, lists, and other rich text features that make your entries visually engaging.
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
                    <ShieldCheck className="h-6 w-6 text-indigo-600" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">
                    Private & Secure
                  </h3>
                  <p className="mt-3 text-base text-gray-500">
                    Your entries are private and protected with industry-standard security practices, so your thoughts remain confidential.
                  </p>
                </div>
              </div>

              <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300 overflow-hidden p-6">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-md">
                    <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">
                    Mood Tracking
                  </h3>
                  <p className="mt-3 text-base text-gray-500">
                    Understand your emotional patterns by tracking your mood alongside your journal entries.
                  </p>
                </div>
              </div>

              <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300 overflow-hidden p-6">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-md">
                    <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">
                    Mobile Friendly
                  </h3>
                  <p className="mt-3 text-base text-gray-500">
                    Journal on the go with our responsive design that works beautifully on all your devices.
                  </p>
                </div>
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
            <div className="mt-12 lg:mt-0 flex justify-center">
              <div className="bg-white p-5 rounded-lg shadow-lg transform rotate-3 max-w-xs">
                <div className="text-sm text-gray-500 mb-2">June 20, 2023</div>
                <div className="text-gray-900 font-medium mb-4">Today I started my journaling practice</div>
                <div className="text-gray-600 text-sm">I've been meaning to start journaling for years, and today I finally took the first step. Already I feel more clarity about my goals and priorities...</div>
                <div className="mt-4 flex justify-end">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Beginnings
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center mb-6">
            <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
            <span className="text-xl font-bold text-gray-900">Personal Journal</span>
          </div>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Personal Journal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
