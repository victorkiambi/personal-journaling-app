import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface MonthlyActivityChartProps {
  data: Array<{
    month: string;
    entries: number;
    wordCount: number;
  }>;
}

export default function MonthlyActivityChart({ data }: MonthlyActivityChartProps) {
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
          {data.map((activity) => (
            <div key={activity.month} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {format(new Date(activity.month), 'MMMM yyyy')}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {activity.entries} entries
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
                  value={(activity.entries / maxEntries) * 100} 
                  className="h-2"
                />
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">Word Count</span>
                </div>
                <Progress 
                  value={(activity.wordCount / maxWordCount) * 100} 
                  className="h-2 bg-green-100"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 