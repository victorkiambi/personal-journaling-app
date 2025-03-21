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
 * GET /api/v1/insights
 * Fetch all insights for the authenticated user
 * Optional query parameters:
 * - timeRange: 'day' | 'week' | 'month' | 'year'
 * - type: 'theme' | 'pattern' | 'recommendation'
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (userId) => {
    try {
      const { searchParams } = new URL(request.url);
      
      const options: {
        timeRange?: 'day' | 'week' | 'month' | 'year';
        type?: 'theme' | 'pattern' | 'recommendation';
      } = {};
      
      // Parse query parameters
      const timeRange = searchParams.get('timeRange');
      if (timeRange && ['day', 'week', 'month', 'year'].includes(timeRange)) {
        options.timeRange = timeRange as 'day' | 'week' | 'month' | 'year';
      }
      
      const type = searchParams.get('type');
      if (type && ['theme', 'pattern', 'recommendation'].includes(type)) {
        options.type = type as 'theme' | 'pattern' | 'recommendation';
      }
      
      const insights = await AIInsightsService.getUserInsights(userId, options);
      
      return NextResponse.json({
        success: true,
        data: insights
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 