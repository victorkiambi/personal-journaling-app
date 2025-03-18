'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Calendar, Edit, Trash2, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  categories: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  metadata?: {
    wordCount: number;
    readingTime: number;
  };
}

interface PaginatedResponse {
  entries: JournalEntry[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export function JournalEntryList() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{id: string, name: string, color: string}>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/v1/categories', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        setCategories(data.data || []); // Handle the success wrapper from the categories API
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('token');
        let url = `/api/journal?page=${currentPage}&limit=10`;
        
        if (selectedCategory) {
          url += `&categoryId=${selectedCategory}`;
        }
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch journal entries');
        }

        const result: ApiResponse<PaginatedResponse> = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch journal entries');
        }

        setEntries(result.data.entries);
        setTotalPages(result.data.pagination.pages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast.error('Failed to load journal entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [selectedCategory, currentPage]);

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete journal entry');
      }

      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete journal entry');
      }

      setEntries(entries.filter(entry => entry.id !== id));
      toast.success('Journal entry deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete journal entry');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center text-red-600 py-4">
            <p>Error: {error}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => setLoading(true)}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedCategory(null);
              setCurrentPage(1);
            }}
          >
            All Entries
          </Button>
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCategory(category.id);
                setCurrentPage(1);
              }}
              className="flex items-center gap-2"
            >
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </Button>
          ))}
        </div>
        
        <Link href="/journal/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </Link>
      </div>

      <Separator />

      {entries.length === 0 ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-indigo-100 p-3 mb-4">
              <Calendar className="h-6 w-6 text-indigo-700" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No journal entries yet</h3>
            <p className="mt-2 text-sm text-gray-600 text-center max-w-md">
              Start writing your first journal entry to begin your journaling journey.
            </p>
            <Link href="/journal/new" className="mt-6">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create your first entry
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {entries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3 flex flex-row justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {entry.categories.map(category => (
                      <span
                        key={category.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${category.color}20`,
                          color: category.color,
                        }}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {category.name}
                      </span>
                    ))}
                    <time className="text-xs text-gray-500">
                      {formatDate(entry.createdAt)}
                    </time>
                  </div>
                  
                  <CardTitle>
                    <Link href={`/journal/${entry.id}`} className="hover:text-indigo-600 transition-colors">
                      {entry.title}
                    </Link>
                  </CardTitle>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/journal/${entry.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 line-clamp-3">
                  {entry.content}
                </p>
              </CardContent>
              
              <CardFooter className="pt-0 border-t">
                <Link
                  href={`/journal/${entry.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                >
                  Read more
                  <svg 
                    className="ml-1 h-4 w-4" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <div className="fixed bottom-8 right-8">
        <Link href="/journal/new">
          <Button size="lg" className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
} 