# Database Schema Documentation

## Overview
The Shamiri Journal application uses PostgreSQL as its database with Prisma ORM. The schema is designed to support user authentication, journal entries, categories, and user preferences.

## Database Connection
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shamiri_journal?schema=public"
```

## Models

### User
Core user information and authentication details.
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  profile       Profile?
  settings      Settings?
  categories    Category[]
  journalEntries JournalEntry[]
}
```

**Relationships:**
- One-to-many with `Account` (OAuth accounts)
- One-to-many with `Session` (user sessions)
- One-to-one with `Profile` (user profile)
- One-to-one with `Settings` (user preferences)
- One-to-many with `Category` (user's categories)
- One-to-many with `JournalEntry` (user's journal entries)

### Account
OAuth account connections for users.
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
User session management for authentication.
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
Email verification tokens for user registration.
```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Profile
User profile information.
```prisma
model Profile {
  id        String   @id @default(cuid())
  userId    String   @unique
  bio       String?
  location  String?
  website   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Relationships:**
- One-to-one with `User`

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
}
```

**Relationships:**
- One-to-one with `User`

### Category
Journal entry categories for organization.
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
}
```

**Relationships:**
- Many-to-one with `User`
- Many-to-many with `JournalEntry`

### JournalEntry
Main journal entry content.
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
}
```

**Relationships:**
- Many-to-one with `User`
- Many-to-many with `Category`
- One-to-one with `EntryMetadata`

### EntryMetadata
Additional information about journal entries.
```prisma
model EntryMetadata {
  id          String       @id @default(cuid())
  entryId     String       @unique
  wordCount   Int
  readingTime Int
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  entry       JournalEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)
}
```

**Relationships:**
- One-to-one with `JournalEntry`

## Indexes and Constraints
- Unique constraints on:
  - User email
  - Account provider and providerAccountId
  - Session token
  - VerificationToken identifier and token
  - Profile userId
  - Settings userId
  - EntryMetadata entryId

## Cascading Deletes
- When a user is deleted:
  - All associated accounts are deleted
  - All associated sessions are deleted
  - Associated profile is deleted
  - Associated settings are deleted
  - All categories are deleted
  - All journal entries are deleted
- When a journal entry is deleted:
  - Associated metadata is deleted

## Test Data
The database includes test data for development:
- Two test users with profiles and settings
- Categories for each user
- Sample journal entries with metadata
- Realistic data spread across different days

## Migration History
1. `20250318055053_initial`: Initial schema
2. `20250318111022_add_journal_indexes`: Added indexes for better performance
3. `20250319044616_add_nextauth`: Added NextAuth.js related tables

## Database Management
- Use `npx prisma generate` to update Prisma Client after schema changes
- Use `npx prisma migrate dev` to create and apply new migrations
- Use `npx prisma db seed` to populate test data
- Use `npx prisma studio` to view and edit data in a GUI 