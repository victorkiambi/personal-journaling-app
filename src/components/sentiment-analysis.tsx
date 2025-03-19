import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SentimentAnalysisProps {
  sentiment: {
    averageScore: number;
    moodDistribution: Record<string, number>;
  };
}

const moodColors = {
  very_positive: "#22c55e", // green-500
  positive: "#4ade80", // green-400
  neutral: "#9ca3af", // gray-400
  negative: "#f87171", // red-400
  very_negative: "#ef4444" // red-500
};

const moodLabels = {
  very_positive: "Very Positive",
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
  very_negative: "Very Negative"
};

const moodDescriptions = {
  very_positive: "Entries expressing strong positive emotions or experiences",
  positive: "Entries with generally positive sentiment",
  neutral: "Balanced or objective entries",
  negative: "Entries with generally negative sentiment",
  very_negative: "Entries expressing strong negative emotions or experiences"
};

export default function SentimentAnalysis({ sentiment }: SentimentAnalysisProps) {
  const { averageScore, moodDistribution } = sentiment;

  // Calculate sentiment percentage for progress bar
  const sentimentPercentage = ((averageScore + 1) / 2) * 100;

  // Get sentiment description
  const getSentimentDescription = (score: number) => {
    if (score >= 0.6) return "Very positive overall sentiment";
    if (score >= 0.2) return "Positive overall sentiment";
    if (score >= -0.2) return "Neutral overall sentiment";
    if (score >= -0.6) return "Negative overall sentiment";
    return "Very negative overall sentiment";
  };

  // Calculate total entries
  const totalEntries = Object.values(moodDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Overall Sentiment Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Sentiment</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Sentiment score ranges from -1 (very negative) to 1 (very positive)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {averageScore.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">
                {getSentimentDescription(averageScore)}
              </span>
            </div>
            <Progress 
              value={sentimentPercentage} 
              className={cn(
                "h-2",
                sentimentPercentage > 70 ? "bg-green-100" :
                sentimentPercentage > 30 ? "bg-yellow-100" :
                "bg-red-100"
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mood Distribution Card */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(moodDistribution)
              .sort(([a], [b]) => {
                const moodOrder = ["very_positive", "positive", "neutral", "negative", "very_negative"];
                return moodOrder.indexOf(a) - moodOrder.indexOf(b);
              })
              .map(([mood, count]) => (
                <div key={mood} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: moodColors[mood as keyof typeof moodColors] }}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm font-medium cursor-help">
                            {moodLabels[mood as keyof typeof moodLabels]}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{moodDescriptions[mood as keyof typeof moodDescriptions]}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {count} entries
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((count / totalEntries) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 