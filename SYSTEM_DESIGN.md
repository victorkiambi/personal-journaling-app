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

- **Frontend**: Next.js 14, React, TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with OAuth providers and email authentication
- **Analytics**: Custom sentiment analysis with Hugging Face models
- **State Management**: React Hooks + Context
- **Testing**: Jest, React Testing Library
- **Deployment**: Fly.io

### System Architecture Diagram

```mermaid
graph TD
    A[Client Browser] --> B[Next.js App]
    B --> C[Authentication]
    B --> D[API Routes]
    B --> E[Static Assets]
    C --> F[NextAuth.js]
    D --> G[Database]
    D --> H[External Services]
    G --> I[PostgreSQL]
    H --> J[Sentiment Analysis]
    H --> K[Analytics]
    D --> L[Profile Management]
    L --> M[User Settings]
    L --> N[Preferences]
```

### Component Architecture

```mermaid
graph TD
    A[Pages] --> B[Layout Components]
    A --> C[Feature Components]
    A --> D[UI Components]
    B --> E[Navigation]
    B --> F[Header]
    B --> G[Footer]
    C --> H[Journal]
    C --> I[Analytics]
    C --> J[Settings]
    J --> K[PersonalInfoCard]
    J --> L[PreferencesCard]
    J --> M[AccountCard]
    D --> N[Form Elements]
    D --> O[Data Display]
    D --> P[Feedback]
```

## Data Model

### Entity Relationship Diagram

```mermaid
erDiagram
    User {
        string id PK
        string email
        string name
        string password
        datetime createdAt
        datetime updatedAt
    }
    JournalEntry {
        string id PK
        string title
        string content
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    Category {
        string id PK
        string name
        string color
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    Profile {
        string id PK
        string userId FK
        string bio
        string location
        string website
        datetime createdAt
        datetime updatedAt
    }
    Settings {
        string id PK
        string userId FK
        string theme
        boolean emailNotifications
        datetime createdAt
        datetime updatedAt
    }
    EntryMetadata {
        string id PK
        string entryId FK
        int wordCount
        int readingTime
        json sentiment
        datetime createdAt
        datetime updatedAt
    }
    User ||--o{ JournalEntry : creates
    User ||--o{ Category : creates
    User ||--|| Profile : has
    User ||--|| Settings : has
    JournalEntry ||--|| EntryMetadata : has
    JournalEntry }o--o{ Category : belongs_to
```

### Core Entities

1. **User**
   - Primary key: id (UUID)
   - Attributes: email, name, password, createdAt, updatedAt
   - Relationships: one-to-many with JournalEntry, one-to-one with Profile and Settings

2. **Profile**
   - Primary key: id (UUID)
   - Attributes: userId, bio, location, website, createdAt, updatedAt
   - Relationships: one-to-one with User

3. **Settings**
   - Primary key: id (UUID)
   - Attributes: userId, theme, emailNotifications, createdAt, updatedAt
   - Relationships: one-to-one with User

4. **JournalEntry**
   - Primary key: id (UUID)
   - Attributes: title, content, userId, createdAt, updatedAt
   - Relationships: many-to-many with Category, one-to-one with EntryMetadata

## Security

### Authentication Flow

1. **Route Protection**
   - Protected routes under `/journal`, `/analytics`, `/settings`, and `/api/v1`
   - Authentication middleware using NextAuth.js
   - Automatic redirection to login for unauthenticated users
   - Preservation of intended destination using URL parameters

2. **Session Management**
   - NextAuth.js session handling
   - Secure cookie-based session storage
   - Automatic session refresh
   - Session persistence across page reloads
   - OAuth state validation

3. **Authentication Methods**
   - Email/Password authentication
   - OAuth providers (Google, GitHub)
   - Email verification
   - Secure password reset flow
   - Rate limiting on authentication attempts

### API Security

1. **Request Protection**
   - CSRF protection via NextAuth.js
   - Rate limiting
   - Input validation using Zod
   - Standardized error handling

2. **Data Access**
   - User-scoped data access
   - Session-based authorization
   - Secure data transmission with HTTPS
   - Data encryption at rest

### OAuth Integration

1. **Supported Providers**
   - Google OAuth 2.0
   - GitHub OAuth
   - Extensible provider system

2. **Provider Configuration**
   - Secure client ID and secret management
   - Callback URL handling
   - Scope management
   - Profile data mapping

3. **Session Security**
   - Encrypted session tokens
   - Secure cookie handling
   - Cross-site request forgery protection
   - Token rotation

## UI Components

### Profile Management

1. **PersonalInfoCard**
   - User name input
   - Bio text input
   - Location input
   - Form validation
   - Real-time updates

2. **PreferencesCard**
   - Theme selection (Light/Dark/System)
   - Email notification toggle
   - Preference persistence
   - Immediate application

3. **AccountCard**
   - Email display
   - Password management
   - Account deletion option
   - Security settings

### State Management

1. **Profile Hook (useProfile)**
   - Profile data fetching
   - Form state management
   - Error handling
   - Loading states
   - Save functionality

2. **Form Validation**
   - Input validation
   - Error messages
   - Field requirements
   - Submit validation

### Feedback System

1. **Toast Notifications**
   - Success messages
   - Error notifications
   - Loading indicators
   - Action confirmations

2. **Loading States**
   - Skeleton loaders
   - Progress indicators
   - Disabled states
   - Transition animations

## Future Considerations

### Technical Improvements

1. **Performance**
   - Component lazy loading
   - Image optimization
   - API response caching
   - Bundle size optimization

2. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Color contrast

3. **Testing**
   - Unit tests for hooks
   - Component integration tests
   - E2E testing
   - Performance testing

### Feature Roadmap

1. **Profile Enhancements**
   - Profile picture upload
   - Social media integration
   - Activity history
   - Custom themes

2. **Security Updates**
   - Two-factor authentication
   - Session management
   - Security audit logging
   - Privacy controls

3. **UI/UX Improvements**
   - Mobile responsiveness
   - Gesture controls
   - Dark mode refinements
1. **Database Scaling**
   - Indexed queries
   - Connection pooling
   - Query optimization
   - Caching strategy

2. **Application Scaling**
   - Serverless functions
   - Edge caching
   - Static asset optimization
   - Load balancing

### Scaling to 1M+ Users

1. **Infrastructure**
   - Distributed PostgreSQL cluster
   - Kubernetes deployment
   - CDN integration
   - Monitoring and logging

2. **Performance Optimization**
   - Database sharding
   - Caching layers
   - Query optimization
   - Asset optimization

## Monitoring and Logging

1. **Application Monitoring**
   - Error tracking
   - Performance metrics
   - User analytics
   - System health

2. **Logging Strategy**
   - Structured logging
   - Log aggregation
   - Log retention
   - Log analysis

## Future Considerations

### Technical Debt

1. **Code Organization**
   - Component reusability
   - Type definitions
   - Test coverage
   - Documentation

2. **Performance**
   - Bundle optimization
   - Image optimization
   - API response time
   - Database queries

### Feature Roadmap

1. **Core Features**
   - Rich text editor
   - Image upload
   - Export functionality
   - Search improvements

2. **Advanced Features**
   - Real-time collaboration
   - Mobile application
   - Offline support
   - Advanced analytics

3. **AI/ML Features**
   - Smart categorization
   - Content suggestions
   - Writing prompts
   - Pattern recognition

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [shadcn/ui Documentation](https://ui.shadcn.com)

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