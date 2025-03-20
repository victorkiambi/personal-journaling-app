'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { TextAnalysis, analyzeText } from '@/lib/textAnalysis';

interface TextSuggestionsProps {
  content: string;
  onApplySuggestion: (text: string) => void;
  onSelectCompletion: (text: string) => void;
}

export function TextSuggestions({ content, onApplySuggestion, onSelectCompletion }: TextSuggestionsProps) {
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    return (
      <div key={index} className="space-y-2 p-3 rounded-lg border bg-card">
        <div className="flex items-center gap-2">
          <Badge variant={isGrammar ? 'destructive' : 'secondary'}>
            {isGrammar ? 'Grammar' : 'Style'}
          </Badge>
          {suggestion.confidence >= 0.8 && (
            <Badge variant="outline">High Confidence</Badge>
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
              onClick={() => onApplySuggestion(suggestion.replacement)}
              className="flex-1"
            >
              Replace with: {suggestion.replacement}
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
            <CardHeader>
              <CardTitle className="text-lg">Writing Style Analysis</CardTitle>
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
              <CardHeader>
                <CardTitle className="text-lg">Writing Suggestions</CardTitle>
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
              <CardHeader>
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