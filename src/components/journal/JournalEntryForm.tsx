'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2, ChevronLeft, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface JournalEntry {
  id?: string;
  title: string;
  content: string;
  categoryId: string;
}

interface JournalEntryFormProps {
  entry?: JournalEntry;
  isEditing?: boolean;
  entryId?: string;
}

export function JournalEntryForm({ entry, isEditing, entryId }: JournalEntryFormProps) {
  const [formData, setFormData] = useState<JournalEntry>({
    id: entry?.id || entryId,
    title: entry?.title || '',
    content: entry?.content || '',
    categoryId: entry?.categoryId || '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEntry, setFetchingEntry] = useState(!!entryId && !entry);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/categories', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        setCategories(data);

        // Set default category if none selected
        if (!formData.categoryId && data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!entryId || entry) return;
      
      try {
        setFetchingEntry(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/journal/${entryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch journal entry');
        }

        const data = await response.json();
        console.log('Fetched entry:', data); // Debug log
        
        setFormData({
          id: data.id,
          title: data.title,
          content: data.content,
          categoryId: data.category?.id || (categories.length > 0 ? categories[0].id : ''),
        });
      } catch (err) {
        console.error('Error fetching entry:', err); // Debug log
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast.error('Failed to load journal entry');
      } finally {
        setFetchingEntry(false);
      }
    };

    fetchEntry();
  }, [entryId, entry, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }

      if (!formData.categoryId) {
        throw new Error('Category is required');
      }

      // Get token once
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to save entries');
      }

      const url = isEditing ? `/api/journal/${entryId || formData.id}` : '/api/journal';
      const method = isEditing ? 'PUT' : 'POST';

      // Prepare submission data - only send necessary fields
      const submissionData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.categoryId
      };

      // Set up timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submissionData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || 
            `Failed to ${isEditing ? 'update' : 'create'} journal entry`
          );
        }

        const data = await response.json();
        toast.success(`Journal entry ${isEditing ? 'updated' : 'created'} successfully`);
        
        if (!isEditing) {
          router.push(`/journal/${data.id}`);
        } else {
          setFormData(prev => ({
            ...prev,
            ...data
          }));
        }
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw fetchError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSubmit(new Event('submit') as any);
  };

  if (fetchingEntry || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}</CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Update your thoughts, feelings, and experiences' 
              : 'Record your thoughts, feelings, and experiences'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-2">
                <span>{error}</span>
                {error.includes('timed out') && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRetry}
                    className="self-start mt-2"
                  >
                    Try Again
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a title for your journal entry"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <SelectItem value="no-categories" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              placeholder="Write about your day, thoughts, or experiences..."
              className="resize-y"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Entry' : 'Save Entry'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 