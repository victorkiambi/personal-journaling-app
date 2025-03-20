import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { sanitizeContent } from '@/lib/sanitize';

interface RealTimeInsightsProps {
  content: string;
  title: string;
}

export function RealTimeInsights({ content, title }: RealTimeInsightsProps) {
  const [insights, setInsights] = useState<{
    writingStyle: {
      complexity: number;
      readability: number;
      suggestions: string[];
    };
    themes: string[];
    patterns: {
      topics: string[];
      emotions: string[];
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeContent = async () => {
      if (!content.trim()) {
        setInsights(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Sanitize content before sending to API
        const sanitizedContent = sanitizeContent(content);

        const response = await fetch('/api/v1/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: sanitizedContent }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze content');
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Failed to analyze content');
        }

        setInsights(result.data);
      } catch (err) {
        console.error('Error analyzing content:', err);
        setError(err instanceof Error ? err.message : 'Failed to analyze content');
      } finally {
        setLoading(false);
      }
    };

    // Debounce the analysis to avoid too frequent updates
    const timeoutId = setTimeout(analyzeContent, 1000);
    return () => clearTimeout(timeoutId);
  }, [content]);

  if (!content.trim()) {
    return null;
  }

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="py-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Analyzing your writing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4">
        <CardContent className="py-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Writing Style Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Writing Style</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Complexity</span>
              <span>{insights.writingStyle.complexity.toFixed(1)} words/sentence</span>
            </div>
            <Progress value={Math.min(insights.writingStyle.complexity * 5, 100)} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Readability</span>
              <span>{insights.writingStyle.readability.toFixed(1)}</span>
            </div>
            <Progress value={insights.writingStyle.readability} />
          </div>

          {insights.writingStyle.suggestions.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {insights.writingStyle.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Themes and Topics */}
      <Card>
        <CardHeader>
          <CardTitle>Themes & Topics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Themes</h4>
            <div className="flex flex-wrap gap-2">
              {insights.themes.map((theme) => (
                <Badge key={theme} variant="outline">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Topics</h4>
            <div className="flex flex-wrap gap-2">
              {insights.patterns.topics.map((topic) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Emotions</h4>
            <div className="flex flex-wrap gap-2">
              {insights.patterns.emotions.map((emotion) => (
                <Badge key={emotion} variant="outline">
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 