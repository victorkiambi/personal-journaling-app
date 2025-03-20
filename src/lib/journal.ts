import { JournalEntryData } from '@/types';
import { sanitizeContent } from './sanitize';

/**
 * Calculate word count and reading time for journal content
 */
export function calculateContentMetrics(content: string) {
  const wordCount = content ? content.split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
  return { wordCount, readingTime };
}

/**
 * Sanitize journal entry data
 */
export function sanitizeJournalEntry(data: JournalEntryData): JournalEntryData {
  return {
    ...data,
    title: sanitizeContent(data.title),
    content: sanitizeContent(data.content),
  };
}

/**
 * Build Prisma where clause for journal entries
 */
export function buildEntryWhereClause(
  userId: string,
  filters?: {
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
    searchQuery?: string;
  }
) {
  return {
    userId,
    ...(filters?.categoryId && {
      categories: {
        some: {
          id: filters.categoryId
        }
      }
    }),
    ...(filters?.startDate && {
      createdAt: {
        gte: filters.startDate
      }
    }),
    ...(filters?.endDate && {
      createdAt: {
        lte: filters.endDate
      }
    }),
    ...(filters?.searchQuery && {
      OR: [
        { title: { contains: filters.searchQuery, mode: 'insensitive' } },
        { content: { contains: filters.searchQuery, mode: 'insensitive' } }
      ]
    })
  };
}

/**
 * Build Prisma include clause for journal entries
 */
export const entryIncludeClause = {
  categories: {
    select: {
      id: true,
      name: true,
      color: true
    }
  },
  metadata: {
    select: {
      wordCount: true,
      readingTime: true
    }
  }
};

/**
 * Build Prisma transaction options
 */
export const transactionOptions = {
  timeout: 10000, // 10 second timeout
  maxWait: 5000, // Maximum time to wait for transaction to start
  isolationLevel: 'ReadCommitted' as const // Use a less strict isolation level
}; 