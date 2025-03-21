import { subMonths, startOfDay, endOfDay, subDays, subYears } from 'date-fns';
import { getPrismaClient, withDbError } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { JournalEntry } from "@prisma/client";

// Analytics query parameters type
export type AnalyticsQueryOptions = {
  timeRange: 'day' | 'week' | 'month' | 'year' | 'all';
  startDate?: string;
  endDate?: string;
  categoryId?: string;
};

// Entry metadata types
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

// Analytics result types
type LongestEntry = {
  id: string;
  title: string;
  wordCount: number;
  date: string;
};

export type MonthlyActivity = {
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

type CategoryDistribution = {
  category: string;
  count: number;
  color: string;
};

export type AnalyticsResult = {
  summary: {
    totalEntries: number;
    totalWordCount: number;
    avgWordCount: number;
    avgWordsPerDay: number;
    currentStreak: number;
    longestEntry: LongestEntry | null;
  };
  sentiment: {
    average: number;
    distribution: Record<string, number>;
  };
  categories: CategoryDistribution[];
  monthlyActivity: MonthlyActivity[];
  timeOfDayPatterns: TimeOfDayPattern[];
  writingTrends: WritingTrend[];
};

export class AnalyticsService {
  /**
   * Get analytics data for a user
   * @param userId - The ID of the user
   * @param options - Analytics query options
   * @returns Analytics data
   */
  static async getAnalytics(
    userId: string,
    options: AnalyticsQueryOptions
  ): Promise<AnalyticsResult> {
    return withDbError(
      async () => {
        const prisma = getPrismaClient();
        const { timeRange, categoryId, startDate, endDate } = options;
        const now = new Date();
        let start: Date;
        let end = endOfDay(now);

        // Handle custom date range if provided
        if (startDate) {
          start = startOfDay(new Date(startDate));
        } else {
          // Adjust date range based on timeRange
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
            case 'all':
              start = new Date(0); // Beginning of time
              break;
            default:
              start = startOfDay(subMonths(now, 1)); // Default to month
          }
        }

        // Override end date if provided
        if (endDate) {
          end = endOfDay(new Date(endDate));
        }

        // Build where clause
        const where: Prisma.JournalEntryWhereInput = {
          userId,
          createdAt: {
            gte: start,
            lte: end
          }
        };

        if (categoryId) {
          where.categories = {
            some: {
              id: categoryId
            }
          };
        }

        // Get analytics data - run queries in parallel
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
          }) as unknown as EntryWithMetadata[],
          
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

        // Calculate sentiment statistics
        const sentimentStats = this.calculateSentimentStats(entries);
        const avgSentiment = sentimentStats.totalEntries > 0 
          ? sentimentStats.totalSentiment / sentimentStats.totalEntries 
          : 0;

        // Find longest entry
        const longestEntry = this.findLongestEntry(entries);

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
            avgWordCount: Math.round(avgWordCount),
            avgWordsPerDay: Math.round(avgWordsPerDay),
            currentStreak: streak,
            longestEntry: longestEntry ? {
              id: longestEntry.id,
              title: longestEntry.title,
              wordCount: longestEntry.wordCount,
              date: longestEntry.createdAt.toISOString()
            } : null
          },
          sentiment: {
            average: avgSentiment,
            distribution: sentimentStats.moodCounts
          },
          categories: categoryDistribution,
          monthlyActivity,
          timeOfDayPatterns,
          writingTrends
        };
      },
      'fetch analytics'
    );
  }

  /**
   * Calculate sentiment statistics from entries
   */
  private static calculateSentimentStats(entries: EntryWithMetadata[]): {
    totalSentiment: number;
    totalEntries: number;
    moodCounts: Record<string, number>;
  } {
    return entries.reduce((stats, entry) => {
      const sentiment = entry.metadata?.sentimentScore ?? null;
      const mood = entry.metadata?.mood ?? null;
      
      if (sentiment !== null && mood !== null) {
        stats.totalSentiment += sentiment;
        stats.totalEntries += 1;
        stats.moodCounts[mood] = (stats.moodCounts[mood] || 0) + 1;
      }
      
      return stats;
    }, { totalSentiment: 0, totalEntries: 0, moodCounts: {} as Record<string, number> });
  }

  /**
   * Find the longest entry by word count
   */
  private static findLongestEntry(entries: EntryWithMetadata[]): null | {
    id: string;
    title: string;
    createdAt: Date;
    wordCount: number;
  } {
    if (entries.length === 0) return null;
    
    return entries.reduce((max, entry) => {
      const currentWordCount = entry.metadata?.wordCount || 0;
      if (currentWordCount > max.wordCount) {
        return { 
          id: entry.id,
          title: entry.title,
          createdAt: entry.createdAt,
          wordCount: currentWordCount 
        };
      }
      return max;
    }, { 
      id: entries[0].id,
      title: entries[0].title,
      createdAt: entries[0].createdAt,
      wordCount: entries[0].metadata?.wordCount || 0 
    });
  }

  /**
   * Calculate monthly activity statistics from entries
   */
  private static calculateMonthlyActivity(entries: EntryWithMetadata[]): MonthlyActivity[] {
    const monthlyData: Record<string, MonthlyActivity> = {};
    
    for (const entry of entries) {
      const month = entry.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      if (!monthlyData[month]) {
        monthlyData[month] = { month, entries: 0, wordCount: 0 };
      }
      monthlyData[month].entries++;
      monthlyData[month].wordCount += entry.metadata?.wordCount || 0;
    }

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Calculate the current writing streak for a user
   * @param userId - The ID of the user
   * @returns The current writing streak in days
   */
  private static async calculateWritingStreak(userId: string): Promise<number> {
    return withDbError(
      async () => {
        const prisma = getPrismaClient();
        const today = startOfDay(new Date());
        let streak = 0;
        let currentDate = today;

        while (true) {
          const entries = await prisma.journalEntry.findMany({
            where: {
              userId,
              createdAt: {
                gte: startOfDay(currentDate),
                lt: endOfDay(currentDate)
              }
            },
            take: 1 // We only need to know if any entries exist
          });

          if (entries.length === 0) {
            break;
          }

          streak++;
          currentDate = subDays(currentDate, 1);
        }

        return streak;
      },
      'calculate writing streak'
    );
  }

  /**
   * Get time of day writing patterns for a user
   * @param userId - The ID of the user
   * @returns Time of day patterns
   */
  private static async getTimeOfDayPatterns(userId: string): Promise<TimeOfDayPattern[]> {
    return withDbError(
      async () => {
        const prisma = getPrismaClient();
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

        const hourPatterns: Record<number, TimeOfDayPattern> = {};
        
        for (const entry of entries) {
          const hour = entry.createdAt.getHours();
          if (!hourPatterns[hour]) {
            hourPatterns[hour] = { hour, count: 0, wordCount: 0 };
          }
          hourPatterns[hour].count++;
          hourPatterns[hour].wordCount += entry.metadata?.wordCount || 0;
        }

        return Object.values(hourPatterns).sort((a, b) => a.hour - b.hour);
      },
      'fetch time of day patterns'
    );
  }

  /**
   * Get writing trends data for a user
   * @param userId - The ID of the user
   * @returns Writing trends data
   */
  private static async getWritingTrends(userId: string): Promise<WritingTrend[]> {
    return withDbError(
      async () => {
        const prisma = getPrismaClient();
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
          date: entry.createdAt.toISOString().split('T')[0],
          wordCount: entry.metadata?.wordCount || 0
        }));
      },
      'fetch writing trends'
    );
  }
} 