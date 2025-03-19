# Shamiri Journal - System Design Document

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Model](#data-model)
4. [Security](#security)
5. [Scaling](#scaling)
6. [Setup Guide](#setup-guide)
7. [Documentation References](#documentation-references)

## Overview

Shamiri Journal is a modern web application for personal journaling with sentiment analysis and analytics features. The application is built using Next.js 14, TypeScript, and shadcn/ui components.

## Architecture

### Technology Stack

```mermaid
graph TD
    A[Client Browser] --> B[Next.js App]
    B --> C[Authentication]
    B --> D[API Routes]
    B --> E[Database]
    C --> F[NextAuth.js]
    D --> G[Services Layer]
    E --> H[PostgreSQL]
    G --> I[Prisma ORM]
```

#### Core Technologies
- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Testing**: Jest, React Testing Library
- **Analytics**: Custom sentiment analysis

### Key Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Protected routes and API endpoints
   - Role-based access control
   - Session management

2. **Journal Management**
   - Create, read, update, delete entries
   - Rich text editing
   - Category organization
   - Search and filtering

3. **Analytics & Insights**
   - Sentiment analysis
   - Monthly activity tracking
   - Category distribution
   - Writing patterns

4. **User Experience**
   - Responsive design
   - Dark/light mode
   - Accessibility features
   - Real-time updates

## Data Model

### Entity Relationships

```mermaid
erDiagram
    User ||--o{ JournalEntry : creates
    User ||--o{ Category : has
    User ||--|| Profile : has
    User ||--|| Settings : has
    JournalEntry ||--|| EntryMetadata : has
    JournalEntry }o--o{ Category : belongs_to
```

### Core Entities

1. **User**
   - Basic authentication fields
   - Profile information
   - User settings
   - Relationships to entries and categories

2. **JournalEntry**
   - Title and content
   - Creation and update timestamps
   - Categories
   - Metadata (word count, reading time, sentiment)

3. **Category**
   - Name and color
   - User association
   - Journal entry relationships

4. **EntryMetadata**
   - Word count
   - Reading time
   - Sentiment analysis
   - Mood tracking

## Security Measures

1. **Authentication**
   - JWT-based authentication
   - Password hashing with bcryptjs
   - Session management
   - Protected routes

2. **Data Protection**
   - Input validation with Zod
   - SQL injection prevention via Prisma
   - XSS protection
   - CSRF protection

3. **API Security**
   - Rate limiting
   - Request validation
   - Error handling
   - Logging

## Scaling Considerations

### Current Architecture
- Monolithic Next.js application
- Single PostgreSQL database
- Server-side rendering
- API routes for data access

### Scaling Challenges

1. **Database Scaling**
   - Query optimization
   - Index management
   - Connection pooling
   - Read replicas

2. **Application Scaling**
   - Horizontal scaling
   - Load balancing
   - Caching strategies
   - Edge functions

### Solutions

1. **Database**
   - Implement database sharding
   - Use connection pooling
   - Optimize queries
   - Add read replicas

2. **Application**
   - Deploy to edge network
   - Implement caching
   - Use CDN for static assets
   - Optimize bundle size

## Performance Optimization

1. **Frontend**
   - Code splitting
   - Image optimization
   - Bundle optimization
   - Caching strategies

2. **Backend**
   - Query optimization
   - Response caching
   - Background jobs
   - Rate limiting

## Monitoring & Logging

1. **Application Monitoring**
   - Error tracking
   - Performance metrics
   - User analytics
   - System health

2. **Logging**
   - Error logging
   - Access logging
   - Audit logging
   - Performance logging

## Development Workflow

1. **Code Quality**
   - TypeScript for type safety
   - ESLint for code quality
   - Prettier for formatting
   - Pre-commit hooks

2. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - Performance tests

3. **Deployment**
   - CI/CD pipeline
   - Environment management
   - Version control
   - Release management

## Future Considerations

1. **Technical Debt**
   - Code refactoring
   - Test coverage
   - Documentation
   - Performance optimization

2. **Feature Roadmap**
   - Real-time collaboration
   - Mobile application
   - Offline support
   - Advanced analytics
   - AI-powered insights

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

## Setup Guide

### Prerequisites
- Node.js 18.x or later
- PostgreSQL 14.x or later
- npm or yarn
- Git

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shamiri"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google Cloud (for sentiment analysis)
GOOGLE_CLOUD_PROJECT="your-project-id"
GOOGLE_APPLICATION_CREDENTIALS="path/to/credentials.json"
```

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/shamiri.git
cd shamiri
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up the database:
```bash
# Generate Prisma client
npm run postinstall

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### Production Deployment
1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Documentation References

### API Documentation
- [API Routes](./src/app/api/README.md)
- [Swagger Documentation](./src/app/api/swagger.json)

### Database Documentation
- [Database Schema](./DATABASE.md)
- [Database Diagram](./DATABASE_DIAGRAM.md)

### Authentication Documentation
- [Auth Implementation](./AUTH.md)
- [NextAuth Configuration](./src/lib/auth.ts)

### Component Documentation
- [UI Components](./src/components/README.md)
- [Layout Components](./src/components/layout/README.md)

### Testing Documentation
- [Test Setup](./jest.setup.js)
- [Test Utilities](./src/test/README.md)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 