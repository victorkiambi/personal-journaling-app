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
  maxDuration: 30, // 30 seconds
};

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

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

    // Calculate writing style metrics
    const readability = calculateReadability(sanitizedContent);
    const complexity = calculateComplexity(sanitizedContent);

    // Get grammar suggestions from HuggingFace's grammar correction model
    let grammarSuggestions: TextSuggestion[] = [];
    try {
      // Split content into sentences for more accurate grammar checking
      const sentences = sanitizedContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      for (const sentence of sentences) {
        if (sentence.length < 10) continue; // Skip very short sentences
        
        const grammarResponse = await hf.textGeneration({
          model: 'pszemraj/flan-t5-large-grammar-synthesis',
          inputs: `Correct grammar: ${sentence}`,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.1,
            top_p: 0.95,
          },
        });
        
        const correctedText = grammarResponse.generated_text.replace('Correct grammar:', '').trim();
        
        // Only add suggestion if there's a meaningful difference
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
    } catch (grammarError) {
      console.error('Error in grammar check:', grammarError);
    }

    // Get auto-completions using Hugging Face's GPT2 model
    let autoCompletions: string[] = [];
    try {
      // Only generate completions if the text ends with a sentence fragment
      const lastSentence = sanitizedContent.split(/[.!?]+/).pop()?.trim() || '';
      if (lastSentence && !lastSentence.endsWith('.') && !lastSentence.endsWith('!') && !lastSentence.endsWith('?')) {
        const completionResponse = await hf.textGeneration({
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
        });

        autoCompletions = Array.isArray(completionResponse)
          ? completionResponse
              .map(r => r.generated_text.replace(sanitizedContent, '').trim())
              .filter(text => text.length > 5 && text.length < 50) // Filter out too short or too long completions
          : [completionResponse.generated_text.replace(sanitizedContent, '').trim()];
      }
    } catch (completionError) {
      console.error('Error generating completions:', completionError);
    }

    // Get style suggestions using Hugging Face's text classification model
    let styleSuggestions: TextSuggestion[] = [];
    try {
      // Only analyze style for longer texts
      if (sanitizedContent.length > 50) {
        const styleResponse = await hf.textClassification({
          model: 'cointegrated/rubert-tiny2-writing-style',
          inputs: sanitizedContent,
        });

        const styleAnalysis = Array.isArray(styleResponse) ? styleResponse : [styleResponse];
        
        // Only add style suggestions if confidence is high enough
        styleSuggestions = styleAnalysis
          .filter(result => result.score > 0.7)
          .map(result => ({
            text: sanitizedContent,
            confidence: result.score,
            category: 'style',
            explanation: `Your writing style appears to be ${result.label.toLowerCase()}. Consider adjusting for better clarity if needed.`,
          }));
      }
    } catch (styleError) {
      console.error('Error analyzing writing style:', styleError);
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
      suggestions: [...grammarSuggestions, ...styleSuggestions],
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