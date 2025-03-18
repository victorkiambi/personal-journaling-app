'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, ChevronLeft, Save, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Badge,
  BadgeProps
} from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface JournalEntry {
  id?: string;
  title: string;
  content: string;
  categoryIds: string[];
  metadata?: {
    wordCount: number;
    readingTime: number;
  };
}

interface JournalEntryFormProps {
  entry?: JournalEntry;
  isEditing?: boolean;
  entryId?: string;
}

const AUTOSAVE_DELAY = 2000; // 2 seconds

function calculateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 200); // Assuming average reading speed of 200 words per minute
}

export function JournalEntryForm({ entry, isEditing, entryId }: JournalEntryFormProps) {
  const [formData, setFormData] = useState<JournalEntry>({
    id: entry?.id || entryId,
    title: entry?.title || '',
    content: entry?.content || '',
    categoryIds: entry?.categoryIds || [],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEntry, setFetchingEntry] = useState(!!entryId && !entry);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  const router = useRouter();
  const [debouncedFormData] = useDebounce(formData, AUTOSAVE_DELAY);

  // Update word count and reading time when content changes
  useEffect(() => {
    const words = calculateWordCount(formData.content);
    setWordCount(words);
    setReadingTime(calculateReadingTime(words));
  }, [formData.content]);

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

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch journal entry');
        }

        const data = result.data;
        setFormData({
          id: data.id,
          title: data.title,
          content: data.content,
          categoryIds: data.categories?.map((c: Category) => c.id) || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast.error('Failed to load journal entry');
      } finally {
        setFetchingEntry(false);
      }
    };

    fetchEntry();
  }, [entryId, entry]);

  // Auto-save functionality
  useEffect(() => {
    if (!isEditing || !debouncedFormData.id || !debouncedFormData.content) return;

    const autoSave = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/journal/${debouncedFormData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(debouncedFormData),
        });

        if (!response.ok) {
          throw new Error('Failed to auto-save');
        }

        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    };

    autoSave();
  }, [debouncedFormData, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }

      if (formData.categoryIds.length === 0) {
        throw new Error('At least one category is required');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to save entries');
      }

      const url = isEditing ? `/api/journal/${entryId || formData.id}` : '/api/journal';
      const method = isEditing ? 'PUT' : 'POST';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
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

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || `Failed to ${isEditing ? 'update' : 'create'} journal entry`);
        }

        toast.success(`Journal entry ${isEditing ? 'updated' : 'created'} successfully`);
        
        if (!isEditing) {
          // Wait a moment for the toast to be visible
          setTimeout(() => {
            router.push(`/journal/${result.data.id}`);
          }, 500);
        } else {
          setFormData(prev => ({
            ...prev,
            ...result.data
          }));
          setLastSaved(new Date());
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

  const selectedCategories = categories.filter(cat => formData.categoryIds.includes(cat.id));

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setFormData(prev => ({ ...prev, content }));
  };

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
            <Label>Categories</Label>
            <Select
              value={formData.categoryIds[0]}
              onValueChange={(value) => {
                const newCategoryIds = [...formData.categoryIds];
                if (!newCategoryIds.includes(value)) {
                  newCategoryIds.push(value);
                }
                setFormData({ ...formData, categoryIds: newCategoryIds });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Available Categories</SelectLabel>
                  {categories.map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      disabled={formData.categoryIds.includes(category.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                  style={{
                    backgroundColor: `${category.color}20`,
                    color: category.color,
                  }}
                >
                  {category.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        categoryIds: formData.categoryIds.filter(id => id !== category.id)
                      });
                    }}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <div className="relative">
              <Textarea
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Write about your day, thoughts, or experiences..."
                className="min-h-[200px] resize-none"
                style={{ 
                  lineHeight: '1.6',
                  padding: '1rem',
                }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <div>
                  {formData.content.length} characters
                  {' • '}
                  {wordCount} words
                  {' • '}
                  {readingTime} min read
                </div>
                {lastSaved && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
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