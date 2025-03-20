import { getPrismaClient, withDbError, withTransaction } from '@/lib/db';
import { 
  NotFoundError, 
  DatabaseError,
  ServiceUnavailableError
} from '@/lib/errors';
import type { JournalEntry } from "@prisma/client";
import {
  tokenizer,
  tfidf,
  analyzer,
  calculateReadability,
  countSyllables,
  getEmotionFromSentiment,
  detectTimeOfDay,
  extractThemes,
  generateSummary
} from '@/lib/text-analysis';

interface AIInsights {
  categories: string[];
  writingStyle: {
    complexity: number;
    readability: number;
    suggestions: string[];
  };
  themes: string[];
  summary: string;
  patterns: {
    topics: string[];
    emotions: string[];
    timeOfDay: string;
  };
}

type EntryWithMetadata = JournalEntry & {
  metadata: {
    wordCount: number;
    readingTime: number;
    sentimentScore: number | null;
    sentimentMagnitude: number | null;
    mood: string | null;
  } | null;
};

type Insight = {
  id: string;
  entryId: string;
  userId: string;
  type: 'theme' | 'pattern' | 'recommendation';
  content: string;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
};

export class AIInsightsService {
  /**
   * Generate insights for a journal entry
   */
  static async generateInsights(entryId: string) {
    return withTransaction(async (prisma) => {
      // Get the entry content
      const entry = await prisma.journalEntry.findUnique({
        where: { id: entryId },
        select: { 
          id: true,
          content: true,
          metadata: true
        }
      });

      if (!entry) {
        throw new NotFoundError('Journal entry');
      }

      try {
        // Generate insights using AI
        const insights = await this.generateInsightsWithAI(entry.content);

        // Store insights in the database
        const storedInsights = await Promise.all(
          insights.map(insight =>
            prisma.insight.create({
              data: {
                entryId,
                userId: entry.userId,
                type: insight.type,
                content: insight.content,
                confidence: insight.confidence
              }
            })
          )
        );

        return storedInsights;
      } catch (error) {
        throw new ServiceUnavailableError('Failed to generate insights');
      }
    }, 'generate insights');
  }

  /**
   * Get insights for a journal entry
   */
  static async getEntryInsights(entryId: string) {
    return withDbError(
      async () => {
        const prisma = getPrismaClient();
        const insights = await prisma.insight.findMany({
          where: { entryId },
          orderBy: { createdAt: 'desc' }
        });

        return insights;
      },
      'fetch entry insights'
    );
  }

  /**
   * Get insights for a user
   */
  static async getUserInsights(userId: string, options: {
    timeRange?: 'day' | 'week' | 'month' | 'year';
    type?: 'theme' | 'pattern' | 'recommendation';
  } = {}) {
    return withDbError(
      async () => {
        const prisma = getPrismaClient();
        const { timeRange, type } = options;

        // Build where clause
        const where: any = { userId };
        if (type) {
          where.type = type;
        }

        // Add time range if specified
        if (timeRange) {
          const now = new Date();
          let start = new Date();

          switch (timeRange) {
            case 'day':
              start.setHours(0, 0, 0, 0);
              break;
            case 'week':
              start.setDate(now.getDate() - 7);
              break;
            case 'month':
              start.setMonth(now.getMonth() - 1);
              break;
            case 'year':
              start.setFullYear(now.getFullYear() - 1);
              break;
          }

          where.createdAt = {
            gte: start,
            lte: now
          };
        }

        // Get insights with entry details
        const insights = await prisma.insight.findMany({
          where,
          include: {
            entry: {
              select: {
                id: true,
                title: true,
                createdAt: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return insights;
      },
      'fetch user insights'
    );
  }

  /**
   * Delete an insight
   */
  static async deleteInsight(insightId: string) {
    return withTransaction(async (prisma) => {
      const insight = await prisma.insight.findUnique({
        where: { id: insightId }
      });

      if (!insight) {
        throw new NotFoundError('Insight');
      }

      await prisma.insight.delete({
        where: { id: insightId }
      });

      return { success: true };
    }, 'delete insight');
  }

  private static async generateInsightsWithAI(content: string): Promise<Omit<Insight, 'id' | 'entryId' | 'userId' | 'createdAt' | 'updatedAt'>[]> {
    // TODO: Implement actual AI integration
    // This is a placeholder that returns mock insights
    return [
      {
        type: 'theme',
        content: 'The entry reflects on personal growth and self-discovery.',
        confidence: 0.85
      },
      {
        type: 'pattern',
        content: 'You tend to write more about personal development in the morning.',
        confidence: 0.75
      },
      {
        type: 'recommendation',
        content: 'Consider exploring your thoughts on career development in more detail.',
        confidence: 0.65
      }
    ];
  }

  /**
   * Suggest categories based on content
   */
  private static async suggestCategories(entry: JournalEntry): Promise<string[]> {
    const tokens = tokenizer.tokenize(entry.content);
    
    // Add entry content to TF-IDF
    tfidf.addDocument(entry.content);

    // Get top terms
    const terms = tfidf.listTerms(0);
    const topTerms = terms.slice(0, 5).map(term => term.term);

    // Match with existing categories
    const categories = await prisma.category.findMany({
      where: { userId: entry.userId }
    });

    return categories
      .filter(category => 
        topTerms.some(term => 
          category.name.toLowerCase().includes(term.toLowerCase())
        )
      )
      .map(category => category.name);
  }

  /**
   * Analyze writing style and provide suggestions
   */
  private static async analyzeWritingStyle(entry: JournalEntry) {
    const sentences = entry.content.split(/[.!?]+/);
    const words = tokenizer.tokenize(entry.content);

    // Calculate complexity (average words per sentence)
    const complexity = words.length / sentences.length;

    // Calculate readability (Flesch Reading Ease)
    const readability = calculateReadability(entry.content);

    // Generate suggestions
    const suggestions = [];
    if (complexity > 20) {
      suggestions.push('Consider breaking down longer sentences for better readability');
    }
    if (readability < 60) {
      suggestions.push('Try using simpler words and shorter sentences');
    }

    return {
      complexity,
      readability,
      suggestions
    };
  }

  /**
   * Detect themes in the entry
   */
  private static async detectThemes(entry: JournalEntry): Promise<string[]> {
    return extractThemes(entry.content);
  }

  /**
   * Generate a summary of the entry
   */
  private static async generateSummary(entry: JournalEntry): Promise<string> {
    return generateSummary(entry.content);
  }

  /**
   * Analyze patterns in the entry
   */
  private static async analyzePatterns(entry: JournalEntry) {
    const tokens = tokenizer.tokenize(entry.content);
    
    // Analyze sentiment
    const sentimentScore = analyzer.getSentiment(tokens);
    const emotion = getEmotionFromSentiment(sentimentScore);

    // Extract topics using TF-IDF
    const topics = extractThemes(entry.content);

    // Determine time of day based on content
    const timeOfDay = detectTimeOfDay(entry.content);

    return {
      topics,
      emotions: [emotion],
      timeOfDay
    };
  }
} 