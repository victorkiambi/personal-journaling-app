import { sanitizeContent } from './sanitize';

export interface TextSuggestion {
  text: string;
  confidence: number;
  category: 'grammar' | 'completion' | 'style';
  replacement?: string;
  explanation?: string;
  context?: string;
}

export interface WritingStyle {
  readability: number;
  complexity: number;
  suggestions: string[];
}

export interface TextAnalysis {
  suggestions: TextSuggestion[];
  autoCompletions: string[];
  writingStyle: WritingStyle;
}

export async function analyzeText(content: string): Promise<TextAnalysis> {
  const sanitizedContent = sanitizeContent(content);
  
  try {
    const response = await fetch('/api/v1/analyze/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: sanitizedContent }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze text');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing text:', error);
    return {
      suggestions: [],
      autoCompletions: [],
      writingStyle: {
        readability: 0,
        complexity: 0,
        suggestions: []
      }
    };
  }
} 