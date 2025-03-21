import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sanitizeContent } from '@/lib/sanitize';
import { HfInference } from '@huggingface/inference';
import { handleApiError } from '@/app/api/middleware';
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
    const body = await request.json();
    const { content } = await requestSchema.parseAsync(body);
    const sanitizedContent = sanitizeContent(content);

    // Calculate writing style metrics
    const readability = calculateReadability(sanitizedContent);
    const complexity = calculateComplexity(sanitizedContent);

    // Get grammar suggestions from HuggingFace's grammar correction model
    let grammarSuggestions: TextSuggestion[] = [];
    try {
      console.log('Checking grammar for text:', sanitizedContent.substring(0, 100) + '...');
      
      // Use HuggingFace's grammar correction model
      const grammarResponse = await hf.textGeneration({
        model: 'pszemraj/flan-t5-large-grammar-synthesis',
        inputs: `Correct grammar: ${sanitizedContent.substring(0, 500)}`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.1,
          top_p: 0.95,
        },
      });
      
      const correctedText = grammarResponse.generated_text;
      
      // Compare original and corrected text to identify changes
      if (sanitizedContent !== correctedText) {
        grammarSuggestions.push({
          text: sanitizedContent,
          confidence: 0.9,
          category: 'grammar',
          replacement: correctedText,
          explanation: 'Grammar improvement suggestion',
        });
      }

    } catch (grammarError) {
      console.error('Error in grammar check:', grammarError);
      // Don't throw the error, just log it and continue with other analysis
    }

    // Get auto-completions using Hugging Face's GPT2 model
    let autoCompletions: string[] = [];
    try {
      const completionResponse = await hf.textGeneration({
        model: 'gpt2',
        inputs: `${sanitizedContent}\n`,
        parameters: {
          max_new_tokens: 30,
          num_return_sequences: 3,
          temperature: 0.8,
          top_k: 50,
          top_p: 0.9,
          repetition_penalty: 1.2,
          do_sample: true,
        },
      });

      autoCompletions = Array.isArray(completionResponse) 
        ? completionResponse.map(r => r.generated_text.replace(sanitizedContent, '').trim())
        : [completionResponse.generated_text.replace(sanitizedContent, '').trim()];
    } catch (completionError) {
      console.error('Error generating completions:', completionError);
    }

    // Get style suggestions using Hugging Face's text classification model
    let styleSuggestions: TextSuggestion[] = [];
    try {
      const styleResponse = await hf.textClassification({
        model: 'cointegrated/rubert-tiny2-writing-style',
        inputs: sanitizedContent,
      });

      const styleAnalysis = Array.isArray(styleResponse) ? styleResponse : [styleResponse];
      styleSuggestions = styleAnalysis.map(result => ({
        text: sanitizedContent,
        confidence: result.score,
        category: 'style',
        explanation: `Your writing style appears to be ${result.label.toLowerCase()}. Consider adjusting for better clarity if needed.`,
      }));
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

    return NextResponse.json({
      success: true,
      data: {
        writingStyle: {
          complexity,
          readability,
          suggestions: writingStyleSuggestions,
        },
        suggestions: [...grammarSuggestions, ...styleSuggestions],
        autoCompletions: autoCompletions.filter(text => text.length > 0),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
} 