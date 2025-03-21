import { z } from 'zod';
import {
  sanitizeCategory,
  buildCategoryWhereClause,
  processCategoryData,
  categoryIncludeClause
} from '@/lib/category';
import { getPrismaClient, withDbError, withTransaction } from '@/lib/db';
import { 
  NotFoundError, 
  DuplicateError, 
  InvalidOperationError,
} from '@/lib/errors';
import type { CategoryData } from '@/types';

export class CategoryService {
  /**
   * Get all categories for a user
   * @param userId - The ID of the user
   * @returns Array of categories with entry counts
   */
  static async getCategories(userId: string) {
    return withDbError(
      async () => {
        const prisma = getPrismaClient();
        return await prisma.category.findMany({
          where: buildCategoryWhereClause(userId),
          include: categoryIncludeClause,
          orderBy: { name: 'asc' },
        });
      },
      'fetch categories'
    );
  }

  /**
   * Create a new category
   * @param userId - The ID of the user
   * @param data - The category data
   * @returns The created category
   */
  static async createCategory(userId: string, data: z.infer<typeof import('@/lib/validation').categorySchema>) {
    return withTransaction(async (prisma) => {
      // Prepare data for processing
      const preparedData: CategoryData = {
        name: data.name,
        color: data.color || '#000000', // Ensure color is always defined
        description: data.description ?? undefined,
        parentId: data.parentId ?? undefined
      };

      // Sanitize and process data
      const sanitizedData = sanitizeCategory(preparedData);
      const processedData = processCategoryData(sanitizedData);

      // Check if category with same name exists
      const existingCategory = await prisma.category.findFirst({
        where: {
          userId,
          name: processedData.name,
        },
      });

      if (existingCategory) {
        throw new DuplicateError('category');
      }

      return await prisma.category.create({
        data: {
          ...processedData,
          userId,
        },
        include: categoryIncludeClause,
      });
    }, 'create category');
  }

  /**
   * Get a single category by ID
   * @param userId - The ID of the user
   * @param categoryId - The ID of the category
   * @returns The category
   */
  static async getCategory(userId: string, categoryId: string) {
    return withDbError(
      async () => {
        const prisma = getPrismaClient();
        const category = await prisma.category.findFirst({
          where: buildCategoryWhereClause(userId, categoryId),
          include: categoryIncludeClause,
        });

        if (!category) {
          throw new NotFoundError('Category');
        }

        return category;
      },
      'fetch category'
    );
  }

  /**
   * Update a category
   * @param userId - The ID of the user
   * @param categoryId - The ID of the category
   * @param data - The updated category data
   * @returns The updated category
   */
  static async updateCategory(userId: string, categoryId: string, data: z.infer<typeof import('@/lib/validation').categorySchema>) {
    return withTransaction(async (prisma) => {
      // Prepare data for processing
      const preparedData: CategoryData = {
        name: data.name,
        color: data.color || '#000000', // Ensure color is always defined
        description: data.description ?? undefined,
        parentId: data.parentId ?? undefined
      };

      // Sanitize and process data
      const sanitizedData = sanitizeCategory(preparedData);
      const processedData = processCategoryData(sanitizedData);

      // Check if another category with same name exists
      const existingCategory = await prisma.category.findFirst({
        where: {
          userId,
          name: processedData.name,
          NOT: {
            id: categoryId,
          },
        },
      });

      if (existingCategory) {
        throw new DuplicateError('category');
      }

      // First verify the category exists and belongs to the user
      const category = await prisma.category.findFirst({
        where: buildCategoryWhereClause(userId, categoryId),
      });

      if (!category) {
        throw new NotFoundError('Category');
      }

      return await prisma.category.update({
        where: { id: categoryId },
        data: processedData,
        include: categoryIncludeClause,
      });
    }, 'update category');
  }

  /**
   * Delete a category
   * @param userId - The ID of the user
   * @param categoryId - The ID of the category
   */
  static async deleteCategory(userId: string, categoryId: string) {
    return withTransaction(async (prisma) => {
      // First check if the category has any entries
      const category = await prisma.category.findFirst({
        where: buildCategoryWhereClause(userId, categoryId),
        include: {
          _count: {
            select: {
              journalEntries: true,
            },
          },
        },
      });

      if (!category) {
        throw new NotFoundError('Category');
      }

      if (category._count.journalEntries > 0) {
        throw new InvalidOperationError('Cannot delete category with existing entries');
      }

      await prisma.category.delete({
        where: { id: categoryId },
      });
    }, 'delete category');
  }
} 