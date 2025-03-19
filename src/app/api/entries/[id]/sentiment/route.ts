import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SentimentService } from '@/services/sentiment.service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const entryId = params.id;
    const sentiment = await SentimentService.analyzeSentiment(entryId);

    return NextResponse.json(sentiment);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') as 'day' | 'week' | 'month' | 'year' || 'month';

    const insights = await SentimentService.getMoodInsights(session.user.id, timeRange);

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error getting mood insights:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 