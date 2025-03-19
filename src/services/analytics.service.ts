import { subMonths, startOfDay, endOfDay, subDays, subYears } from 'date-fns';
import { prisma } from '@/lib/prisma';
import type { JournalEntry } from "@prisma/client";

type EntryMetadataWithSentiment = {
  wordCount: number;
  readingTime: number;
  sentimentScore: number | null;
  sentimentMagnitude: number | null;
  mood: string | null;
};

type EntryWithMetadata = JournalEntry & {
  metadata: EntryMetadataWithSentiment | null;
};

type LongestEntry = EntryWithMetadata & { wordCount: number };

type MonthlyActivity = {
  month: string;
  entries: number;
  wordCount: number;
};

type TimeOfDayPattern = {
  hour: number;
  count: number;
  wordCount: number;
};

type WritingTrend = {
  date: string;
  wordCount: number;
};

export class AnalyticsService {
  /**
   * Get analytics data for a user
   */
  static async getAnalytics(
    userId: string,
    options: {
      timeRange: 'day' | 'week' | 'month' | 'year';
      categoryId?: string;
    }
  ) {
    const { timeRange, categoryId } = options;
    const now = new Date();
    let start = new Date();

    // Adjust date range
    switch (timeRange) {
      case 'day':
        start = startOfDay(now);
        break;
      case 'week':
        start = startOfDay(subDays(now, 7));
        break;
      case 'month':
        start = startOfDay(subMonths(now, 1));
        break;
      case 'year':
        start = startOfDay(subYears(now, 1));
        break;
    }

    const end = endOfDay(now);

    // Add debug logging for date range
    console.log('Date Range:', {
      start: start.toISOString(),
      end: end.toISOString()
    });

    // Build where clause
    const where: any = {
      userId,
      createdAt: {
        gte: start,
        lte: end
      }
    };

    // Add debug logging for query parameters
    console.log('Query Parameters:', {
      userId,
      timeRange,
      categoryId,
      where,
      start: start.toISOString(),
      end: end.toISOString()
    });

    if (categoryId) {
      where.categories = {
        some: {
          id: categoryId
        }
      };
    }

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
              readingTime: true,
              sentimentScore: true,
              sentimentMagnitude: true,
              mood: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }) as Promise<EntryWithMetadata[]>,
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

    // Add debug logging for entries
    console.log('Entries with metadata:', entries.map(e => ({
      id: e.id,
      title: e.title,
      createdAt: e.createdAt.toISOString(),
      metadata: e.metadata
    })));

    // Calculate totals
    const totalWordCount = entries.reduce((sum, entry) => {
      const wordCount = entry.metadata?.wordCount || 0;
      return sum + wordCount;
    }, 0);

    const avgWordCount = entries.length > 0 ? totalWordCount / entries.length : 0;

    // Calculate sentiment statistics
    const sentimentStats = entries.reduce((stats, entry) => {
      const sentiment = entry.metadata?.sentimentScore ?? null;
      const mood = entry.metadata?.mood ?? null;
      
      // Debug log for each entry
      console.log('Processing entry:', {
        id: entry.id,
        title: entry.title,
        sentiment,
        mood,
        metadata: entry.metadata
      });
      
      // Include entries that have sentiment data, even if score is 0
      if (sentiment !== null && mood !== null) {
        stats.totalSentiment += sentiment;
        stats.totalEntries += 1;
        stats.moodCounts[mood] = (stats.moodCounts[mood] || 0) + 1;
        
        // Debug log for successful sentiment processing
        console.log('Added sentiment:', {
          entryId: entry.id,
          currentTotal: stats.totalSentiment,
          currentCount: stats.totalEntries,
          currentMoods: stats.moodCounts
        });
      } else {
        // Debug log for skipped entries
        console.log('Skipped entry:', {
          entryId: entry.id,
          reason: sentiment === null ? 'missing sentiment' : 'missing mood'
        });
      }
      
      return stats;
    }, { totalSentiment: 0, totalEntries: 0, moodCounts: {} as Record<string, number> });

    const avgSentiment = sentimentStats.totalEntries > 0 ? sentimentStats.totalSentiment / sentimentStats.totalEntries : 0;

    // Add debug logging for sentiment stats
    console.log('Final Sentiment Stats:', {
      totalEntries: sentimentStats.totalEntries,
      totalSentiment: sentimentStats.totalSentiment,
      avgSentiment,
      moodCounts: sentimentStats.moodCounts,
      hasSentiment: entries.some(e => e.metadata?.sentimentScore !== null && e.metadata?.mood !== null),
      entries: entries.map(e => ({
        id: e.id,
        title: e.title,
        sentiment: e.metadata?.sentimentScore ?? null,
        mood: e.metadata?.mood ?? null,
        metadata: e.metadata
      }))
    });

    // Find longest entry
    const longestEntry = entries.length > 0 
      ? entries.reduce<LongestEntry>((max, entry) => {
          const currentWordCount = entry.metadata?.wordCount || 0;
          if (currentWordCount > (max.wordCount || 0)) {
            return { ...entry, wordCount: currentWordCount };
          }
          return max;
        }, { ...entries[0], wordCount: entries[0].metadata?.wordCount || 0 })
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
        } : null,
        sentiment: sentimentStats.totalEntries > 0 ? {
          averageScore: avgSentiment,
          moodDistribution: sentimentStats.moodCounts
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

  private static calculateMonthlyActivity(entries: EntryWithMetadata[]): MonthlyActivity[] {
    const monthlyData = new Map<string, { entries: number; wordCount: number }>();

    entries.forEach(entry => {
      const month = entry.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      const current = monthlyData.get(month) || { entries: 0, wordCount: 0 };
      
      monthlyData.set(month, {
        entries: current.entries + 1,
        wordCount: current.wordCount + (entry.metadata?.wordCount || 0)
      });
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        entries: data.entries,
        wordCount: data.wordCount
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private static async calculateWritingStreak(userId: string): Promise<number> {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
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

  private static async getTimeOfDayPatterns(userId: string): Promise<TimeOfDayPattern[]> {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      select: {
        createdAt: true,
        metadata: {
          select: {
            wordCount: true
          }
        }
      }
    });

    const patterns = new Array(24).fill(0).map(() => ({ count: 0, wordCount: 0 }));

    entries.forEach(entry => {
      const hour = entry.createdAt.getHours();
      patterns[hour].count++;
      patterns[hour].wordCount += entry.metadata?.wordCount || 0;
    });

    return patterns.map((pattern, hour) => ({
      hour,
      count: pattern.count,
      wordCount: pattern.wordCount
    }));
  }

  private static async getWritingTrends(userId: string): Promise<WritingTrend[]> {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
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

    return entries.map(entry => ({
      date: entry.createdAt.toISOString(),
      wordCount: entry.metadata?.wordCount || 0
    }));
  }
} 