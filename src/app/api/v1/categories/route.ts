import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/services/category.service';
import { withAuth, handleApiError } from '@/app/api/middleware';
import { validateRequest, categorySchema } from '@/lib/validation';
import { sanitizeCategory } from '@/lib/category';
import { DEFAULT_CATEGORY_COLOR } from '@/lib/category';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 30, // 30 seconds
};

export async function GET(request: NextRequest) {
  return withAuth(request, async (userId) => {
    try {
      const categories = await CategoryService.getCategories(userId);
      return NextResponse.json({
        success: true,
        data: categories
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (userId) => {
    try {
      const body = await request.json();
      
      // Validate request body
      const validatedData = await validateRequest(categorySchema, body);
      
      // Sanitize input
      const sanitizedData = sanitizeCategory({
        ...validatedData,
        color: validatedData.color || DEFAULT_CATEGORY_COLOR,
        description: validatedData.description || undefined,
        parentId: validatedData.parentId || undefined
      });

      const category = await CategoryService.createCategory(userId, sanitizedData);

      return NextResponse.json({
        success: true,
        data: category
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 