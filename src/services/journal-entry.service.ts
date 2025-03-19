import { prisma } from "@/lib/prisma";
import { SentimentService } from "./sentiment.service";

export class JournalEntryService {
  /**
   * Create a new journal entry
   */
  static async createEntry(data: {
    title: string;
    content: string;
    userId: string;
    categoryIds?: string[];
  }) {
    const { title, content, userId, categoryIds } = data;

    // Create the entry with metadata
    const entry = await prisma.journalEntry.create({
      data: {
        title,
        content,
        userId,
        categories: categoryIds ? {
          connect: categoryIds.map(id => ({ id }))
        } : undefined,
        metadata: {
          create: {
            wordCount: content.split(/\s+/).length,
            readingTime: Math.ceil(content.split(/\s+/).length / 200) // Assuming 200 words per minute
          }
        }
      },
      include: {
        metadata: true
      }
    });

    // Analyze sentiment asynchronously
    this.analyzeSentimentAsync(entry.id);

    return entry;
  }

  /**
   * Update a journal entry
   */
  static async updateEntry(id: string, data: {
    title?: string;
    content?: string;
    categoryIds?: string[];
  }) {
    const { title, content, categoryIds } = data;

    // Update the entry with metadata
    const entry = await prisma.journalEntry.update({
      where: { id },
      data: {
        title,
        content,
        categories: categoryIds ? {
          set: categoryIds.map(id => ({ id }))
        } : undefined,
        metadata: content ? {
          update: {
            wordCount: content.split(/\s+/).length,
            readingTime: Math.ceil(content.split(/\s+/).length / 200)
          }
        } : undefined
      },
      include: {
        metadata: true
      }
    });

    // Analyze sentiment asynchronously if content was updated
    if (content) {
      this.analyzeSentimentAsync(entry.id);
    }

    return entry;
  }

  /**
   * Delete a journal entry
   */
  static async deleteEntry(id: string) {
    return prisma.journalEntry.delete({
      where: { id }
    });
  }

  /**
   * Get a journal entry by ID
   */
  static async getEntry(id: string) {
    return prisma.journalEntry.findUnique({
      where: { id },
      include: {
        categories: true,
        metadata: true
      }
    });
  }

  /**
   * Get all entries for a user
   */
  static async getEntries(userId: string) {
    return prisma.journalEntry.findMany({
      where: { userId },
      include: {
        categories: true,
        metadata: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Analyze sentiment asynchronously
   */
  private static async analyzeSentimentAsync(entryId: string) {
    try {
      await SentimentService.analyzeSentiment(entryId);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      // Don't throw the error as this is an async operation
    }
  }
} 