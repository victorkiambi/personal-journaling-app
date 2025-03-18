import { PrismaClient } from '@prisma/client';
import { JournalEntryData, PaginatedResponse } from '@/types';

const prisma = new PrismaClient();

export class JournalService {
  static async createEntry(userId: string, data: JournalEntryData) {
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
            wordCount: data.content.split(/\s+/).length,
            readingTime: Math.ceil(data.content.split(/\s+/).length / 200), // Assuming 200 words per minute
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
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId
      }
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    const updatedEntry = await prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        title: data.title,
        content: data.content,
        isPublic: data.isPublic,
        categories: data.categoryIds ? {
          set: data.categoryIds.map(id => ({ id }))
        } : undefined,
        metadata: data.content ? {
          update: {
            wordCount: data.content.split(/\s+/).length,
            readingTime: Math.ceil(data.content.split(/\s+/).length / 200),
          }
        } : undefined
      },
      include: {
        categories: true,
        metadata: true
      }
    });

    return updatedEntry;
  }

  static async deleteEntry(userId: string, entryId: string) {
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId
      }
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    await prisma.journalEntry.delete({
      where: { id: entryId }
    });
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