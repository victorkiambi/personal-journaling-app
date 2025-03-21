# Testing Documentation

## Overview

The Shamiri Journal application uses Jest and React Testing Library for testing. The test suite includes unit tests, integration tests, and end-to-end tests for components, API routes, utilities, and AI-powered features.

## Test Setup

### Jest Configuration

The Jest configuration is defined in `jest.config.js`:

```js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
}
```

### Test Environment Setup

The test environment is configured in `jest.setup.js`:

```js
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }),
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn().mockResolvedValue({
    user: {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }),
}))

// Mock Hugging Face inference
jest.mock('@huggingface/inference', () => {
  return {
    HfInference: jest.fn().mockImplementation(() => ({
      textGeneration: jest.fn().mockResolvedValue({
        generated_text: 'This is a generated text response.',
      }),
      textClassification: jest.fn().mockResolvedValue([
        { label: 'formal', score: 0.9 },
      ]),
      fillMask: jest.fn().mockResolvedValue([
        { token_str: 'completed', score: 0.8 },
      ]),
      zeroShotClassification: jest.fn().mockResolvedValue({
        labels: ['personal growth', 'reflection'],
        scores: [0.8, 0.6],
      }),
    })),
  }
})
```

## Test Utilities

### Mock Data

Create mock data for testing in `src/test/mocks/`:

```tsx
// src/test/mocks/user.ts
export const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedPassword123',
}

// src/test/mocks/journal.ts
export const mockJournalEntry = {
  id: 'entry123',
  title: 'Test Entry',
  content: 'Test content...',
  userId: 'user123',
  createdAt: new Date(),
  updatedAt: new Date(),
}

// src/test/mocks/auth.ts
export const mockSession = {
  user: {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/profile.jpg',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

// src/test/mocks/ai.ts
export const mockTextAnalysis = {
  suggestions: [
    {
      text: 'Text content to analyze',
      confidence: 0.9,
      category: 'grammar',
      replacement: 'Text content to analyze.',
      explanation: 'Grammar improvement suggestion',
      context: 'Text content to analyze',
    },
    {
      text: 'Full text content',
      confidence: 0.8,
      category: 'style',
      explanation: 'Your writing could be more readable.',
    },
  ],
  autoCompletions: ['with additional details.'],
  writingStyle: {
    readability: 75,
    complexity: 5,
    suggestions: ['Consider using simpler words.'],
  },
}

export const mockAIInsights = [
  {
    id: 'insight1',
    entryId: 'entry123',
    type: 'theme',
    content: 'This entry focuses on personal growth.',
    confidence: 0.85,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'insight2',
    entryId: 'entry123',
    type: 'pattern',
    content: 'You tend to write more in the morning.',
    confidence: 0.75,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
```

### Test Helpers

Create reusable test helpers in `src/test/helpers/`:

```tsx
// src/test/helpers/auth.ts
import { render } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'

export function renderWithAuth(ui: React.ReactElement, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => (
      <SessionProvider>{children}</SessionProvider>
    ),
    ...options,
  })
}

// src/test/helpers/api.ts
export function mockApiResponse(data: any, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  })
}

// src/test/helpers/nextauth.ts
import { NextAuthOptions } from 'next-auth'
import { mockSession } from '../mocks/auth'

export function mockNextAuth(options: Partial<NextAuthOptions> = {}) {
  return {
    providers: [],
    session: { strategy: 'jwt' },
    ...options,
  }
}

export function mockGetServerSession(session = mockSession) {
  const { getServerSession } = require('next-auth/next')
  ;(getServerSession as jest.Mock).mockResolvedValue(session)
}

// src/test/helpers/huggingface.ts
export function mockHuggingFaceResponse(responses = {}) {
  const { HfInference } = require('@huggingface/inference')
  const mockInstance = HfInference.mock.instances[0]
  
  if (responses.textGeneration) {
    mockInstance.textGeneration.mockResolvedValue(responses.textGeneration)
  }
  
  if (responses.textClassification) {
    mockInstance.textClassification.mockResolvedValue(responses.textClassification)
  }
  
  if (responses.zeroShotClassification) {
    mockInstance.zeroShotClassification.mockResolvedValue(responses.zeroShotClassification)
  }
}
```

