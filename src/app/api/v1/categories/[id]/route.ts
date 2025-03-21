import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/services/category.service';
import { withAuth, handleApiError } from '@/app/api/middleware';
import { validateRequest, categorySchema } from '@/lib/validation';
import { sanitizeCategory } from '@/lib/category';
import { DEFAULT_CATEGORY_COLOR } from '@/lib/category';
import { z } from 'zod';
import type { CategoryData } from '@/types';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 30, // 30 seconds
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (userId) => {
    try {
      const category = await CategoryService.getCategory(userId, params.id);
      
      return NextResponse.json({
        success: true,
        data: category
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (userId) => {
    try {
      const body = await request.json();
      const validatedData = await validateRequest(categorySchema, body);
      const sanitizedData = sanitizeCategory({
        ...validatedData,
        color: validatedData.color || DEFAULT_CATEGORY_COLOR,
        description: validatedData.description || undefined,
        parentId: validatedData.parentId || undefined
      });

      const category = await CategoryService.updateCategory(userId, params.id, sanitizedData);

      return NextResponse.json({
        success: true,
        data: category
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (userId) => {
    try {
      await CategoryService.deleteCategory(userId, params.id);
      
      return NextResponse.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 