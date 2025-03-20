import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface AIInsightsProps {
  insights: {
    categories: string[];
    writingStyle: {
      complexity: number;
      readability: number;
      suggestions: string[];
    };
    themes: string[];
    summary: string;
    patterns: {
      topics: string[];
      emotions: string[];
      timeOfDay: string;
    };
  };
}

export function AIInsights({ insights }: AIInsightsProps) {
  return (
    <div className="space-y-4">
      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Entry Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{insights.summary}</p>
        </CardContent>
      </Card>

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

      {/* Categories and Themes */}
      <Card>
        <CardHeader>
          <CardTitle>Categories & Themes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Suggested Categories</h4>
            <div className="flex flex-wrap gap-2">
              {insights.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

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
        </CardContent>
      </Card>

      {/* Patterns Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div>
            <h4 className="text-sm font-medium mb-2">Time of Day</h4>
            <Badge variant="secondary" className="capitalize">
              {insights.patterns.timeOfDay}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 