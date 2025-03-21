import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sanitizeContent } from '@/lib/sanitize';
import { HfInference } from '@huggingface/inference';
import { handleApiError } from '@/app/api/middleware';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  calculateReadability,
  calculateComplexity,
} from '@/lib/text-analysis';

// Define types for our suggestions
interface TextSuggestion {
  text: string;
  confidence: number;
  category: 'grammar' | 'style' | 'completion';
  replacement?: string;
  explanation?: string;
  context?: string;
}

const requestSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

// API configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 10, // Reduced to 10 seconds
};

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Helper function to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = await requestSchema.parseAsync(body);
    const sanitizedContent = sanitizeContent(content);

    // Calculate writing style metrics (fast, local computation)
    const readability = calculateReadability(sanitizedContent);
    const complexity = calculateComplexity(sanitizedContent);

    // Run all API calls in parallel with timeouts
    const [grammarResult, completionResult, styleResult] = await Promise.allSettled([
      // Grammar suggestions
      (async () => {
        try {
          const sentences = sanitizedContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
          const grammarSuggestions: TextSuggestion[] = [];
          
          // Only check the last 3 sentences to reduce API calls
          for (const sentence of sentences.slice(-3)) {
            if (sentence.length < 10) continue;
            
            const grammarResponse = await withTimeout(
              hf.textGeneration({
                model: 'pszemraj/flan-t5-large-grammar-synthesis',
                inputs: `Correct grammar: ${sentence}`,
                parameters: {
                  max_new_tokens: 100,
                  temperature: 0.1,
                  top_p: 0.95,
                },
              }),
              3000 // 3 second timeout
            );
            
            const correctedText = grammarResponse.generated_text.replace('Correct grammar:', '').trim();
            if (sentence !== correctedText && correctedText.length > 0) {
              grammarSuggestions.push({
                text: sentence,
                confidence: 0.9,
                category: 'grammar',
                replacement: correctedText,
                explanation: 'Grammar improvement suggestion',
                context: sentence,
              });
            }
          }
          return grammarSuggestions;
        } catch (error) {
          console.error('Error in grammar check:', error);
          return [];
        }
      })(),

      // Auto-completions
      (async () => {
        try {
          const lastSentence = sanitizedContent.split(/[.!?]+/).pop()?.trim() || '';
          if (!lastSentence || lastSentence.endsWith('.') || lastSentence.endsWith('!') || lastSentence.endsWith('?')) {
            return [];
          }

          const completionResponse = await withTimeout(
            hf.textGeneration({
              model: 'gpt2',
              inputs: `${sanitizedContent}\n`,
              parameters: {
                max_new_tokens: 20,
                num_return_sequences: 2,
                temperature: 0.7,
                top_k: 40,
                top_p: 0.9,
                repetition_penalty: 1.2,
                do_sample: true,
              },
            }),
            3000 // 3 second timeout
          );

          return Array.isArray(completionResponse)
            ? completionResponse
                .map(r => r.generated_text.replace(sanitizedContent, '').trim())
                .filter(text => text.length > 5 && text.length < 50)
            : [completionResponse.generated_text.replace(sanitizedContent, '').trim()];
        } catch (error) {
          console.error('Error generating completions:', error);
          return [];
        }
      })(),

      // Style suggestions
      (async () => {
        try {
          if (sanitizedContent.length <= 50) {
            return [];
          }

          const styleResponse = await withTimeout(
            hf.textClassification({
              model: 'facebook/roberta-hate-speech-dynabench-r4-target',
              inputs: sanitizedContent,
            }),
            3000 // 3 second timeout
          );

          const styleAnalysis = Array.isArray(styleResponse) ? styleResponse : [styleResponse];
          return styleAnalysis
            .filter(result => result.score > 0.7)
            .map(result => ({
              text: sanitizedContent,
              confidence: result.score,
              category: 'style',
              explanation: `Your writing style appears to be ${result.label.toLowerCase()}. Consider adjusting for better clarity if needed.`,
            }));
        } catch (error) {
          console.error('Error analyzing writing style:', error);
          return [];
        }
      })()
    ]);

    // Process results
    const grammarSuggestions = grammarResult.status === 'fulfilled' ? grammarResult.value : [];
    const autoCompletions = completionResult.status === 'fulfilled' ? completionResult.value : [];
    const styleSuggestions = styleResult.status === 'fulfilled' ? styleResult.value : [];

    // Add metric-based style suggestions
    const metricBasedSuggestions: TextSuggestion[] = [];
    if (readability < 60) {
      metricBasedSuggestions.push({
        text: sanitizedContent,
        confidence: 0.8,
        category: 'style',
        explanation: 'Your writing could be more readable. Try using simpler words and shorter sentences.',
      });
    }
    if (complexity > 7) {
      metricBasedSuggestions.push({
        text: sanitizedContent,
        confidence: 0.8,
        category: 'style',
        explanation: 'Your writing might be too complex. Try using more straightforward language.',
      });
    }

    // Generate writing style suggestions based on metrics
    const writingStyleSuggestions = [];
    if (readability < 60) {
      writingStyleSuggestions.push('Consider using simpler words and shorter sentences to improve readability.');
    }
    if (complexity > 7) {
      writingStyleSuggestions.push('Your writing might be too complex. Try using more straightforward language.');
    }
    if (sanitizedContent.split(/\s+/).length < 10) {
      writingStyleSuggestions.push('Try adding more detail to your entry to make it more meaningful.');
    }

    return NextResponse.json({
      suggestions: [...grammarSuggestions, ...styleSuggestions, ...metricBasedSuggestions],
      autoCompletions: autoCompletions.filter(text => text.length > 0),
      writingStyle: {
        complexity,
        readability,
        suggestions: writingStyleSuggestions,
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
} 