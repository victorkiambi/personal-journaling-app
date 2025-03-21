import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/analytics.service';
import { withAuth, handleApiError } from '@/app/api/middleware';
import { validateRequest, analyticsQuerySchema } from '@/lib/validation';
import type { AnalyticsQuery } from '@/types';

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
      const { searchParams } = new URL(request.url);
      
      // Get query parameters with proper null handling
      const startDate = searchParams.get('startDate') || undefined;
      const endDate = searchParams.get('endDate') || undefined;
      const categoryId = searchParams.get('categoryId') || undefined;
      const timeRange = searchParams.get('timeRange') || 'week';

      // Validate query parameters
      const validatedData = await validateRequest(analyticsQuerySchema, {
        startDate,
        endDate,
        categoryId,
        timeRange,
      });

      const analytics = await AnalyticsService.getAnalytics(userId, validatedData as AnalyticsQuery);

      return NextResponse.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 