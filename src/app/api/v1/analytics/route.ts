import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/analytics.service';
import { withAuth, handleApiError } from '@/app/api/middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      const [summaryData, categoryDistribution, entryFrequency, writingTrends, timeOfDayPatterns] = await Promise.all([
        AnalyticsService.getJournalSummary(userId),
        AnalyticsService.getCategoryDistribution(userId),
        AnalyticsService.getEntryFrequency(userId, months),
        AnalyticsService.getWritingTrends(userId, months),
        AnalyticsService.getTimeOfDayPatterns(userId)
      ]);
      
      // Get the longest entry details if entries exist
      let longestEntry = null;
      if (summaryData.totalEntries > 0) {
        // Find entry with the highest word count
        const entry = await prisma.journalEntry.findFirst({
          where: { 
            userId,
            metadata: {
              wordCount: summaryData.longestEntry
            }
          },
          select: {
            id: true,
            title: true,
            createdAt: true,
            metadata: {
              select: {
                wordCount: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        
        if (entry) {
          longestEntry = {
            id: entry.id,
            title: entry.title,
            wordCount: entry.metadata?.wordCount || 0,
            createdAt: entry.createdAt.toISOString()
          };
        }
      }
      
      // Transform data to match frontend interface
      const summary = {
        totalEntries: summaryData.totalEntries,
        totalWordCount: summaryData.totalWords,
        averageWordsPerEntry: summaryData.avgWordsPerEntry,
        longestEntry: longestEntry || {
          id: '',
          title: 'No entries yet',
          wordCount: 0,
          createdAt: new Date().toISOString()
        }
      };
      
      // Transform category distribution to match frontend format
      const transformedCategoryDistribution = categoryDistribution.map(cat => ({
        name: cat.name,
        count: cat.value, // API returns 'value', frontend expects 'count'
        color: cat.color
      }));
      
      return NextResponse.json({
        success: true,
        data: {
          summary,
          categoryDistribution: transformedCategoryDistribution,
          entryFrequency,
          writingTrends: writingTrends.map(trend => ({
            month: trend.month,
            entries: trend.entryCount, // API returns 'entryCount', frontend expects 'entries'
            avgWords: trend.avgWordsPerEntry // API returns 'avgWordsPerEntry', frontend expects 'avgWords'
          })),
          timeOfDayPatterns: timeOfDayPatterns.map(period => ({
            hour: period.start, // Use the start hour to represent the time period
            count: period.count
          })),
          writingStreak: summaryData.currentStreak,
          averageWordsPerDay: summaryData.avgWordsPerDay
        }
      });
    } catch (error) {
      console.error('Analytics API error:', error);
      return handleApiError(error);
    }
  });
} 