import { format, eachDayOfInterval, subMonths, startOfDay, endOfDay, parseISO, isWithinInterval, differenceInDays } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export class AnalyticsService {
  /**
   * Get analytics data for a user
   */
  static async getAnalytics(userId: string, data: z.infer<typeof import('@/lib/validation').analyticsQuerySchema>) {
    const { startDate, endDate, categoryId, timeRange } = data;

    // Get date range
    const now = new Date();
    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : now;

    // Adjust date range based on timeRange
    switch (timeRange) {
      case 'day':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'week':
        start = startOfDay(new Date(now.setDate(now.getDate() - 7)));
        end = endOfDay(new Date());
        break;
      case 'month':
        start = startOfDay(new Date(now.setMonth(now.getMonth() - 1)));
        end = endOfDay(new Date());
        break;
      case 'year':
        start = startOfDay(new Date(now.setFullYear(now.getFullYear() - 1)));
        end = endOfDay(new Date());
        break;
    }

    // Build where clause
    const where = {
      userId,
      createdAt: {
        gte: start,
        lte: end,
      },
      ...(categoryId && { categoryId }),
    };

    // Get analytics data
    const [entries, categories] = await Promise.all([
      // Get all entries with their metadata
      prisma.journalEntry.findMany({
        where,
        select: {
          id: true,
          title: true,
          createdAt: true,
          metadata: {
            select: {
              wordCount: true,
              readingTime: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      // Get categories with entry counts
      prisma.category.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          color: true,
          _count: {
            select: {
              journalEntries: true
            }
          }
        }
      })
    ]);

    // Calculate totals
    const totalWordCount = entries.reduce((sum, entry) => {
      const wordCount = entry.metadata?.wordCount || 0;
      return sum + wordCount;
    }, 0);

    const avgWordCount = entries.length > 0 ? totalWordCount / entries.length : 0;

    // Find longest entry
    const longestEntry = entries.length > 0 
      ? entries.reduce((max, entry) => {
          const wordCount = entry.metadata?.wordCount || 0;
          return wordCount > max.wordCount ? { ...entry, wordCount } : max;
        }, { wordCount: 0 } as any)
      : null;

    // Calculate writing streak
    const streak = await this.calculateWritingStreak(userId);

    // Calculate average words per day
    const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const avgWordsPerDay = totalWordCount / daysDiff;

    // Transform category data
    const categoryDistribution = categories.map(category => ({
      category: category.name,
      count: category._count.journalEntries,
      color: category.color
    }));

    // Calculate monthly activity
    const monthlyActivity = this.calculateMonthlyActivity(entries);

    // Get time of day patterns
    const timeOfDayPatterns = await this.getTimeOfDayPatterns(userId);

    // Get writing trends
    const writingTrends = await this.getWritingTrends(userId);

    return {
      summary: {
        totalEntries: entries.length,
        totalWordCount: Math.round(totalWordCount),
        averageWordsPerEntry: Math.round(avgWordCount),
        longestEntry: longestEntry ? {
          id: longestEntry.id,
          title: longestEntry.title,
          wordCount: longestEntry.wordCount,
          createdAt: longestEntry.createdAt.toISOString()
        } : null
      },
      categoryDistribution,
      monthlyActivity,
      writingStreak: streak,
      averageWordsPerDay: Math.round(avgWordsPerDay),
      timeOfDayPatterns,
      writingTrends
    };
  }

  private static calculateMonthlyActivity(entries: any[]): { month: string; entries: number; wordCount: number }[] {
    const monthlyData = new Map<string, { entries: number; wordCount: number }>();

    entries.forEach(entry => {
      const monthKey = format(entry.createdAt, 'MMM yyyy');
      const currentData = monthlyData.get(monthKey) || { entries: 0, wordCount: 0 };
      
      monthlyData.set(monthKey, {
        entries: currentData.entries + 1,
        wordCount: currentData.wordCount + (entry.metadata?.wordCount || 0)
      });
    });

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      entries: data.entries,
      wordCount: data.wordCount
    }));
  }

  private static async calculateWritingStreak(userId: string): Promise<number> {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    if (entries.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(entries[0].createdAt);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < entries.length; i++) {
      const entryDate = new Date(entries[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }

    return streak;
  }

  private static async getTimeOfDayPatterns(userId: string) {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      select: {
        createdAt: true
      }
    });
    
    // Define time periods
    const timePeriods = [
      { name: 'Morning (5am-12pm)', start: 5, end: 11, count: 0 },
      { name: 'Afternoon (12pm-5pm)', start: 12, end: 16, count: 0 },
      { name: 'Evening (5pm-9pm)', start: 17, end: 20, count: 0 },
      { name: 'Night (9pm-5am)', start: 21, end: 4, count: 0 }
    ];
    
    // Count entries in each time period
    entries.forEach(entry => {
      const hour = entry.createdAt.getHours();
      
      for (const period of timePeriods) {
        // Handle night period that spans across midnight
        if (period.start > period.end) {
          if (hour >= period.start || hour <= period.end) {
            period.count += 1;
            break;
          }
        } else if (hour >= period.start && hour <= period.end) {
          period.count += 1;
          break;
        }
      }
    });
    
    return timePeriods;
  }

  private static async getWritingTrends(userId: string, months = 6) {
    const endDate = new Date();
    const startDate = subMonths(endDate, months);
    
    // Get all entries with metadata
    const entries = await prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        createdAt: true,
        metadata: {
          select: {
            wordCount: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Group by month
    const monthlyData = new Map();
    
    // Initialize all months
    for (let i = 0; i <= months; i++) {
      const date = subMonths(endDate, i);
      const monthKey = format(date, 'yyyy-MM');
      monthlyData.set(monthKey, { 
        month: format(date, 'MMM yyyy'),
        entryCount: 0,
        totalWords: 0,
        avgWordsPerEntry: 0 
      });
    }
    
    // Process entries
    entries.forEach(entry => {
      const monthKey = format(entry.createdAt, 'yyyy-MM');
      const data = monthlyData.get(monthKey);
      
      if (data) {
        data.entryCount += 1;
        data.totalWords += entry.metadata?.wordCount || 0;
        data.avgWordsPerEntry = Math.round(data.totalWords / data.entryCount);
      }
    });
    
    // Convert to array and sort by date
    return Array.from(monthlyData.values())
      .sort((a, b) => {
        const dateA = parseISO(`${a.month}-01`);
        const dateB = parseISO(`${b.month}-01`);
        return dateA.getTime() - dateB.getTime();
      });
  }
} 