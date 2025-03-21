# Authentication Strategy Documentation

## Overview
Shamiri Journal uses NextAuth.js (v4) for authentication, integrated with Prisma ORM. The system provides secure, scalable authentication with session management, OAuth providers, and protected routes.

## Core Components

### 1. Authentication Stack
- **Framework**: NextAuth.js v4
- **Strategy**: Email/Password
- **Session Duration**: 7 days
- **Database**: PostgreSQL with Prisma ORM
- **Providers**: Email/Password

### 2. Authentication Flow
1. **Registration & Login Options**:
   - Email/Password authentication
   - Automatic profile and settings creation
   - Email verification support

2. **Login Flow**:
   - Secure session creation
   - 7 day session management
   - Automatic redirection to `/journal`

3. **Session Management**:
   - NextAuth.js built-in session handling
   - Secure cookie-based sessions
   - Automatic session refresh
   - CSRF protection

### 3. Security Features
- Secure session management
- Protected API routes
- CSRF protection built-in
- Secure cookie handling
- Rate limiting capability

### 4. Protected Routes
All routes under the following paths are protected by NextAuth.js middleware:
```typescript
export const config = {
  matcher: [
    '/journal/:path*',
    '/categories/:path*',
    '/analytics/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/api/v1/:path*',
  ]
}
```

### Environment Variables
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
```



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
```

