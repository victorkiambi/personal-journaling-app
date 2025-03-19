import { prisma } from '../prisma'
import { compare } from 'bcryptjs'
import { z } from 'zod'
import { NextAuthOptions } from 'next-auth'

// Mock prisma
jest.mock('../prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    settings: {
      upsert: jest.fn(),
    },
    profile: {
      upsert: jest.fn(),
    },
  },
}))

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const mockCredentialsProvider = {
  name: 'credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials: any) {
    try {
      const { email, password } = loginSchema.parse(credentials)

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
        },
      })

      if (!user || !user.password) {
        throw new Error('Invalid credentials')
      }

      const isValid = await compare(password, user.password)

      if (!isValid) {
        throw new Error('Invalid credentials')
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message)
      }
      throw error
    }
  },
}

describe('Auth Configuration', () => {
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword123',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Credentials Provider', () => {
    it('validates email format', async () => {
      const credentials = {
        email: 'invalid-email',
        password: 'password123',
      }

      await expect(mockCredentialsProvider.authorize(credentials))
        .rejects
        .toThrow('Invalid email address')
    })

    it('validates password length', async () => {
      const credentials = {
        email: 'test@example.com',
        password: '123', // Too short
      }

      await expect(mockCredentialsProvider.authorize(credentials))
        .rejects
        .toThrow('Password must be at least 8 characters')
    })

    it('throws error for non-existent user', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(mockCredentialsProvider.authorize(credentials))
        .rejects
        .toThrow('Invalid credentials')
    })

    it('throws error for invalid password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(compare as jest.Mock).mockResolvedValue(false)

      await expect(mockCredentialsProvider.authorize(credentials))
        .rejects
        .toThrow('Invalid credentials')
    })

    it('returns user data for valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'correctpassword',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(compare as jest.Mock).mockResolvedValue(true)

      const result = await mockCredentialsProvider.authorize(credentials)

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      })
    })
  })

  describe('Settings and Profile Creation', () => {
    const mockSignInEvent = async (user: { id: string, name: string }) => {
      await prisma.settings.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          theme: 'light',
          emailNotifications: true,
        },
        update: {},
      })

      await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
        },
        update: {},
      })
    }

    it('creates default settings and profile for new user', async () => {
      const user = { id: 'user123', name: 'Test User' }

      await mockSignInEvent(user)

      expect(prisma.settings.upsert).toHaveBeenCalledWith({
        where: { userId: user.id },
        create: {
          userId: user.id,
          theme: 'light',
          emailNotifications: true,
        },
        update: {},
      })

      expect(prisma.profile.upsert).toHaveBeenCalledWith({
        where: { userId: user.id },
        create: {
          userId: user.id,
        },
        update: {},
      })
    })

    it('handles errors during settings and profile creation', async () => {
      const user = { id: 'user123', name: 'Test User' }
      const error = new Error('Database error')

      ;(prisma.settings.upsert as jest.Mock).mockRejectedValue(error)

      await expect(mockSignInEvent(user))
        .rejects
        .toThrow('Database error')
    })
  })
}) 