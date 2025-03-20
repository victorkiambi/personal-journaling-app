'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, ChevronLeft, Save, Clock, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from '@/types/category';
import { formatDate } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { RealTimeInsights } from './RealTimeInsights';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  categoryIds: string[];
  metadata: {
    wordCount: number;
    readingTime: number;
  };
}

interface JournalEntryFormProps {
  entryId?: string;
  isEditing?: boolean;
}

function calculateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 200);
}

export default function JournalEntryForm({ entryId, isEditing = false }: JournalEntryFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    categoryIds: string[];
  }>({
    title: '',
    content: '',
    categoryIds: [],
  });

  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    // Wait for auth state to be determined
    if (status === 'loading') return;
    
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/v1/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        setCategories(data.data || []);
        setCategoriesLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        setCategoriesLoading(false);
      }
    };

    const fetchEntry = async () => {
      if (!entryId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/v1/entries/${entryId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch entry');
        }

        const { data: entry } = await response.json();
        setFormData({
          title: entry.title,
          content: entry.content,
          categoryIds: entry.categories?.map((cat: any) => cat.id) || [],
        });
        setWordCount(entry.metadata?.wordCount || 0);
        setReadingTime(entry.metadata?.readingTime || 0);
      } catch (err) {
        console.error('Error fetching entry:', err);
        setError('Failed to load entry');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    if (isEditing) {
      fetchEntry();
    }
  }, [entryId, isEditing, router, status]);

  const selectedCategories = Array.isArray(categories) ? categories.filter(cat => formData.categoryIds.includes(cat.id)) : [];

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    const words = content.trim().split(/\s+/).filter(Boolean);
    const count = words.length;
    const time = Math.ceil(count / 200);

    setFormData(prev => ({ ...prev, content }));
    setWordCount(count);
    setReadingTime(time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const url = isEditing ? `/api/v1/entries/${entryId}` : '/api/v1/entries';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          metadata: {
            wordCount,
            readingTime,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save entry');
      }

      toast.success('Journal entry saved successfully!');
      router.push('/journal');
    } catch (err) {
      console.error('Error saving entry:', err);
      toast.error('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  if (loading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update your journal entry below.' : 'Write your thoughts and feelings below.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a title for your entry"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your thoughts here..."
              value={formData.content}
              onChange={handleContentChange}
              className="min-h-[200px]"
              required
            />
            <RealTimeInsights content={formData.content} title={formData.title} />
          </div>

          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex flex-col gap-4">
              <Select
                value={formData.categoryIds.join(',')}
                onValueChange={(value) => {
                  const selectedIds = value.split(',').filter(Boolean);
                  setFormData(prev => ({
                    ...prev,
                    categoryIds: selectedIds,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                        {formData.categoryIds.includes(category.id) && (
                          <Check className="h-4 w-4 ml-auto" />
                        )}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-2">
                {selectedCategories.map(category => (
                  <Badge
                    key={category.id}
                    variant="default"
                    className="cursor-pointer"
                    style={{ backgroundColor: category.color }}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        categoryIds: prev.categoryIds.filter(id => id !== category.id),
                      }));
                    }}
                  >
                    {category.name}
                    <span className="ml-1">×</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{wordCount} words</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min read</span>
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
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Entry
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 