## Writing Tests

### Component Tests

Test React components using React Testing Library:

```tsx
// src/components/__tests__/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### API Route Tests

Test API routes using Jest and Next.js test utilities:

```tsx
// src/app/api/__tests__/entries.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '../entries/route'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma')

describe('Entries API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns entries for authenticated user', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer token123',
      },
    })

    const mockEntries = [
      { id: '1', title: 'Entry 1' },
      { id: '2', title: 'Entry 2' },
    ]

    ;(prisma.journalEntry.findMany as jest.Mock).mockResolvedValue(mockEntries)

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: mockEntries,
    })
  })
})
```

### Integration Tests

Test component interactions and API integration:

```tsx
// src/app/__tests__/journal-page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithAuth } from '@/test/helpers/auth'
import JournalPage from '../journal/page'
import { mockApiResponse } from '@/test/helpers/api'

describe('Journal Page', () => {
  it('loads and displays journal entries', async () => {
    const mockEntries = [
      { id: '1', title: 'Entry 1', content: 'Content 1' },
      { id: '2', title: 'Entry 2', content: 'Content 2' },
    ]

    global.fetch = jest.fn().mockImplementation(() =>
      mockApiResponse({ success: true, data: mockEntries })
    )

    renderWithAuth(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('Entry 1')).toBeInTheDocument()
      expect(screen.getByText('Entry 2')).toBeInTheDocument()
    })
  })
})
```

### Testing AI Features

Test AI text analysis and insights:

```tsx
// src/app/api/v1/analyze/text/__tests__/route.test.ts
import { NextRequest } from 'next/server'
import { POST } from '../route'
import { mockGetServerSession } from '@/test/helpers/nextauth'
import { mockHuggingFaceResponse } from '@/test/helpers/huggingface'

