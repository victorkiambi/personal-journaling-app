# Personal Journal Application

A modern, full-stack journaling application built with Next.js, TypeScript, and PostgreSQL.

## Features

- User authentication with JWT
- Create, read, update, and delete journal entries
- Categorize entries with a flexible tagging system
- Rich text editing
- Analytics and insights about your journaling habits
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt for password hashing
- **State Management**: React Context + Hooks
- **Styling**: Tailwind CSS
- **Development**: Docker for database

## Prerequisites

- Node.js 18+ and npm
- Docker Desktop
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd shamiri
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   # Start the PostgreSQL database
   docker-compose up -d

   # Run database migrations
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shamiri_journal?schema=public"

# Authentication
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## Project Structure

```
/src
  /api          # API routes and handlers
  /components   # React components
    /common     # Shared components
    /entries    # Journal entry components
    /categories # Category management components
    /analytics  # Analytics and visualization components
    /settings   # User settings components
  /hooks        # Custom React hooks
  /contexts     # React contexts
  /services     # Business logic and API calls
  /types        # TypeScript type definitions
  /utils        # Utility functions
  /constants    # Constants and configuration
/prisma         # Database schema and migrations
/public         # Static assets
/tests          # Test files
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (when implemented)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
