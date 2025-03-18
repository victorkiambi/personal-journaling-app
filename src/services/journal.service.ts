import { PrismaClient } from '@prisma/client';
import { JournalEntryData, PaginatedResponse } from '@/types';

const prisma = new PrismaClient();

export class JournalService {
  static async createEntry(userId: string, data: JournalEntryData) {
    const wordCount = data.content ? data.content.split(/\s+/).length : 0;
    
    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        isPublic: data.isPublic ?? false,
        categories: data.categoryIds ? {
          connect: data.categoryIds.map(id => ({ id }))
        } : undefined,
        metadata: {
          create: {
            wordCount,
            readingTime: Math.ceil(wordCount / 200), // Assuming 200 words per minute
          }
        }
      },
      include: {
        categories: true,
        metadata: true
      }
    });

    return entry;
  }

  static async updateEntry(userId: string, entryId: string, data: Partial<JournalEntryData>) {
    try {
      // Calculate word count only if content is provided (more efficient)
      const wordCount = data.content ? data.content.split(/\s+/).length : undefined;
      const readingTime = wordCount ? Math.ceil(wordCount / 200) : undefined;
    
      // Use a single update operation with a where clause that includes userId
      return await prisma.journalEntry.update({
        where: { 
          id: entryId,
          userId // This ensures the user owns the entry
        },
        data: {
          // Only update fields that are provided
          ...(data.title !== undefined && { title: data.title }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
          
          // Update categories if provided
          ...(data.categoryIds && {
            categories: {
              set: data.categoryIds.map(id => ({ id }))
            }
          }),
          
          // Only update metadata if word count changed
          ...(wordCount !== undefined && {
            metadata: {
              upsert: {
                create: {
                  wordCount,
                  readingTime
                },
                update: {
                  wordCount,
                  readingTime
                }
              }
            }
          })
        },
        include: {
          categories: true,
          metadata: true
        }
      });
    } catch (error) {
      console.error('Error in updateEntry:', error);
      // Add more context to the error
      if (error.code === 'P2025') {
        throw new Error('Entry not found or you do not have permission to update it');
      }
      throw error;
    }
  }

  static async deleteEntry(userId: string, entryId: string) {
    // Use a single delete operation with a where clause that includes userId
    const result = await prisma.journalEntry.deleteMany({
      where: {
        id: entryId,
        userId // This ensures the user owns the entry
      }
    });
    
    if (result.count === 0) {
      throw new Error('Entry not found or you do not have permission to delete it');
    }
  }

  static async getEntry(userId: string, entryId: string) {
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId
      },
      include: {
        categories: true,
        metadata: true
      }
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    return entry;
  }

  static async getEntries(
    userId: string,
    page = 1,
    pageSize = 10,
    filters?: {
      categoryId?: string;
      startDate?: Date;
      endDate?: Date;
      searchQuery?: string;
    }
  ): Promise<PaginatedResponse<any>> {
    const where = {
      userId,
      ...(filters?.categoryId && {
        categories: {
          some: {
            id: filters.categoryId
          }
        }
      }),
      ...(filters?.startDate && {
        createdAt: {
          gte: filters.startDate
        }
      }),
      ...(filters?.endDate && {
        createdAt: {
          lte: filters.endDate
        }
      }),
      ...(filters?.searchQuery && {
        OR: [
          { title: { contains: filters.searchQuery, mode: 'insensitive' } },
          { content: { contains: filters.searchQuery, mode: 'insensitive' } }
        ]
      })
    };

    const total = await prisma.journalEntry.count({ where });
    const totalPages = Math.ceil(total / pageSize);

    const items = await prisma.journalEntry.findMany({
      where,
      include: {
        categories: true,
        metadata: true
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages
    };
  }
} 