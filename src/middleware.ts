import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/(auth)');

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/journal', req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ token }) => true // Let the above middleware handle the authorization
    },
    pages: {
      signIn: '/login',
    }
  }
);

// Protect all routes under /journal, /analytics, /settings, and /api/v1
export const config = {
  matcher: [
    '/journal/:path*',
    '/analytics/:path*',
    '/(settings)/:path*',
    '/api/v1/:path*',
    '/(auth)/:path*'
  ]
}; 