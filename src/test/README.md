# Testing Documentation

## Overview

The Shamiri Journal application uses Jest and React Testing Library for testing. The test suite includes unit tests, integration tests, and end-to-end tests for components, API routes, and utilities.

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
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
}))
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

## Running Tests

```bash
# Run all tests
npm test

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