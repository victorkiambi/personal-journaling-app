# Database Schema Documentation

## Overview
The Shamiri Journal application uses PostgreSQL as its database with Prisma ORM. The schema is designed to support NextAuth.js authentication, journal entries with AI-powered insights, categories, user profiles, and preferences with a focus on type safety and data integrity.

## Database Connection
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shamiri_journal?schema=public"
```

## Models

### User
Core user information and NextAuth.js authentication details.
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  profile       Profile?
  settings      Settings?
  categories    Category[]
  journalEntries JournalEntry[]

  @@index([email])
}
```

**Relationships:**
- One-to-many with `Account` (OAuth accounts)
- One-to-many with `Session` (NextAuth.js sessions)
- One-to-one with `Profile` (user profile)
- One-to-one with `Settings` (user preferences)
- One-to-many with `Category` (user's categories)
- One-to-many with `JournalEntry` (user's journal entries)

### Account
OAuth account connections for NextAuth.js.
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

**Relationships:**
- Many-to-one with `User`

### Session
NextAuth.js session management.
```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Relationships:**
- Many-to-one with `User`

### VerificationToken
Email verification tokens for NextAuth.js.
```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Profile
Extended user profile information.
```prisma
model Profile {
  id        String   @id @default(cuid())
  userId    String   @unique
  bio       String?  @db.Text
  location  String?
  website   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**Relationships:**
- One-to-one with `User`
- Cascade deletion with User

### Settings
User preferences and application settings.
```prisma
model Settings {
  id                String   @id @default(cuid())
  userId            String   @unique
  theme             String   @default("light")
  emailNotifications Boolean @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**Relationships:**
- One-to-one with `User`
- Cascade deletion with User

### Category
Journal entry categories with enhanced organization.
```prisma
model Category {
  id            String        @id @default(cuid())
  name          String
  color         String
  userId        String
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  journalEntries JournalEntry[]

  @@unique([userId, name])
  @@index([userId])
}
```

**Relationships:**
- Many-to-one with `User`
- Many-to-many with `JournalEntry`

### JournalEntry
Main journal entry content with AI-powered insights.
```prisma
model JournalEntry {
  id          String        @id @default(cuid())
  title       String
  content     String        @db.Text
  userId      String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  categories  Category[]
  metadata    EntryMetadata?
  insights    AIInsight[]

  @@index([userId, createdAt(sort: Desc)])
  @@index([userId, title])
}
```

**Relationships:**
- Many-to-one with `User`
- Many-to-many with `Category`
- One-to-one with `EntryMetadata`
- Many-to-many with `AIInsight`

### EntryMetadata
Enhanced metadata for journal entries with AI analysis.
```prisma
model EntryMetadata {
  id            String       @id @default(cuid())
  entryId       String       @unique
  wordCount     Int
  readingTime   Int
  sentiment     Json?
  readability   Float?       // Flesch Reading Ease score
  complexity    Float?       // Text complexity score
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  entry         JournalEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  @@index([entryId])
}
```

**Relationships:**
- One-to-one with `JournalEntry`
- Cascade deletion with JournalEntry

### AIInsight
AI-generated insights for journal entries.
```prisma
model AIInsight {
  id          String       @id @default(cuid())
  entryId     String
  type        String       // 'theme' | 'pattern' | 'recommendation'
  content     String       @db.Text
  confidence  Float
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  entry       JournalEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  @@index([entryId])
  @@index([type])
}
```

**Relationships:**
- Many-to-one with `JournalEntry`
- Cascade deletion with JournalEntry

## Indexes and Performance

### Primary Indexes
- User email (unique)
- Profile userId (unique)
- Settings userId (unique)
- Category [userId, name] (unique)
- EntryMetadata entryId (unique)
- Session sessionToken (unique)
- VerificationToken token (unique)

### Secondary Indexes
- JournalEntry [userId, createdAt] for efficient listing
- JournalEntry [userId, title] for search
- AIInsight [entryId] for quick insight retrieval
- AIInsight [type] for filtering insights by type
- Category [userId] for filtering
- Profile [userId] for quick lookups
- Settings [userId] for quick lookups

## Data Integrity

### Cascade Deletes
1. User Deletion:
   - Cascades to Profile
   - Cascades to Settings
   - Cascades to Categories
   - Cascades to JournalEntries
   - Cascades to Accounts (NextAuth.js)
   - Cascades to Sessions (NextAuth.js)

2. JournalEntry Deletion:
   - Cascades to EntryMetadata
   - Cascades to AIInsights
   - Removes Category associations

### Constraints
1. User Constraints:
   - Unique email
   - Single profile
   - Single settings record

2. Category Constraints:
   - Unique name per user
   - Valid color format

3. Profile Constraints:
   - Single profile per user
   - Optional bio and location

4. Settings Constraints:
   - Single settings per user
   - Valid theme values

5. AIInsight Constraints:
   - Valid type values
   - Confidence between 0 and 1
   - Non-empty content

## Migration History
1. `20250318055053_initial`: Initial schema
2. `20250318111022_add_journal_indexes`: Added performance indexes
3. `20250319044616_add_nextauth`: Added NextAuth.js tables
4. `20250320103045_enhance_profile`: Enhanced profile and settings
5. `20250321092233_add_constraints`: Added unique constraints
6. `20250322081512_optimize_indexes`: Optimized index structure

## Database Management
- Use `npx prisma generate` to update Prisma Client
- Use `npx prisma migrate dev` to create migrations
- Use `npx prisma db seed` to populate test data
- Use `npx prisma studio` to manage data
- Use `npx prisma format` to format schema

## Error Handling
The database implements proper error handling for:
- Unique constraint violations
- Foreign key violations
- Data validation errors
- Transaction failures

## Monitoring
Key metrics tracked:
- Query performance
- Index usage
- Connection pool status
- Transaction duration
- Error rates

## Backup Strategy
1. Daily automated backups
2. Point-in-time recovery
3. Geo-redundant storage
4. 30-day retention period 