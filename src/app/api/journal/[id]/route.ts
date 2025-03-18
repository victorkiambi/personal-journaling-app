import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { calculateReadingTime, calculateWordCount } from '@/lib/text-utils';

const journalEntrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
});

// Set a reasonable timeout that's not excessive
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
  maxDuration: 30, // 30 seconds timeout
};

// GET a single journal entry
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: params.id,
        userId: payload.userId,
      },
      include: {
        categories: true,
        metadata: true,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, message: 'Journal entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch journal entry' },
      { status: 500 }
    );
  }
}

// PUT/PATCH to update a journal entry
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = journalEntrySchema.parse(body);

    // Verify the entry exists and belongs to the user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id: params.id,
        userId: payload.userId,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, message: 'Journal entry not found' },
        { status: 404 }
      );
    }

    // Verify all categories exist and belong to the user
    const categories = await prisma.category.findMany({
      where: {
        id: { in: validatedData.categoryIds },
        userId: payload.userId,
      },
    });

    if (categories.length !== validatedData.categoryIds.length) {
      return NextResponse.json(
        { success: false, message: 'One or more categories are invalid' },
        { status: 400 }
      );
    }

    // Calculate metadata
    const wordCount = calculateWordCount(validatedData.content);
    const readingTime = calculateReadingTime(wordCount);

    // Update the entry
    const updatedEntry = await prisma.journalEntry.update({
      where: {
        id: params.id,
      },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        categories: {
          set: validatedData.categoryIds.map(id => ({ id })),
        },
        metadata: {
          update: {
            wordCount,
            readingTime,
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
      data: updatedEntry,
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: error.errors[0].message,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to update journal entry',
    }, { status: 500 });
  }
}

// DELETE a journal entry
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the entry exists and belongs to the user
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: params.id,
        userId: payload.userId,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, message: 'Journal entry not found' },
        { status: 404 }
      );
    }

    // Delete the entry (metadata will be cascade deleted)
    await prisma.journalEntry.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete journal entry',
    }, { status: 500 });
  }
} 