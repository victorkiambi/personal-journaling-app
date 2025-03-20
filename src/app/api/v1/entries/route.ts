import { NextRequest, NextResponse } from 'next/server';
import { JournalService } from '@/services/journal.service';
import { withAuth, handleApiError } from '@/app/api/middleware';
import { validateRequest, journalEntrySchema, handleValidationError } from '@/lib/validation';
import { sanitizeJournalEntry } from '@/lib/journal';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
  maxDuration: 30, // 30 seconds
};

export async function GET(request: NextRequest) {
  return withAuth(request, async (userId) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '10');
      const categoryId = searchParams.get('categoryId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const search = searchParams.get('search');

      const entries = await JournalService.getEntries(
        userId,
        page,
        pageSize,
        {
          categoryId: categoryId || undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          searchQuery: search || undefined,
        }
      );

      return NextResponse.json({
        success: true,
        data: entries
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
      const validatedData = await validateRequest(journalEntrySchema, body);
      
      // Sanitize content
      const sanitizedData = sanitizeJournalEntry(validatedData);

      const entry = await JournalService.createEntry(userId, sanitizedData);

      return NextResponse.json({
        success: true,
        data: entry
      });
    } catch (error) {
      return handleValidationError(error);
    }
  });
} 