import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

const protectedRoutes = [
  '/journal/:path*',
  '/categories/:path*',
  '/analytics/:path*',
  '/profile/:path*',
  '/api/v1/entries/:path*',
  '/api/v1/categories/:path*',
  '/api/v1/users/:path*',
  '/api/v1/analytics/:path*',
];

export const config = {
  matcher: protectedRoutes,
}; 