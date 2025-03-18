import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/analytics.service';
import { withAuth, handleApiError } from '@/app/api/middleware';

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
      const months = parseInt(searchParams.get('months') || '6');
      
      // Fetch all analytics data in parallel
      const [summary, categoryDistribution, entryFrequency, writingTrends, timeOfDayPatterns] = await Promise.all([
        AnalyticsService.getJournalSummary(userId),
        AnalyticsService.getCategoryDistribution(userId),
        AnalyticsService.getEntryFrequency(userId, months),
        AnalyticsService.getWritingTrends(userId, months),
        AnalyticsService.getTimeOfDayPatterns(userId)
      ]);
      
      return NextResponse.json({
        success: true,
        data: {
          summary,
          categoryDistribution,
          entryFrequency,
          writingTrends,
          timeOfDayPatterns
        }
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 