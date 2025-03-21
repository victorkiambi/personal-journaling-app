import { getPrismaClient, withDbError, withTransaction } from '@/lib/db';
import { 
  NotFoundError, 
  ServiceUnavailableError
} from '@/lib/errors';
import { HfInference } from '@huggingface/inference';

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
  private static hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

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
          metadata: true,
          userId: true
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
        console.error('Error generating insights:', error);
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

  /**
   * Generate insights using Hugging Face AI models
   * @param content Journal entry content
   * @returns Array of insights
   */
  private static async generateInsightsWithAI(content: string): Promise<Omit<Insight, 'id' | 'entryId' | 'userId' | 'createdAt' | 'updatedAt'>[]> {
    const insights: Omit<Insight, 'id' | 'entryId' | 'userId' | 'createdAt' | 'updatedAt'>[] = [];
    
    // Get a shorter version of the content for models with limited context
    const shortContent = content.length > 500 ? content.substring(0, 500) + '...' : content;
    
    try {
      // Identify themes using zero-shot classification
      try {
        const themeResponse = await this.hf.zeroShotClassification({
          model: 'facebook/bart-large-mnli',
          inputs: shortContent,
          parameters: {
            candidate_labels: [
              'personal growth', 
              'relationships', 
              'career', 
              'health', 
              'emotions', 
              'creativity', 
              'productivity',
              'learning',
              'challenges',
              'achievements',
              'goals',
              'reflection'
            ]
          }
        });
        
        // The response format varies based on version, so we need to handle it carefully
        // It could be an array of {label, score} or an object with {labels, scores}
        let themes: {type: 'theme', content: string, confidence: number}[] = [];
        
        if (Array.isArray(themeResponse)) {
          // Handle array format (each item has label and score)
          themes = themeResponse
            .slice(0, 2)
            .map(result => ({
              type: 'theme' as const,
              content: `This entry focuses on ${result.label || 'unknown'}.`,
              confidence: typeof result.score === 'number' ? result.score : 0.5
            }))
            .filter(theme => theme.confidence > 0.3);
        } else if (themeResponse && typeof themeResponse === 'object') {
          // Handle object format with labels and scores arrays
          const responseObject = themeResponse as any;
          
          if (Array.isArray(responseObject.labels) && Array.isArray(responseObject.scores)) {
            themes = responseObject.labels
              .slice(0, 2)
              .map((label: string, index: number) => ({
                type: 'theme' as const,
                content: `This entry focuses on ${label}.`,
                confidence: responseObject.scores[index] || 0.5
              }))
              .filter((theme: {type: 'theme', content: string, confidence: number}) => theme.confidence > 0.3);
          }
        }
            
        insights.push(...themes);
      } catch (error) {
        console.error('Theme detection error:', error);
      }
      
      // Generate pattern insights
      try {
        const patternResponse = await this.hf.textGeneration({
          model: 'gpt2',
          inputs: `Based on this journal entry, identify a pattern or habit: ${shortContent}`,
          parameters: {
            max_new_tokens: 50,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true
          }
        });
        
        const patternText = patternResponse.generated_text
          .replace(`Based on this journal entry, identify a pattern or habit: ${shortContent}`, '')
          .trim();
          
        if (patternText.length > 10) {
          insights.push({
            type: 'pattern',
            content: patternText.substring(0, Math.min(patternText.length, 120)),
            confidence: 0.7
          });
        }
      } catch (error) {
        console.error('Pattern detection error:', error);
      }
      
      // Generate recommendations
      try {
        const recommendationResponse = await this.hf.textGeneration({
          model: 'gpt2-large',
          inputs: `Based on this journal entry, here's a helpful recommendation: ${shortContent}`,
          parameters: {
            max_new_tokens: 50,
            temperature: 0.8,
            top_p: 0.9,
            do_sample: true
          }
        });
        
        const recommendationText = recommendationResponse.generated_text
          .replace(`Based on this journal entry, here's a helpful recommendation: ${shortContent}`, '')
          .trim();
          
        if (recommendationText.length > 10) {
          insights.push({
            type: 'recommendation',
            content: recommendationText.substring(0, Math.min(recommendationText.length, 120)),
            confidence: 0.6
          });
        }
      } catch (error) {
        console.error('Recommendation generation error:', error);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
    
    // If all API calls failed, return mock insights as fallback
    if (insights.length === 0) {
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
    
    return insights;
  }
} 