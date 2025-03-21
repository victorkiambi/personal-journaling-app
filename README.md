# Personal Journal Application

A modern, full-stack journaling application built with Next.js, TypeScript, and PostgreSQL.

## Live Demo

The application is deployed and accessible at: [https://shamiri-journal.fly.dev](https://shamiri-journal.fly.dev)

### Accessing the Application

1. Visit [https://shamiri-journal.fly.dev](https://shamiri-journal.fly.dev)
2. Create a new account or use the demo credentials:
   - Email: john@example.com
   - Password: Password123! (for testing purposes only)
3. Start journaling! The application features:
   - Real-time writing suggestions
   - Grammar corrections
   - Style analysis
   - Auto-completions
   - Sentiment analysis
   - Personal insights

## Features

- User authentication with NextAuth.js
- Create, read, update, and delete journal entries
- Categorize entries with a flexible tagging system
- Rich text editing
- Analytics and insights about your journaling habits
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with OAuth providers
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

## Deployment

The application is deployed on [fly.io](https://fly.io). To deploy your own instance:

1. Install the Fly CLI:
   ```bash
   # macOS
   brew install flyctl
   # Windows
   scoop install flyctl
   # Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. Login to Fly:
   ```bash
   fly auth login
   ```

3. Deploy the application:
   ```bash
   fly deploy
   ```

4. Set up environment variables:
   ```bash
   fly secrets set DATABASE_URL="your-production-database-url"
   fly secrets set JWT_SECRET="your-production-jwt-secret"
   # Add other necessary environment variables
   ```

5. Access your deployed application at `https://your-app-name.fly.dev`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shamiri_journal?schema=public"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-change-in-production"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# AI Features
HUGGINGFACE_API_KEY="your-huggingface-api-key"
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
