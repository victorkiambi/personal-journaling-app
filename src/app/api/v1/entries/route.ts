import { NextRequest, NextResponse } from 'next/server';
import { JournalService } from '@/services/journal.service';
import { withAuth, handleApiError } from '@/app/api/middleware';

export async function POST(request: NextRequest) {
  return withAuth(request, async (userId) => {
    try {
      const body = await request.json();
      const entry = await JournalService.createEntry(userId, body);
      
      return NextResponse.json({
        success: true,
        data: entry
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
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '10');
      const categoryId = searchParams.get('categoryId') || undefined;
      const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
      const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
      const searchQuery = searchParams.get('search') || undefined;

      const entries = await JournalService.getEntries(userId, page, pageSize, {
        categoryId,
        startDate,
        endDate,
        searchQuery
      });
      
      return NextResponse.json({
        success: true,
        data: entries
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 