'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Calendar, Edit, Trash2, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Category } from '@/types/category';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  categoryIds: string[];
  createdAt: string;
  updatedAt: string;
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

export default function JournalEntryList() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchEntries();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/journal', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }

      const data = await response.json();
      setEntries(data.data.entries || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load entries');
      setLoading(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      const response = await fetch(`/api/journal/${entryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      const data = await response.json();
      toast.success(data.message || 'Entry deleted successfully');
      fetchEntries(); // Refresh the list
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast.error('Failed to delete entry');
    }
  };

  const handleRetry = () => {
    fetchCategories();
    fetchEntries();
  };

  const filteredEntries = entries.filter(entry => {
    if (!selectedCategory) return true;
    return entry.categoryIds.includes(selectedCategory);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All Entries
          </Button>
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              style={{ backgroundColor: selectedCategory === category.id ? category.color : undefined }}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <Button onClick={() => router.push('/journal/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      <hr className="shrink-0 bg-border h-[1px] w-full" role="none" />

      <div className="grid grid-cols-1 gap-6">
        {filteredEntries.map(entry => {
          const entryCategories = categories.filter(cat => entry.categoryIds.includes(cat.id));
          return (
            <div
              key={entry.id}
              className="p-6 bg-card text-card-foreground rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{entry.title}</h3>
                  <div className="flex gap-2 mb-2">
                    {entryCategories.map(category => (
                      <span
                        key={category.id}
                        className="px-2 py-1 rounded text-xs"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(entry.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/journal/${entry.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-sm line-clamp-3">{entry.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
} 