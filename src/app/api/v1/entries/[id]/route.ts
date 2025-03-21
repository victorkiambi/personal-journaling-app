import { NextRequest, NextResponse } from 'next/server';
import { JournalService } from '@/services/journal.service';
import { withAuth, handleApiError } from '@/app/api/middleware';
import { validateRequest, journalEntrySchema } from '@/lib/validation';
import { sanitizeJournalEntry } from '@/lib/journal';
import { AIInsightsService } from '@/services/ai-insights.service';

// Set a reasonable timeout
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
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
      const entry = await JournalService.getEntry(userId, params.id);
      return NextResponse.json({
        success: true,
        data: entry
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
      const validatedData = await validateRequest(journalEntrySchema, body);
      const sanitizedData = sanitizeJournalEntry(validatedData);
      const entry = await JournalService.updateEntry(userId, params.id, sanitizedData);

      return NextResponse.json({
        success: true,
        data: entry
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
      await JournalService.deleteEntry(userId, params.id);
      return NextResponse.json({
        success: true,
        message: 'Entry deleted successfully'
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 