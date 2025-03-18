'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, BarChart3, CalendarDays, Clock, FileText, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { toast } from 'sonner';

// Types for analytics data
interface JournalSummary {
  totalEntries: number;
  totalWordCount: number;
  averageWordsPerEntry: number;
  longestEntry: {
    id: string;
    title: string;
    wordCount: number;
    createdAt: string;
  };
}

interface CategoryDistribution {
  name: string;
  count: number;
  color: string;
}

interface EntryFrequency {
  date: string;
  count: number;
}

interface WritingTrend {
  month: string;
  entries: number;
  avgWords: number;
}

interface TimePattern {
  hour: number;
  count: number;
}

interface AnalyticsData {
  summary: JournalSummary;
  categoryDistribution: CategoryDistribution[];
  entryFrequency: EntryFrequency[];
  writingTrends: WritingTrend[];
  timeOfDayPatterns: TimePattern[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run after component is mounted on the client
    if (!isMounted) return;
    
    // Wait for auth state to be determined
    if (authLoading) return;
    
    // Redirect if not authenticated
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    fetchAnalytics();
  }, [user, authLoading, isMounted, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure we're in client environment
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      const response = await fetch('/api/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        // Add cache control to prevent browser caching
        cache: 'no-store'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Authentication error', {
            description: 'Your session has expired. Please log in again.'
          });
          throw new Error('Your session has expired. Please log in again.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load analytics data');
      }
      
      const analyticsData = await response.json();
      console.log('Analytics data:', analyticsData); // Debug log
      
      // Ensure the data has the expected structure
      if (!analyticsData || !analyticsData.summary) {
        throw new Error('Invalid analytics data format');
      }
      
      setData(analyticsData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchAnalytics();
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Don't render anything during SSR
  if (!isMounted) {
    return null;
  }

  // Show loading until auth is determined
  if (authLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Journal Analytics</h1>
        <div className="flex justify-center">
          <p>Loading authentication status...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Journal Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="w-full h-80">
              <CardHeader>
                <Skeleton className="h-4 w-1/3 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-60 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRetry}>Retry</Button>
      </div>
    );
  }

  if (!data || !data.summary) {
    return (
      <div className="container mx-auto py-10">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            There is no journal data to analyze. Start writing journal entries to see analytics.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Safely format numbers with fallbacks
  const formatNumber = (num: number | undefined) => {
    return num !== undefined ? num.toLocaleString() : '0';
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Journal Analytics</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-4 w-4" />
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.totalEntries || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="mr-2 h-4 w-4" />
              Total Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(data.summary.totalWordCount)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="mr-2 h-4 w-4" />
              Avg. Words per Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(data.summary.averageWordsPerEntry || 0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <CalendarDays className="mr-2 h-4 w-4" />
              Longest Entry
            </CardTitle>
            <CardDescription className="truncate">
              {data.summary.longestEntry?.title || 'No entries yet'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.longestEntry ? `${data.summary.longestEntry.wordCount} words` : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="patterns">Writing Patterns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Journal entries by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {data.categoryDistribution && data.categoryDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryDistribution}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {data.categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} entries`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No category data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Entry Frequency */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Entry Frequency</CardTitle>
                <CardDescription>
                  Journal entries over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {data.entryFrequency && data.entryFrequency.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data.entryFrequency}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 30,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => format(new Date(date), 'MMM d')}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                          labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                          formatter={(value) => [`${value} entries`, 'Count']}
                        />
                        <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No frequency data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Writing Trends */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Writing Trends</CardTitle>
                <CardDescription>
                  Entries and word counts by month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {data.writingTrends && data.writingTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data.writingTrends}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 30,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="entries"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          name="Entries"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="avgWords"
                          stroke="#82ca9d"
                          name="Avg Words"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No trend data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Time of Day Patterns */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Time of Day Patterns</CardTitle>
                <CardDescription>
                  When you write most frequently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {data.timeOfDayPatterns && data.timeOfDayPatterns.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.timeOfDayPatterns}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 30,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="hour" 
                          tickFormatter={(hour) => `${hour}:00`}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip 
                          labelFormatter={(hour) => `Time: ${hour}:00 - ${hour+1}:00`}
                          formatter={(value) => [`${value} entries`, 'Count']}
                        />
                        <Bar dataKey="count" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No time pattern data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Writing Habits</CardTitle>
              <CardDescription>
                Insights about your journaling habits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Preferred Writing Time</h3>
                    <p className="text-muted-foreground">
                      {data.timeOfDayPatterns && data.timeOfDayPatterns.length > 0 
                        ? `You most frequently write at ${data.timeOfDayPatterns.sort((a, b) => b.count - a.count)[0].hour}:00.`
                        : 'Not enough data to determine your preferred writing time.'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <CalendarDays className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Writing Consistency</h3>
                    <p className="text-muted-foreground">
                      {data.writingTrends && data.writingTrends.length > 0
                        ? `On average, you write ${(data.writingTrends.reduce((sum, trend) => sum + trend.entries, 0) / data.writingTrends.length).toFixed(1)} entries per month.`
                        : 'Not enough data to analyze your writing consistency.'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Content Length</h3>
                    <p className="text-muted-foreground">
                      {data.summary && data.summary.totalEntries > 0
                        ? `Your journal entries average ${Math.round(data.summary.averageWordsPerEntry || 0)} words, with your longest being ${data.summary.longestEntry?.wordCount || 0} words.`
                        : 'Not enough entries to analyze content length patterns.'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-start space-x-4">
                  <BarChart3 className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Category Preference</h3>
                    <p className="text-muted-foreground">
                      {data.categoryDistribution && data.categoryDistribution.length > 0
                        ? `Your most used category is "${data.categoryDistribution.sort((a, b) => b.count - a.count)[0].name}" with ${data.categoryDistribution.sort((a, b) => b.count - a.count)[0].count} entries.`
                        : 'No category data available to determine your preferences.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 