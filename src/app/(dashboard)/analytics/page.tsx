import { AnalyticsService } from "@/services/analytics.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import SentimentAnalysis from "@/components/sentiment-analysis";
import MonthlyActivityChart from "@/components/monthly-activity-chart";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Loading component for Suspense fallback
function AnalyticsLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );
}

// Summary card component for better reusability
function SummaryCard({ title, value, subtext }: { title: string; value: React.ReactNode; subtext?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Category distribution component
function CategoryDistribution({ categories }: { categories: Array<{category: string; color: string; count: number}> }) {
  if (!categories || categories.length === 0) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Distribution</CardTitle>
        <CardDescription>
          How your entries are distributed across categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
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
  );
}

// Longest entry component
function LongestEntry({ entry }: { entry: {title: string; wordCount: number; date: string} }) {
  if (!entry) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Longest Entry</CardTitle>
        <CardDescription>
          Your most detailed journal entry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{entry.title}</h3>
          <p className="text-sm text-muted-foreground">
            {entry.wordCount} words • {format(new Date(entry.date), 'MMM d, yyyy')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AnalyticsPage() {
  // Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    // Get analytics for the past month
    const analytics = await AnalyticsService.getAnalytics(session.user.id, { timeRange: "month" });

    // Transform sentiment data for the SentimentAnalysis component
    const sentimentData = analytics.sentiment ? {
      averageScore: analytics.sentiment.average,
      moodDistribution: analytics.sentiment.distribution
    } : null;

    // Check if any analytics data exists
    const hasData = analytics.summary.totalEntries > 0;

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
          <SummaryCard 
            title="Total Entries" 
            value={<span data-testid="total-entries">{analytics.summary.totalEntries}</span>} 
          />
          
          <SummaryCard 
            title="Total Words" 
            value={<span data-testid="total-words">{analytics.summary.totalWordCount.toLocaleString()}</span>} 
          />
          
          <SummaryCard 
            title="Writing Streak" 
            value={`${analytics.summary.currentStreak} days`}
            subtext={analytics.summary.currentStreak > 0 ? 'Keep it up!' : 'Start writing to build your streak'} 
          />
          
          <SummaryCard 
            title="Avg. Words/Day" 
            value={<span data-testid="avg-words">{analytics.summary.avgWordsPerDay}</span>}
            subtext={analytics.summary.avgWordsPerDay > 0 ? 'Your daily writing average' : 'No entries yet'} 
          />
        </div>

        {/* No data message */}
        {!hasData && (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Start writing journal entries to see your analytics data here.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sentiment Analysis - with Suspense for async loading */}
        {sentimentData && hasData && (
          <Suspense fallback={<AnalyticsLoading />}>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Sentiment Analysis</h2>
              <SentimentAnalysis sentiment={sentimentData} />
            </div>
          </Suspense>
        )}

        {/* Category Distribution */}
        {hasData && (
          <Suspense fallback={<AnalyticsLoading />}>
            <CategoryDistribution categories={analytics.categories || []} />
          </Suspense>
        )}

        {/* Monthly Activity Chart */}
        {analytics.monthlyActivity && analytics.monthlyActivity.length > 0 && (
          <Suspense fallback={<AnalyticsLoading />}>
            <MonthlyActivityChart data={analytics.monthlyActivity} />
          </Suspense>
        )}

        {/* Longest Entry */}
        {analytics.summary.longestEntry && (
          <Suspense fallback={<AnalyticsLoading />}>
            <LongestEntry entry={analytics.summary.longestEntry} />
          </Suspense>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading analytics:", error);
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your writing patterns and journal statistics
          </p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Unable to load analytics data. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
} 