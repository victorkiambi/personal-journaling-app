import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import natural from 'natural';
import { sanitizeContent } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content } = await request.json();
    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      );
    }

    // Sanitize the content before analysis
    const sanitizedContent = sanitizeContent(content);

    // Initialize natural.js components
    const tokenizer = new natural.WordTokenizer();
    const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const tfidf = new natural.TfIdf();

    // Analyze writing style
    const sentences = sanitizedContent.split(/[.!?]+/);
    const words = tokenizer.tokenize(sanitizedContent);
    const complexity = words.length / sentences.length;
    const readability = calculateReadability(sanitizedContent);
    
    const suggestions = [];
    if (complexity > 20) {
      suggestions.push('Consider breaking down longer sentences for better readability');
    }
    if (readability < 60) {
      suggestions.push('Try using simpler words and shorter sentences');
    }

    // Detect themes
    tfidf.addDocument(sanitizedContent);
    const themes = tfidf.listTerms(0).slice(0, 5).map(term => term.term);

    // Analyze patterns
    const tokens = tokenizer.tokenize(sanitizedContent);
    const sentimentScore = analyzer.getSentiment(tokens);
    const emotion = getEmotionFromSentiment(sentimentScore);
    
    const topics = tfidf.listTerms(0).slice(0, 5).map(term => term.term);

    return NextResponse.json({
      success: true,
      data: {
        writingStyle: {
          complexity,
          readability,
          suggestions
        },
        themes,
        patterns: {
          topics,
          emotions: [emotion]
        }
      }
    });
  } catch (error) {
    console.error('Error analyzing content:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).length;
  const words = text.trim().split(/\s+/).length;
  const syllables = countSyllables(text);

  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
}

function countSyllables(text: string): number {
  return text.toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/[^aeiouy]+/g, ' ')
    .trim()
    .split(' ')
    .length;
}

function getEmotionFromSentiment(score: number): string {
  if (score > 0.5) return 'joy';
  if (score > 0) return 'contentment';
  if (score === 0) return 'neutral';
  if (score > -0.5) return 'sadness';
  return 'anger';
} 