import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

// Type definitions
export interface MonthlyActivity {
  month: string;
  entries: number;
  wordCount: number;
}

export interface MonthlyActivityChartProps {
  data: MonthlyActivity[];
}

// Helper component for individual month activity
function MonthlyActivityItem({ 
  activity, 
  maxEntries, 
  maxWordCount 
}: { 
  activity: MonthlyActivity; 
  maxEntries: number; 
  maxWordCount: number;
}) {
  // Calculate percentages for progress bars
  const entriesPercentage = maxEntries ? (activity.entries / maxEntries) * 100 : 0;
  const wordCountPercentage = maxWordCount ? (activity.wordCount / maxWordCount) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {format(new Date(activity.month), 'MMMM yyyy')}
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {activity.entries} {activity.entries === 1 ? 'entry' : 'entries'}
          </span>
          <span className="text-sm text-muted-foreground">
            {activity.wordCount.toLocaleString()} words
          </span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Entries</span>
        </div>
        <Progress 
          value={entriesPercentage} 
          className="h-2"
        />
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Word Count</span>
        </div>
        <Progress 
          value={wordCountPercentage} 
          className="h-2 bg-green-100"
        />
      </div>
    </div>
  );
}

export default function MonthlyActivityChart({ data }: MonthlyActivityChartProps) {
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
          <CardDescription>
            Your writing activity over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            No activity data available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Find the maximum values for scaling
  const maxEntries = Math.max(...data.map(d => d.entries));
  const maxWordCount = Math.max(...data.map(d => d.wordCount));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Activity</CardTitle>
        <CardDescription>
          Your writing activity over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Sort the data by date for consistent display */}
          {[...data]
            .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
            .map((activity) => (
              <MonthlyActivityItem 
                key={activity.month} 
                activity={activity} 
                maxEntries={maxEntries} 
                maxWordCount={maxWordCount} 
              />
            ))}
        </div>
      </CardContent>
    </Card>
  );
} 