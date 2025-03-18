import { PrismaClient } from '@prisma/client';
import { CategoryData } from '@/types';

const prisma = new PrismaClient();

export class CategoryService {
  static async createCategory(userId: string, data: CategoryData) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId,
        name: data.name
      }
    });

    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    const category = await prisma.category.create({
      data: {
        userId,
        name: data.name,
        color: data.color,
        description: data.description,
        parentId: data.parentId
      },
      include: {
        parent: true,
        children: true
      }
    });

    return category;
  }

  static async updateCategory(userId: string, categoryId: string, data: Partial<CategoryData>) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    if (data.name) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          userId,
          name: data.name,
          id: { not: categoryId }
        }
      });

      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        color: data.color,
        description: data.description,
        parentId: data.parentId
      },
      include: {
        parent: true,
        children: true
      }
    });

    return updatedCategory;
  }

  static async deleteCategory(userId: string, categoryId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });
  }

  static async getCategory(userId: string, categoryId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId
      },
      include: {
        parent: true,
        children: true,
        entries: {
          include: {
            metadata: true
          }
        }
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  static async getCategories(userId: string) {
    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return categories;
  }

  static async getCategoryHierarchy(userId: string) {
    const categories = await this.getCategories(userId);
    
    const buildHierarchy = (parentId: string | null = null): any[] => {
      return categories
        .filter(category => category.parentId === parentId)
        .map(category => ({
          ...category,
          children: buildHierarchy(category.id)
        }));
    };

    return buildHierarchy();
  }
} 