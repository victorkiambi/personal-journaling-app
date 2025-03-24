const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(next|next-auth|jose)/)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/'
  ],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  projects: [
    {
      displayName: 'dom',
      testEnvironment: 'jest-environment-jsdom',
      testMatch: [
        '<rootDir>/src/app/**/*.test.[jt]s?(x)',
        '<rootDir>/src/components/**/*.test.[jt]s?(x)'
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/components/(.*)$': '<rootDir>/src/components/$1',
        '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
      },
    },
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/services/**/*.test.[jt]s?(x)',
        '<rootDir>/src/lib/**/*.test.[jt]s?(x)'
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/components/(.*)$': '<rootDir>/src/components/$1',
        '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
      },
    },
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)