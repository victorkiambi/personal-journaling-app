import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types
export interface SentimentAnalysisProps {
  sentiment: {
    averageScore: number;
    moodDistribution: Record<string, number>;
  };
}

export type MoodType = 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';

// Constants
const moodColors: Record<MoodType, string> = {
  very_positive: "#22c55e", // green-500
  positive: "#4ade80", // green-400
  neutral: "#9ca3af", // gray-400
  negative: "#f87171", // red-400
  very_negative: "#ef4444" // red-500
};

const moodLabels: Record<MoodType, string> = {
  very_positive: "Very Positive",
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
  very_negative: "Very Negative"
};

const moodDescriptions: Record<MoodType, string> = {
  very_positive: "Entries expressing strong positive emotions or experiences",
  positive: "Entries with generally positive sentiment",
  neutral: "Balanced or objective entries",
  negative: "Entries with generally negative sentiment",
  very_negative: "Entries expressing strong negative emotions or experiences"
};

// Helper function to determine sentiment description based on score
function getSentimentDescription(score: number): string {
  if (score >= 0.6) return "Very positive overall sentiment";
  if (score >= 0.2) return "Positive overall sentiment";
  if (score >= -0.2) return "Neutral overall sentiment";
  if (score >= -0.6) return "Negative overall sentiment";
  return "Very negative overall sentiment";
}

// Helper function to get the progress bar color based on sentiment percentage
function getSentimentColor(percentage: number): string {
  if (percentage > 70) return "bg-green-100";
  if (percentage > 30) return "bg-yellow-100";
  return "bg-red-100";
}

// Overall sentiment display component
function OverallSentimentCard({ score }: { score: number }) {
  const sentimentPercentage = ((score + 1) / 2) * 100;

  return (
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
              {score.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">
              {getSentimentDescription(score)}
            </span>
          </div>
          <Progress 
            value={sentimentPercentage} 
            className={cn("h-2", getSentimentColor(sentimentPercentage))}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Mood distribution item component
function MoodDistributionItem({ 
  mood, 
  count, 
  totalEntries 
}: { 
  mood: MoodType; 
  count: number; 
  totalEntries: number 
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div 
          className="h-3 w-3 rounded-full" 
          style={{ backgroundColor: moodColors[mood] }}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-medium cursor-help">
                {moodLabels[mood]}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{moodDescriptions[mood]}</p>
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
  );
}

// Mood distribution card component
function MoodDistributionCard({ distribution }: { distribution: Record<string, number> }) {
  // Calculate total entries
  const totalEntries = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  
  // Order of mood categories for consistent display
  const moodOrder: MoodType[] = ["very_positive", "positive", "neutral", "negative", "very_negative"];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {moodOrder.map((mood) => (
            distribution[mood] ? (
              <MoodDistributionItem 
                key={mood} 
                mood={mood} 
                count={distribution[mood]} 
                totalEntries={totalEntries} 
              />
            ) : null
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SentimentAnalysis({ sentiment }: SentimentAnalysisProps) {
  const { averageScore, moodDistribution } = sentiment;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <OverallSentimentCard score={averageScore} />
      <MoodDistributionCard distribution={moodDistribution} />
    </div>
  );
} 