describe('Text Analysis API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession()
  })

  it('analyzes text and returns suggestions', async () => {
    // Mock HuggingFace responses
    mockHuggingFaceResponse({
      textGeneration: { generated_text: 'Corrected grammar: This is a test.' },
      textClassification: [{ label: 'formal', score: 0.9 }],
    })

    // Create request
    const request = new NextRequest('http://localhost:3000/api/v1/analyze/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: 'This is a test' }),
    })

    // Call API endpoint
    const response = await POST(request)
    const data = await response.json()

    // Assert response
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('suggestions')
    expect(data).toHaveProperty('autoCompletions')
    expect(data).toHaveProperty('writingStyle')
  })

  it('returns 401 for unauthenticated users', async () => {
    // Mock unauthenticated session
    mockGetServerSession(null)

    const request = new NextRequest('http://localhost:3000/api/v1/analyze/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: 'This is a test' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

Test AI insight components:

```tsx
// src/components/journal/__tests__/AIInsights.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AIInsights } from '@/components/journal/AIInsights'
import { mockAIInsights } from '@/test/mocks/ai'

describe('AIInsights component', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockAIInsights,
      }),
    })
  })

  it('loads and displays insights', async () => {
    render(<AIInsights entryId="entry123" />)

    // Check loading state
    expect(screen.getByText(/loading insights/i)).toBeInTheDocument()

    // Wait for insights to load
    await waitFor(() => {
      expect(screen.getByText(/personal growth/i)).toBeInTheDocument()
      expect(screen.getByText(/write more in the morning/i)).toBeInTheDocument()
    })
  })

  it('allows generating new insights', async () => {
    render(<AIInsights entryId="entry123" />)

    await waitFor(() => {
      expect(screen.getByText(/personal growth/i)).toBeInTheDocument()
    })

    // Click generate button
    fireEvent.click(screen.getByText(/generate new insights/i))

    // Check loading state again
    expect(screen.getByText(/generating new insights/i)).toBeInTheDocument()

    // Wait for new insights
    await waitFor(() => {
      expect(screen.getByText(/personal growth/i)).toBeInTheDocument()
    })

    // Verify API was called
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/entries/entry123/insights'),
      expect.objectContaining({ method: 'POST' })
    )
  })
})
```

### Testing NextAuth.js Authentication

Test authentication components:

```tsx
// src/app/(auth)/__tests__/login-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/auth/LoginForm'
import { signIn } from 'next-auth/react'

jest.mock('next-auth/react')

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('submits the form with credentials', async () => {
    (signIn as jest.Mock).mockImplementation(() => Promise.resolve({ ok: true }))

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        callbackUrl: expect.any(String),
      })
    })
  })

  it('shows an error message when login fails', async () => {
    (signIn as jest.Mock).mockImplementation(() => Promise.resolve({ error: 'Invalid credentials' }))

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong-password' },
    })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('provides OAuth sign-in options', () => {
    render(<LoginForm />)

    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }))
    expect(signIn).toHaveBeenCalledWith('google', expect.anything())
  })
})
```

Test protected routes:

```tsx
// src/middleware.test.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { middleware } from '@/middleware'

jest.mock('next-auth/jwt')

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('allows access to auth routes when not authenticated', async () => {
    (getToken as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/login')
    const response = await middleware(request)

    expect(response).toBeUndefined()
  })

  it('redirects to login for protected routes when not authenticated', async () => {
    (getToken as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/journal')
    const response = await middleware(request)

    expect(response).toBeInstanceOf(NextResponse)
    expect(response.headers.get('Location')).toContain('/login')
  })

  it('allows access to protected routes when authenticated', async () => {
    (getToken as jest.Mock).mockResolvedValue({ 
      name: 'Test User', 
      email: 'test@example.com' 
    })

    const request = new NextRequest('http://localhost:3000/journal')
    const response = await middleware(request)

    expect(response).toBeUndefined()
  })
})
```

## Test Coverage

Generate test coverage reports:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## Best Practices

1. **Test Organization**
   - Group related tests using `describe`
   - Use clear test descriptions
   - Follow the Arrange-Act-Assert pattern

2. **Component Testing**
   - Test user interactions
   - Test accessibility
   - Test error states
   - Test loading states

3. **API Testing**
   - Test all HTTP methods
   - Test error responses
   - Test authentication
   - Test validation

4. **Mocking**
   - Mock external dependencies
   - Use consistent mock data
   - Clean up mocks after tests
   - Mock at the appropriate level

### AI Feature Testing Best Practices

1. **Mock External AI Services**
   - Always mock Hugging Face API calls
   - Provide consistent mock responses
   - Test various response scenarios

2. **Text Analysis Testing**
   - Test grammar suggestions
   - Test style analysis
   - Test auto-completions
   - Test error handling and fallbacks

3. **AI Insights Testing**
   - Test insight generation
   - Test different insight types
   - Test confidence thresholds
   - Test user interactions with insights

### NextAuth.js Testing Best Practices

1. **Authentication Testing**
   - Test login flows with credentials
   - Test OAuth provider flows
   - Test session handling
   - Test protected route access

2. **Session Management**
   - Test session creation
   - Test session validation
   - Test session expiration
   - Test session in API routes

3. **Error Handling**
   - Test invalid credentials
   - Test expired sessions
   - Test authentication failures
   - Test authorization failures

## Running Tests

```bash
# Run all tests
npm test

# Run AI feature tests
npm test -- -t "AI"

# Run authentication tests
npm test -- -t "Auth"

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/components/__tests__/button.test.tsx

# Run tests matching pattern
npm test -- -t "Button"
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro)
- [Next.js Testing Documentation](https://nextjs.org/docs/testing)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles) 