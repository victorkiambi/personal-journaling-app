import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sanitizeContent } from '@/lib/sanitize';
import LanguageTool from 'languagetool-api';
import { HfInference } from '@huggingface/inference';
import {
  calculateReadability,
  calculateComplexity,
  extractThemes
} from '@/lib/text-analysis';

const requestSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Initialize LanguageTool client with more specific configuration
const languageTool = new LanguageTool({
  endpoint: 'https://api.languagetool.org/v2',
  language: 'en-US',
  level: 'picky',
  enabledRules: [
    'GRAMMAR',
    'SPELLING',
    'STYLE',
    'TYPOS',
    'PUNCTUATION',
    'CONFUSED_WORDS',
    'REDUNDANCY',
    'REPETITION',
    'SENTENCE_LENGTH',
    'WORD_CHOICE'
  ],
  disabledRules: ['UPPERCASE_SENTENCE_START'], // Disable rules that might be too strict
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content } = await requestSchema.parseAsync(body);
    const sanitizedContent = sanitizeContent(content);

    // Calculate writing style metrics
    const readability = calculateReadability(sanitizedContent);
    const complexity = calculateComplexity(sanitizedContent);

    // Get grammar suggestions from LanguageTool with enhanced error handling
    let grammarSuggestions = [];
    try {
      console.log('Checking grammar for text:', sanitizedContent.substring(0, 100) + '...');
      const grammarCheck = await languageTool.check({
        text: sanitizedContent,
        language: 'en-US',
        level: 'picky',
        enabledRules: [
          'GRAMMAR',
          'SPELLING',
          'STYLE',
          'TYPOS',
          'PUNCTUATION',
          'CONFUSED_WORDS',
          'REDUNDANCY',
          'REPETITION',
          'SENTENCE_LENGTH',
          'WORD_CHOICE'
        ],
      });

      console.log('Grammar check results:', grammarCheck.matches.length, 'matches found');
      
      grammarSuggestions = grammarCheck.matches.map(match => ({
        text: match.context.text,
        confidence: match.rule.quality?.score || 1,
        category: 'grammar' as const,
        replacement: match.replacements[0]?.value,
        explanation: `${match.message} (${match.rule.description})`,
        context: match.context.text,
        offset: match.offset,
        length: match.length,
      }));

      // Sort suggestions by confidence and relevance
      grammarSuggestions.sort((a, b) => {
        // Prioritize high confidence suggestions
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        // Then prioritize suggestions with replacements
        if (a.replacement && !b.replacement) return -1;
        if (!a.replacement && b.replacement) return 1;
        return 0;
      });

    } catch (grammarError) {
      console.error('Error in grammar check:', grammarError);
      // Don't throw the error, just log it and continue with other analysis
    }

    // Get auto-completions using Hugging Face's GPT2 model
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

    const autoCompletions = Array.isArray(completionResponse) 
      ? completionResponse.map(r => r.generated_text.replace(sanitizedContent, '').trim())
      : [completionResponse.generated_text.replace(sanitizedContent, '').trim()];

    // Get style suggestions using Hugging Face's text classification model
    const styleResponse = await hf.textClassification({
      model: 'cointegrated/rubert-tiny2-writing-style',
      inputs: sanitizedContent,
    });

    const styleAnalysis = Array.isArray(styleResponse) ? styleResponse : [styleResponse];
    const styleSuggestions = styleAnalysis.map(result => ({
      text: sanitizedContent,
      confidence: result.score,
      category: 'style' as const,
      explanation: `Your writing style appears to be ${result.label.toLowerCase()}. Consider adjusting for better clarity if needed.`,
    }));

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
    console.error('Error analyzing text:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to analyze text',
      },
      { status: 500 }
    );
  }
} 