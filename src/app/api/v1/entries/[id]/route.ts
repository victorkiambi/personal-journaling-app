import { NextRequest, NextResponse } from 'next/server';
import { JournalService } from '@/services/journal.service';
import { withAuth, handleApiError } from '@/app/api/middleware';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AIInsightsService } from '@/services/ai-insights.service';

// Set a reasonable timeout
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
  maxDuration: 30, // 30 seconds
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entry = await prisma.journalEntry.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        metadata: true,
        categories: true,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Generate AI insights if metadata exists
    if (entry.metadata) {
      try {
        const insights = await AIInsightsService.generateInsights(entry.id);
        return NextResponse.json({
          success: true,
          data: {
            ...entry,
            insights,
          },
        });
      } catch (error) {
        console.error('Error generating insights:', error);
        // Return entry without insights if generation fails
        return NextResponse.json({
          success: true,
          data: entry,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch entry',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (userId) => {
    try {
      const body = await request.json();
      
      // Remove any problematic fields
      if ('id' in body) {
        delete body.id;
      }
      
      const entry = await JournalService.updateEntry(userId, params.id, body);
      
      return NextResponse.json({
        success: true,
        data: entry
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (userId) => {
    try {
      await JournalService.deleteEntry(userId, params.id);
      
      return NextResponse.json({
        success: true,
        data: null
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 