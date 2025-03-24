import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

export const prismaMock = mockDeep<PrismaClient>()

// Mock the transaction method
prismaMock.$transaction.mockImplementation(async (operations) => {
  if (Array.isArray(operations)) {
    return Promise.all(operations.map(op => op(prismaMock)))
  }
  return operations(prismaMock)
})

// Mock the user methods
prismaMock.user = {
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
} as any

// Mock the profile methods
prismaMock.profile = {
  create: jest.fn(),
  update: jest.fn(),
  findUnique: jest.fn(),
} as any

// Mock the settings methods
prismaMock.settings = {
  create: jest.fn(),
  update: jest.fn(),
  findUnique: jest.fn(),
} as any

beforeEach(() => {
  mockReset(prismaMock)
})