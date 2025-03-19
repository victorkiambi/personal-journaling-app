import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export class CategoryService {
  static async getCategories(userId: string) {
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  static async createCategory(userId: string, data: z.infer<typeof import('@/lib/validation').categorySchema>) {
    const { color, ...rest } = data;
    const category = await prisma.category.create({
      data: {
        ...rest,
        userId,
        color: color || '#000000', // Default color if not provided
      },
    });

    return category;
  }

  static async getCategory(userId: string, categoryId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  static async updateCategory(userId: string, categoryId: string, data: z.infer<typeof import('@/lib/validation').categorySchema>) {
    const { color, ...rest } = data;
    const category = await prisma.category.update({
      where: {
        id: categoryId,
        userId,
      },
      data: {
        ...rest,
        color: color || '#000000', // Default color if not provided
      },
    });

    return category;
  }

  static async deleteCategory(userId: string, categoryId: string) {
    await prisma.category.delete({
      where: {
        id: categoryId,
        userId,
      },
    });
  }
} 