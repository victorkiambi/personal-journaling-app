import natural from 'natural';
import type { Prisma } from "@prisma/client";
import { getPrismaClient, withDbError, withTransaction } from '@/lib/db';
import { 
  NotFoundError, 
} from '@/lib/errors';

type MoodStats = {
  very_positive: number;
  positive: number;
  neutral: number;
  negative: number;
  very_negative: number;
  averageSentiment: number;
};

type Mood = keyof Omit<MoodStats, 'averageSentiment'>;

type JournalEntryWithMetadata = Prisma.JournalEntryGetPayload<{
  include: {
    metadata: true;
  };
}>;

export class SentimentService {
  private static analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

  /**
   * Analyze sentiment of a journal entry
   */
  static async analyzeSentiment(entryId: string) {
    return withTransaction(async (prisma) => {
      // Get the entry content
      const entry = await prisma.journalEntry.findUnique({
        where: { id: entryId },
        select: { content: true }
      });

      if (!entry) {
        throw new NotFoundError('Journal entry');
      }

      // Analyze sentiment using Natural
      const tokens = new natural.WordTokenizer().tokenize(entry.content);
      const sentimentScore = this.analyzer.getSentiment(tokens);

      // Normalize score to -1 to 1 range with stronger weights
      // We divide by 2 to get stronger scores, and then apply a sigmoid-like function
      // to maintain the -1 to 1 range while emphasizing differences
      const normalizedBase = Math.max(-1, Math.min(1, sentimentScore / 2));
      const normalizedScore = Math.sign(normalizedBase) * Math.pow(Math.abs(normalizedBase), 0.7);

      // Calculate magnitude (strength of sentiment)
      const magnitude = Math.abs(sentimentScore);

      // Determine mood based on sentiment score
      const mood = this.getMoodFromScore(normalizedScore);

      // Calculate word count and reading time
      const wordCount = entry.content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);

      // Store sentiment analysis results using upsert
      const metadata = await prisma.entryMetadata.upsert({
        where: { entryId },
        create: {
          entryId,
          wordCount,
          readingTime,
          sentimentScore: normalizedScore,
          sentimentMagnitude: magnitude,
          mood
        },
        update: {
          sentimentScore: normalizedScore,
          sentimentMagnitude: magnitude,
          mood
        }
      });

      return {
        score: normalizedScore,
        magnitude,
        mood,
        sentences: this.analyzeSentences(entry.content)
      };
    }, 'analyze sentiment');
  }

  /**
   * Get mood insights for a user
   */
  static async getMoodInsights(userId: string, timeRange: 'day' | 'week' | 'month' | 'year' = 'month') {
    return withDbError(
      async () => {
        const prisma = getPrismaClient();
        const now = new Date();
        let startDate = new Date();

        // Adjust date range
        switch (timeRange) {
          case 'day':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        // Get entries with sentiment data
        const entries = await prisma.journalEntry.findMany({
          where: {
            userId,
            createdAt: {
              gte: startDate,
              lte: now
            }
          },
          include: {
            metadata: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        // Calculate mood statistics
        const moodStats = this.calculateMoodStats(entries);

        return {
          entries: entries.map(entry => ({
            id: entry.id,
            title: entry.title,
            date: entry.createdAt.toISOString(),
            sentiment: entry.metadata?.sentimentScore ?? 0,
            magnitude: entry.metadata?.sentimentMagnitude ?? 0,
            mood: entry.metadata?.mood ?? 'neutral'
          })),
          statistics: moodStats
        };
      },
      'fetch mood insights'
    );
  }

  private static getMoodFromScore(score: number): Mood {
    if (score >= 0.3) return 'very_positive';
    if (score > 0.1) return 'positive';
    if (Math.abs(score) <= 0.1) return 'neutral';
    if (score > -0.3) return 'negative';
    return 'very_negative';
  }

  private static calculateMoodStats(entries: JournalEntryWithMetadata[]): MoodStats {
    const moods = entries.map(entry => (entry.metadata?.mood ?? 'neutral') as Mood);
    const total = moods.length;

    const stats: MoodStats = {
      very_positive: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      very_negative: 0,
      averageSentiment: 0
    };

    let totalSentiment = 0;

    moods.forEach(mood => {
      stats[mood]++;
    });

    entries.forEach(entry => {
      totalSentiment += entry.metadata?.sentimentScore ?? 0;
    });

    stats.averageSentiment = total > 0 ? totalSentiment / total : 0;

    return stats;
  }

  private static analyzeSentences(content: string) {
    // Split content into sentences using simple regex
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordTokenizer = new natural.WordTokenizer();

    return sentences.map(sentence => {
      const tokens = wordTokenizer.tokenize(sentence);
      const score = this.analyzer.getSentiment(tokens);
      const normalizedBase = Math.max(-1, Math.min(1, score / 2));
      const normalizedScore = Math.sign(normalizedBase) * Math.pow(Math.abs(normalizedBase), 0.7);
      const magnitude = Math.abs(score);

      return {
        content: sentence,
        score: normalizedScore,
        magnitude
      };
    });
  }
} 