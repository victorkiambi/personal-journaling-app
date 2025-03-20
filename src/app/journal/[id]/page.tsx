'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Edit, Trash2, Calendar, Tag, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { AIInsights } from '@/components/journal/AIInsights';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  insights?: {
    categories: string[];
    writingStyle: {
      complexity: number;
      readability: number;
      suggestions: string[];
    };
    themes: string[];
    summary: string;
    patterns: {
      topics: string[];
      emotions: string[];
      timeOfDay: string;
    };
  };
}

export default function JournalEntryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/journal/${id}`, {
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
        // Transform the data to match the expected format
        setEntry({
          id: data.id,
          title: data.title,
          content: data.content,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          category: data.categories[0] || {
            id: 'default',
            name: 'Uncategorized',
            color: '#808080'
          },
          insights: data.insights
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
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

      toast.success('Journal entry deleted successfully');
      router.push('/journal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to delete journal entry');
      setIsDeleting(false);
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

  if (error || !entry) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center text-red-600 py-4">
            {error || 'Journal entry not found'}
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/journal')}
              >
                Back to Journal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/journal')}
          className="inline-flex items-center text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Journal
        </Button>
        
        <div className="flex space-x-2">
          <Link href={`/journal/${entry.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your journal entry.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button>Cancel</Button>
                <Button onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${entry.category.color}20`,
                color: entry.category.color,
              }}
            >
              <Tag className="h-3 w-3 mr-1" />
              {entry.category.name}
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {entry.title}
          </h1>
          
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <Calendar className="h-4 w-4 mr-1" />
            <time>{formatDate(entry.createdAt)}</time>
            {entry.updatedAt !== entry.createdAt && (
              <span className="ml-3">
                (Updated: {formatDate(entry.updatedAt)})
              </span>
            )}
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="py-6">
          <div className="prose max-w-none">
            {entry.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>

        {entry.insights && (
          <>
            <Separator />
            <CardContent className="py-6">
              <AIInsights insights={entry.insights} />
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
} 