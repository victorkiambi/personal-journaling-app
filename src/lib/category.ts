import { CategoryData } from '@/types';
import { sanitizeContent } from './sanitize';

/**
 * Sanitize category data by cleaning input strings
 * @param data - The category data to sanitize
 * @returns Sanitized category data
 */
export function sanitizeCategory(data: CategoryData): CategoryData {
  return {
    ...data,
    name: sanitizeContent(data.name).trim(),
    description: data.description ? sanitizeContent(data.description).trim() : undefined,
  };
}

/**
 * Build Prisma where clause for categories
 * @param userId - The ID of the user
 * @param categoryId - Optional category ID for specific queries
 * @returns Prisma where clause object
 */
export function buildCategoryWhereClause(userId: string, categoryId?: string) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  return {
    userId,
    ...(categoryId && { id: categoryId }),
  };
}

/**
 * Default category color
 */
export const DEFAULT_CATEGORY_COLOR = '#000000';

/**
 * Process category data for database operations
 * @param data - The category data to process
 * @returns Processed category data with default values
 */
export function processCategoryData(data: CategoryData) {
  if (!data) {
    throw new Error('Category data is required');
  }

  const { color, ...rest } = data;
  return {
    ...rest,
    color: color || DEFAULT_CATEGORY_COLOR,
  };
}

/**
 * Category include clause for Prisma queries
 * Includes count of related journal entries
 */
export const categoryIncludeClause = {
  _count: {
    select: {
      journalEntries: true,
    },
  },
} as const;

/**
 * Type for the category include clause
 */
export type CategoryInclude = typeof categoryIncludeClause; 