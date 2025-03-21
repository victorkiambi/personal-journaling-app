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
  maxDuration: 30, // 30 seconds
};

/**
 * DELETE /api/v1/insights/[id]
 * Delete a specific insight
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (userId) => {
    try {
      const result = await AIInsightsService.deleteInsight(params.id);
      return NextResponse.json({
        success: true,
        message: 'Insight deleted successfully'
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 