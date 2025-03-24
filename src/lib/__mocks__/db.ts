import { jest } from '@jest/globals'

export const getPrismaClient = jest.fn()
export const withDbError = jest.fn()
export const withTransaction = jest.fn()
export const withRetry = jest.fn()
export const disconnect = jest.fn()

export default {
  getPrismaClient,
  withDbError,
  withTransaction,
  withRetry,
  disconnect,
} 