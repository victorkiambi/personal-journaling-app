import { subMonths, startOfDay, endOfDay, subDays, subYears } from 'date-fns';
import { getPrismaClient, withDbError, withTransaction } from '@/lib/db';
import { 
  NotFoundError, 
  DatabaseError 
} from '@/lib/errors';
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
    return withDbError(
      async () => {
        const prisma = getPrismaClient();
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

        // Build where clause
        const where: any = {
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
          
          if (sentiment !== null && mood !== null) {
            stats.totalSentiment += sentiment;
            stats.totalEntries += 1;
            stats.moodCounts[mood] = (stats.moodCounts[mood] || 0) + 1;
          }
          
          return stats;
        }, { totalSentiment: 0, totalEntries: 0, moodCounts: {} as Record<string, number> });

        const avgSentiment = sentimentStats.totalEntries > 0 ? sentimentStats.totalSentiment / sentimentStats.totalEntries : 0;

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

  private static calculateMonthlyActivity(entries: EntryWithMetadata[]): MonthlyActivity[] {
    const monthlyData = entries.reduce((acc, entry) => {
      const month = entry.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      if (!acc[month]) {
        acc[month] = { month, entries: 0, wordCount: 0 };
      }
      acc[month].entries++;
      acc[month].wordCount += entry.metadata?.wordCount || 0;
      return acc;
    }, {} as Record<string, MonthlyActivity>);

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

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
            }
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

        const patterns = entries.reduce((acc, entry) => {
          const hour = entry.createdAt.getHours();
          if (!acc[hour]) {
            acc[hour] = { hour, count: 0, wordCount: 0 };
          }
          acc[hour].count++;
          acc[hour].wordCount += entry.metadata?.wordCount || 0;
          return acc;
        }, {} as Record<number, TimeOfDayPattern>);

        return Object.values(patterns).sort((a, b) => a.hour - b.hour);
      },
      'fetch time of day patterns'
    );
  }

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