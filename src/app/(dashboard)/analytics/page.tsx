import { AnalyticsService } from "@/services/analytics.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import SentimentAnalysis from "@/components/sentiment-analysis";
import MonthlyActivityChart from "@/components/monthly-activity-chart";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get analytics for the past month
  const analytics = await AnalyticsService.getAnalytics(session.user.id, { timeRange: "month" });

  // Transform sentiment data for the SentimentAnalysis component
  const sentimentData = analytics.sentiment ? {
    averageScore: analytics.sentiment.average,
    moodDistribution: analytics.sentiment.distribution
  } : null;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your writing patterns and journal statistics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-entries">
              {analytics.summary.totalEntries}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-words">
              {analytics.summary.totalWordCount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Writing Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.summary.currentStreak} days
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.summary.currentStreak > 0 ? 'Keep it up!' : 'Start writing to build your streak'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Words/Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="avg-words">
              {analytics.summary.avgWordsPerDay}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.summary.avgWordsPerDay > 0 ? 'Your daily writing average' : 'No entries yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Analysis */}
      {sentimentData && analytics.summary.totalEntries > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Sentiment Analysis</h2>
          <SentimentAnalysis sentiment={sentimentData} />
        </div>
      )}

      {/* Category Distribution */}
      {analytics.categories && analytics.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>
              How your entries are distributed across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categories.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium">{category.category}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {category.count} {category.count === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Activity Chart */}
      {analytics.monthlyActivity && analytics.monthlyActivity.length > 0 && (
        <MonthlyActivityChart data={analytics.monthlyActivity} />
      )}

      {/* Longest Entry */}
      {analytics.summary.longestEntry && (
        <Card>
          <CardHeader>
            <CardTitle>Longest Entry</CardTitle>
            <CardDescription>
              Your most detailed journal entry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{analytics.summary.longestEntry.title}</h3>
              <p className="text-sm text-muted-foreground">
                {analytics.summary.longestEntry.wordCount} words • {format(new Date(analytics.summary.longestEntry.date), 'MMM d, yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 