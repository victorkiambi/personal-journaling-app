import { PrismaClient } from '@prisma/client';
import { DatabaseError } from './errors';

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Transaction options
const transactionOptions = {
  timeout: 10000, // 10 seconds
  maxWait: 5000, // 5 seconds
  isolationLevel: 'ReadCommitted' as const,
};

/**
 * Execute a database operation with error handling
 */
export async function withDbError<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`Database error in ${context}:`, error);
    throw new DatabaseError(
      `Failed to ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Execute a database operation within a transaction
 */
export async function withTransaction<T>(
  operation: (tx: PrismaClient) => Promise<T>,
  context: string
): Promise<T> {
  return withDbError(
    async () =>
      await prisma.$transaction(operation, transactionOptions),
    context
  );
}

/**
 * Execute a database operation with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  context: string,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }

      console.warn(
        `Retry attempt ${attempt}/${maxRetries} for ${context}:`,
        lastError.message
      );

      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw new DatabaseError(
    `Failed to ${context} after ${maxRetries} attempts: ${
      lastError?.message || 'Unknown error'
    }`
  );
}

/**
 * Get the singleton PrismaClient instance
 */
export function getPrismaClient(): PrismaClient {
  return prisma;
}

/**
 * Disconnect from the database
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
} 