'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Keyboard, Sparkles } from 'lucide-react';
import type { TextAnalysis } from '@/lib/textAnalysis';
import { analyzeText } from '@/lib/textAnalysis';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TextSuggestionsProps {
  content: string;
  onApplySuggestion: (text: string) => void;
  onSelectCompletion: (text: string) => void;
}

export function TextSuggestions({ content, onApplySuggestion, onSelectCompletion }: TextSuggestionsProps) {
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!analysis) return;

    // Tab to cycle through suggestions
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < analysis.suggestions.length - 1 ? prev + 1 : 0
      );
    }
    // Shift+Tab to cycle backwards
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : analysis.suggestions.length - 1
      );
    }
    // Enter to apply suggestion
    if (e.key === 'Enter' && e.metaKey && analysis.suggestions[selectedSuggestionIndex]) {
      e.preventDefault();
      const suggestion = analysis.suggestions[selectedSuggestionIndex];
      if (suggestion.replacement) {
        onApplySuggestion(suggestion.replacement);
      }
    }
  }, [analysis, selectedSuggestionIndex, onApplySuggestion]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const analyzeSuggestions = async () => {
      if (!content.trim() || content.length < 10) {
        setAnalysis(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await analyzeText(content);
        setAnalysis(result);
        setSelectedSuggestionIndex(0); // Reset selection when new suggestions arrive
      } catch (err) {
        console.error('Error getting suggestions:', err);
        setError(err instanceof Error ? err.message : 'Failed to get suggestions');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(analyzeSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [content]);

  const renderSuggestion = (suggestion: any, index: number) => {
    const isGrammar = suggestion.category === 'grammar';
    const hasReplacement = suggestion.replacement && suggestion.replacement !== suggestion.text;
    const isSelected = index === selectedSuggestionIndex;

    return (
      <div 
        key={index} 
        className={`space-y-2 p-3 rounded-lg border transition-colors cursor-pointer ${
          isSelected ? 'bg-accent border-accent-foreground' : 'bg-card hover:bg-accent/50'
        }`}
        onClick={() => setSelectedSuggestionIndex(index)}
      >
        <div className="flex items-center gap-2">
          <Badge variant={isGrammar ? 'destructive' : 'secondary'}>
            {isGrammar ? 'Grammar' : 'Style'}
          </Badge>
          {suggestion.confidence >= 0.8 && (
            <Badge variant="outline">High Confidence</Badge>
          )}
          {isSelected && (
            <Badge variant="default" className="ml-auto">
              <Keyboard className="h-3 w-3 mr-1" />
              ⌘ + Enter
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{suggestion.explanation}</p>
          {isGrammar && suggestion.context && (
            <div className="text-sm bg-muted p-2 rounded">
              <span className="text-muted-foreground">Context: </span>
              <span className="font-mono">{suggestion.context}</span>
            </div>
          )}
        </div>

        {hasReplacement && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onApplySuggestion(suggestion.replacement);
              }}
              className="flex-1 justify-start font-mono"
            >
              {suggestion.replacement}
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (!content.trim() || content.length < 10) {
    return null;
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {analysis && !loading && !error && (
        <>
          {/* Writing Style Metrics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Writing Style Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Readability</span>
                  <span>{analysis.writingStyle.readability.toFixed(1)}</span>
                </div>
                <Progress value={analysis.writingStyle.readability} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Complexity</span>
                  <span>{analysis.writingStyle.complexity.toFixed(1)}</span>
                </div>
                <Progress value={analysis.writingStyle.complexity * 10} className="h-2" />
              </div>
              {analysis.writingStyle.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Style Suggestions</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {analysis.writingStyle.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grammar and Style Suggestions */}
          {analysis.suggestions.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Writing Suggestions</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm text-muted-foreground cursor-help">
                        Use Tab to navigate and ⌘ + Enter to apply suggestions
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Keyboard shortcuts for quick suggestion application</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.suggestions
                  .filter(s => s.category === 'grammar')
                  .map((suggestion, index) => renderSuggestion(suggestion, index))}
                
                {analysis.suggestions.filter(s => s.category === 'style').length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Style Suggestions</h4>
                    {analysis.suggestions
                      .filter(s => s.category === 'style')
                      .map((suggestion, index) => renderSuggestion(suggestion, index))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Auto-completions */}
          {analysis.autoCompletions.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Suggestions to Complete Your Thought</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {analysis.autoCompletions.map((completion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectCompletion(completion)}
                  >
                    {completion}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 