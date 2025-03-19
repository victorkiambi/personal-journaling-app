import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill TextEncoder/TextDecoder for Next.js API routes
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock the Request object for Next.js API routes
global.Request = class Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    return new globalThis.Request(input, init)
  }
} as any

// Mock the Response object for Next.js API routes
global.Response = class MockResponse {
  private body: any
  public status: number
  public statusText: string
  public headers: Headers

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Headers(init?.headers)
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }
} as any 