import { PrismaClient } from '@prisma/client';
import { JournalEntryData, PaginatedResponse } from '@/types';

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export class JournalService {
  static async createEntry(userId: string, data: JournalEntryData) {
    // Calculate word count and reading time
    const wordCount = data.content ? data.content.split(/\s+/).length : 0;
    const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
    
    // Create entry and metadata in a single transaction with optimized includes
    const entry = await prisma.$transaction(async (tx) => {
      const newEntry = await tx.journalEntry.create({
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
              readingTime,
            }
          }
        },
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          metadata: {
            select: {
              wordCount: true,
              readingTime: true
            }
          }
        }
      });
      
      return newEntry;
    }, {
      timeout: 10000, // 10 second timeout for the transaction
      maxWait: 5000, // Maximum time to wait for transaction to start
      isolationLevel: 'ReadCommitted' // Use a less strict isolation level
    });

    return entry;
  }

  static async updateEntry(userId: string, entryId: string, data: Partial<JournalEntryData>) {
    try {
      // Calculate word count and reading time if content is provided
      const wordCount = data.content ? data.content.split(/\s+/).length : undefined;
      const readingTime = wordCount ? Math.ceil(wordCount / 200) : undefined;
      
      // Update entry and metadata in a single transaction with optimized includes
      return await prisma.$transaction(async (tx) => {
        const updatedEntry = await tx.journalEntry.update({
          where: { 
            id: entryId,
            userId
          },
          data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.content !== undefined && { content: data.content }),
            ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
            ...(data.categoryIds && {
              categories: {
                set: data.categoryIds.map(id => ({ id }))
              }
            }),
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
            categories: {
              select: {
                id: true,
                name: true,
                color: true
              }
            },
            metadata: {
              select: {
                wordCount: true,
                readingTime: true
              }
            }
          }
        });
        
        return updatedEntry;
      }, {
        timeout: 10000, // 10 second timeout for the transaction
        maxWait: 5000, // Maximum time to wait for transaction to start
        isolationLevel: 'ReadCommitted' // Use a less strict isolation level
      });
    } catch (error) {
      console.error('Error in updateEntry:', error);
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
        categories: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        metadata: {
          select: {
            wordCount: true,
            readingTime: true
          }
        }
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
    // Use a transaction to ensure consistent results
    return await prisma.$transaction(async (tx) => {
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

      // Run count and findMany in parallel for better performance
      const [total, items] = await Promise.all([
        tx.journalEntry.count({ where }),
        tx.journalEntry.findMany({
          where,
          include: {
            categories: {
              select: {
                id: true,
                name: true,
                color: true
              }
            },
            metadata: {
              select: {
                wordCount: true,
                readingTime: true
              }
            }
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' }
        })
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages
      };
    }, {
      timeout: 10000, // 10 second timeout
      maxWait: 5000, // Maximum time to wait for transaction to start
      isolationLevel: 'ReadCommitted' // Use a less strict isolation level
    });
  }
} 