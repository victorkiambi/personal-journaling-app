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
- **Authentication**: NextAuth.js with email authentication
- **Analytics**: 
  - Sentiment Analysis: Natural.js with AFINN lexicon
  - AI Insights: Hugging Face Transformers
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
    H --> L[Hugging Face]
    D --> M[Profile Management]
    M --> N[User Settings]
    M --> O[Preferences]
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
        float sentimentScore
        float sentimentMagnitude
        string mood
        json aiInsights
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

5. **EntryMetadata**
   - Primary key: id (UUID)
   - Attributes: entryId, wordCount, readingTime, sentimentScore, sentimentMagnitude, mood, aiInsights
   - Relationships: one-to-one with JournalEntry

## Sentiment Analysis & AI Features

### Natural.js Sentiment Analysis

1. **Implementation**
   - Uses Natural.js library with AFINN lexicon
   - Tokenization using WordTokenizer
   - Sentiment scoring with SentimentAnalyzer
   - Normalized scores (-1 to 1 range)
   - Mood classification based on score thresholds

2. **Features**
   - Word-level sentiment analysis
   - Sentence-level analysis
   - Magnitude calculation for sentiment strength
   - Mood categorization (very_positive, positive, neutral, negative, very_negative)
   - Performance optimized for real-time analysis

3. **Processing Flow**
   ```mermaid
   graph LR
       A[Entry Content] --> B[Tokenization]
       B --> C[Sentiment Analysis]
       C --> D[Score Normalization]
       D --> E[Mood Classification]
       E --> F[Metadata Storage]
   ```

### Hugging Face Integration

1. **Models Used**
   - Text Classification for topic detection
   - Zero-shot classification for content categorization
   - Text generation for writing prompts

2. **Features**
   - Topic detection and classification
   - Content summarization
   - Writing style analysis
   - Theme extraction
   - Pattern recognition

3. **Implementation**
   - REST API integration with Hugging Face Inference API
   - Rate limiting and error handling
   - Caching of model responses
   - Batch processing for multiple entries

4. **Processing Flow**
   ```mermaid
   graph LR
       A[Entry Content] --> B[API Request]
       B --> C[Model Processing]
       C --> D[Response Parsing]
       D --> E[Insight Generation]
       E --> F[Metadata Storage]
   ```

5. **Security**
   - API key management via environment variables
   - Request validation
   - Response sanitization
   - Error handling and fallbacks

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

3. **Authentication Methods**
   - Email/Password authentication
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
   - Error alerts
   - Warning notifications
   - Info updates

2. **Loading States**
   - Skeleton loaders
   - Progress indicators
   - Disabled states
   - Loading spinners

3. **Error Handling**
   - Form validation errors
   - API error messages
   - Network error handling
   - Fallback UI states

## Analytics Dashboard

### Components

1. **Summary Cards**
   - Total entries
   - Word count
   - Writing streak
   - Average words per day

2. **Sentiment Analysis**
   - Overall sentiment score
   - Mood distribution
   - Sentiment trends
   - Magnitude visualization

3. **Category Distribution**
   - Category breakdown
   - Entry counts
   - Visual representation
   - Filtering options

4. **Monthly Activity**
   - Entry frequency
   - Word count trends
   - Activity patterns
   - Time-based analysis

### Data Processing

1. **Aggregation**
   - Time-based grouping
   - Category aggregation
   - Sentiment averaging
   - Trend calculation

2. **Visualization**
   - Chart components
   - Interactive graphs
   - Responsive design
   - Data filtering

3. **Performance**
   - Cached calculations
   - Lazy loading
   - Progressive enhancement
   - Optimized queries

## Scaling Considerations

### Database Scaling

1. **Query Optimization**
   - Indexed fields
   - Efficient joins
   - Query caching
   - Connection pooling

2. **Data Partitioning**
   - User-based sharding
   - Time-based partitioning
   - Category-based separation
   - Archive strategy

3. **Caching Strategy**
   - Redis integration
   - Query result caching
   - Session caching
   - Static asset caching

### Application Scaling

1. **Load Balancing**
   - Horizontal scaling
   - Request distribution
   - Health checks
   - Auto-scaling

2. **Resource Management**
   - Memory optimization
   - CPU utilization
   - Connection limits
   - Timeout handling

3. **Performance Monitoring**
   - Response times
   - Error rates
   - Resource usage
   - User metrics

## Setup Guide

### Prerequisites

1. **Development Environment**
   - Node.js 18+
   - PostgreSQL 14+
   - npm or yarn
   - Git

2. **Environment Variables**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/shamiri"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   HUGGINGFACE_API_KEY="your-api-key"
   ```

3. **Dependencies**
   ```bash
   npm install
   ```

### Database Setup

1. **Schema Migration**
   ```bash
   npx prisma migrate dev
   ```

2. **Seed Data**
   ```bash
   npx prisma db seed
   ```

### Development Server

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Run Tests**
   ```bash
   npm test
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

### Deployment

1. **Fly.io Setup**
   ```bash
   flyctl launch
   flyctl secrets set DATABASE_URL="your-database-url"
   flyctl deploy
   ```

2. **Environment Configuration**
   - Set production environment variables
   - Configure database connection
   - Set up monitoring
   - Enable logging

## Documentation References

1. **API Documentation**
   - [API.md](./API.md)
   - [AUTH.md](./AUTH.md)

2. **Database Documentation**
   - [DATABASE.md](./DATABASE.md)
   - [DATABASE_DIAGRAM.md](./DATABASE_DIAGRAM.md)

3. **Component Documentation**
   - [COMPONENTS.md](./COMPONENTS.md)

4. **External Services**
   - [Natural.js Documentation](https://github.com/NaturalNode/natural)
   - [Hugging Face API Documentation](https://huggingface.co/docs/inference-endpoints/index)
   - [Next.js Documentation](https://nextjs.org/docs)
   - [Prisma Documentation](https://www.prisma.io/docs) 