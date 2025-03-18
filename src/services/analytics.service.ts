import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, format, eachDayOfInterval, subMonths, startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';

const prisma = new PrismaClient();

export class AnalyticsService {
  /**
   * Get the total count and metrics for all journal entries by a user
   */
  static async getJournalSummary(userId: string) {
    // Get total entries
    const totalEntries = await prisma.journalEntry.count({
      where: { userId }
    });

    // Get word count data
    const entriesWithMetadata = await prisma.journalEntry.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        metadata: {
          select: {
            wordCount: true,
            readingTime: true
          }
        }
      }
    });

    let totalWords = 0;
    let avgWordsPerEntry = 0;
    let longestEntry = 0;

    if (entriesWithMetadata.length > 0) {
      totalWords = entriesWithMetadata.reduce((sum, entry) => sum + (entry.metadata?.wordCount || 0), 0);
      avgWordsPerEntry = Math.round(totalWords / entriesWithMetadata.length);
      longestEntry = Math.max(...entriesWithMetadata.map(entry => entry.metadata?.wordCount || 0));
    }

    return {
      totalEntries,
      totalWords,
      avgWordsPerEntry,
      longestEntry
    };
  }

  /**
   * Get category distribution data for charts
   */
  static async getCategoryDistribution(userId: string) {
    const categories = await prisma.category.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: {
            entries: true
          }
        }
      }
    });

    // Transform the data for the chart
    return categories.map(category => ({
      name: category.name,
      value: category._count.entries,
      color: category.color
    }));
  }

  /**
   * Get entry frequency data for heatmap/calendar
   */
  static async getEntryFrequency(userId: string, months = 6) {
    const endDate = new Date();
    const startDate = subMonths(endDate, months);

    // Get all entries in the date range
    const entries = await prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        createdAt: true
      }
    });

    // Create a map of dates to entry counts
    const dateCountMap = new Map();
    
    // Initialize all days with 0 count
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    dateRange.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      dateCountMap.set(dateKey, 0);
    });
    
    // Count entries per day
    entries.forEach(entry => {
      const dateKey = format(entry.createdAt, 'yyyy-MM-dd');
      const currentCount = dateCountMap.get(dateKey) || 0;
      dateCountMap.set(dateKey, currentCount + 1);
    });
    
    // Transform to array for the chart
    return Array.from(dateCountMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
  }

  /**
   * Get writing trends over time (words per entry, entries per month)
   */
  static async getWritingTrends(userId: string, months = 6) {
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

  /**
   * Get time-of-day writing patterns
   */
  static async getTimeOfDayPatterns(userId: string) {
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
} 