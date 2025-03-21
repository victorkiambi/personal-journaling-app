import { NextRequest, NextResponse } from 'next/server';
import { AIInsightsService } from '@/services/ai-insights.service';
import { withAuth, handleApiError } from '@/app/api/middleware';

// Set a reasonable timeout
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 60, // 60 seconds for AI processing
};

/**
 * GET /api/v1/entries/[id]/insights
 * Fetch insights for a specific journal entry
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (userId) => {
    try {
      const insights = await AIInsightsService.getEntryInsights(params.id);
      return NextResponse.json({
        success: true,
        data: insights
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

/**
 * POST /api/v1/entries/[id]/insights
 * Generate new insights for a journal entry
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (userId) => {
    try {
      const insights = await AIInsightsService.generateInsights(params.id);
      return NextResponse.json({
        success: true,
        data: insights
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 