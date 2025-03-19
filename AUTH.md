# Authentication Strategy Documentation

## Overview
Shamiri Journal uses NextAuth.js (v4) with JWT-based authentication, integrated with Prisma ORM. The system provides secure, scalable authentication with session management and protected routes.

## Core Components

### 1. Authentication Stack
- **Framework**: NextAuth.js v4
- **Strategy**: JWT (JSON Web Tokens)
- **Session Duration**: 30 days
- **Database**: PostgreSQL with Prisma ORM
- **Password Hashing**: bcryptjs

### 2. Authentication Flow
1. **Registration**:
   - Email, password, and name required
   - Password hashing with bcryptjs
   - Automatic profile and settings creation
   - Email verification support (planned)

2. **Login**:
   - Credentials-based authentication
   - JWT token generation
   - 30-day session management
   - Automatic redirection to `/journal`

3. **Session Management**:
   - JWT-based sessions in cookies
   - Server-side validation
   - Automatic refresh
   - Secure storage

### 3. Security Features
- Password hashing with bcryptjs
- JWT token authentication
- Protected API routes
- CSRF protection
- Secure cookie handling
- Rate limiting capability

### 4. Protected Routes
```typescript
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

