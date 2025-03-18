import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateReadingTime, calculateWordCount } from '@/lib/text-utils';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

const journalEntrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = journalEntrySchema.parse(body);

    // Verify all categories exist and belong to the user
    const categories = await prisma.category.findMany({
      where: {
        id: { in: validatedData.categoryIds },
        userId: payload.userId,
      },
    });

    if (categories.length !== validatedData.categoryIds.length) {
      return NextResponse.json(
        { message: 'One or more categories are invalid' },
        { status: 400 }
      );
    }

    // Calculate metadata
    const wordCount = calculateWordCount(validatedData.content);
    const readingTime = calculateReadingTime(wordCount);

    const entry = await prisma.journalEntry.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        userId: payload.userId,
        categories: {
          connect: validatedData.categoryIds.map(id => ({ id })),
        },
        metadata: {
          create: {
            wordCount,
            readingTime,
            createdAt: new Date(),
          },
        },
      },
      include: {
        categories: true,
        metadata: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: error.errors[0].message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to create journal entry'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryId = searchParams.get('categoryId');
    const searchQuery = searchParams.get('q');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where = {
      userId: payload.userId,
      ...(categoryId && {
        categories: {
          some: {
            id: categoryId,
          },
        },
      }),
      ...(searchQuery && {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { content: { contains: searchQuery, mode: 'insensitive' } },
        ],
      }),
      ...(startDate && {
        createdAt: {
          gte: new Date(startDate),
          ...(endDate && { lte: new Date(endDate) }),
        },
      }),
    };

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        include: {
          categories: true,
          metadata: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.journalEntry.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        entries,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch journal entries'
    }, { status: 500 });
  }
} 