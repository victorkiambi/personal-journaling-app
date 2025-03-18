import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/services/category.service';
import { withAuth, handleApiError } from '@/app/api/middleware';

export async function POST(request: NextRequest) {
  return withAuth(request, async (userId) => {
    try {
      const body = await request.json();
      const category = await CategoryService.createCategory(userId, body);
      
      return NextResponse.json({
        success: true,
        data: category
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (userId) => {
    try {
      const { searchParams } = new URL(request.url);
      const hierarchical = searchParams.get('hierarchical') === 'true';

      const categories = hierarchical
        ? await CategoryService.getCategoryHierarchy(userId)
        : await CategoryService.getCategories(userId);
      
      return NextResponse.json({
        success: true,
        data: categories
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 