import { NextRequest, NextResponse } from 'next/server'
import { POST } from '../route'
import { UserService } from '@/services/user.service'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      ...new Response(JSON.stringify(body), init),
      json: async () => body
    }))
  }
}))

// Mock NextRequest
class MockNextRequest implements Partial<NextRequest> {
  public readonly url: string
  public readonly method: string
  private readonly bodyText: string
  public readonly cookies: any
  public readonly nextUrl: any
  public readonly page: any
  public readonly ua: any
  public readonly headers: Headers

  constructor(url: string, init?: { method?: string; body?: string }) {
    this.url = url
    this.method = init?.method || 'GET'
    this.bodyText = init?.body || ''
    this.cookies = {}
    this.nextUrl = new URL(url)
    this.page = {}
    this.ua = {}
    this.headers = new Headers()
  }

  async json() {
    return JSON.parse(this.bodyText)
  }

  clone(): NextRequest {
    return this as unknown as NextRequest
  }
}

// Mock UserService
jest.mock('@/services/user.service', () => ({
  UserService: {
    changePassword: jest.fn(),
  },
}))

// Mock middleware
jest.mock('@/app/api/middleware', () => ({
  withAuth: jest.fn((request, handler) => handler('test-user-id')),
  handleApiError: jest.fn((error) => NextResponse.json({ error: error.message }, { status: 400 })),
}))

// Mock validation
jest.mock('@/lib/validation', () => ({
  validateRequest: jest.fn(async (schema, data) => {
    return schema.parse(data)
  }),
  changePasswordSchema: {
    parse: jest.fn((data) => {
      if (!data.currentPassword) {
        const error = new Error('Current password is required')
        error.name = 'ValidationError'
        throw error
      }
      if (data.newPassword && data.newPassword.length < 8) {
        const error = new Error('Password must be at least 8 characters')
        error.name = 'ValidationError'
        throw error
      }
      return data
    }),
  },
  handleValidationError: jest.fn((error) => 
    NextResponse.json({ 
      error: 'Validation error', 
      details: error.message 
    }, { 
      status: 400 
    })
  ),
}))

describe('Change Password API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createRequest = (body: any): NextRequest => {
    return new MockNextRequest('http://localhost:3000/api/v1/users/change-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }) as unknown as NextRequest
  }

  it('validates request body', async () => {
    const request = createRequest({
      // Missing required fields
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation error')
  })

  it('requires current password', async () => {
    const request = createRequest({
      newPassword: 'newPassword123',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation error')
    expect(data.details).toBe('Current password is required')
  })

  it('requires new password to be at least 8 characters', async () => {
    const request = createRequest({
      currentPassword: 'currentPass123',
      newPassword: '123', // Too short
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Validation error')
    expect(data.details).toBe('Password must be at least 8 characters')
  })

  it('changes password successfully', async () => {
    const requestBody = {
      currentPassword: 'currentPass123',
      newPassword: 'newPassword123',
    }

    const request = createRequest(requestBody)

    const response = await POST(request)
    const data = await response.json()

    expect((UserService as any).changePassword).toHaveBeenCalledWith('test-user-id', requestBody)
    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      message: 'Password changed successfully',
    })
  })

  it('handles service errors', async () => {
    const error = new Error('Failed to change password')
    ;((UserService as any).changePassword as jest.Mock).mockRejectedValue(error)

    const request = createRequest({
      currentPassword: 'currentPass123',
      newPassword: 'newPassword123',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Failed to change password')
  })

  it('requires authentication', async () => {
    const error = new Error('Unauthorized')
    error.name = 'UnauthorizedError'
    ;(require('@/app/api/middleware').withAuth as jest.Mock).mockImplementationOnce(() => {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    })

    const request = createRequest({
      currentPassword: 'currentPass123',
      newPassword: 'newPassword123',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })
}) 