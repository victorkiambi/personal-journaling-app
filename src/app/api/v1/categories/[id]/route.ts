import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/services/category.service';
import { withAuth, handleApiError } from '@/app/api/middleware';

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
      const category = await CategoryService.updateCategory(userId, params.id, body);
      
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
        data: null
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 