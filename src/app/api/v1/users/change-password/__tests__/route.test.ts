import { POST } from '../route'
import { prismaMock } from '@/lib/__mocks__/prisma'
import { hash } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'

// Mock next-auth
jest.mock('next-auth')
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(() => Promise.resolve({ sub: 'user123' }))
}))

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation(() => ({
    json: () => Promise.resolve({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!'
    })
  })),
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status || 200,
      json: async () => data
    })
  }
}))

// Mock db.ts
jest.mock('@/lib/db')

describe('Change Password API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should change password successfully', async () => {
    const hashedPassword = await hash('OldPassword123!', 10)
    
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user123',
      password: hashedPassword
    } as any)

    prismaMock.user.update.mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost')
    const response = await POST(request)
    const responseData = await response.json()

    expect(responseData).toEqual({
      success: true,
      message: 'Password changed successfully'
    })
  })

  it('should return 401 for incorrect current password', async () => {
    const hashedPassword = await hash('DifferentPassword123!', 10)
    
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user123',
      password: hashedPassword
    } as any)

    const request = new NextRequest('http://localhost')
    const response = await POST(request)
    const responseData = await response.json()

    expect(responseData).toEqual({
      success: false,
      message: 'Current password is incorrect',
      code: 'UNAUTHORIZED'
    })
    expect(response.status).toBe(401)
  })

  it('should return 400 for invalid new password format', async () => {
    const mockRequest = new NextRequest('http://localhost')
    jest.spyOn(mockRequest, 'json').mockResolvedValue({
      currentPassword: 'OldPassword123!',
      newPassword: 'short'
    })

    const response = await POST(mockRequest)
    const responseData = await response.json()

    expect(responseData).toEqual({
      success: false,
      message: expect.stringContaining('Password must be at least 8 characters'),
      code: 'VALIDATION_ERROR'
    })
    expect(response.status).toBe(400)
  })

  it('should return 401 for unauthorized access', async () => {
    jest.mocked(getToken).mockResolvedValue(null)

    const request = new NextRequest('http://localhost')
    const response = await POST(request)
    const responseData = await response.json()

    expect(responseData).toEqual({
      success: false,
      message: 'Unauthorized',
      code: 'UNAUTHORIZED'
    })
    expect(response.status).toBe(401)
  })
})