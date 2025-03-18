'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { JournalEntryForm } from '@/components/journal/JournalEntryForm';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  categoryId: string;
}

export default function EditJournalEntryPage() {
  const { id } = useParams();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const data = await response.json();
        setEntry(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="text-center text-red-600 py-4">
        {error || 'Journal entry not found'}
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">
            Edit Journal Entry
          </h1>
        </div>
        <div className="mt-8">
          <JournalEntryForm entry={entry} isEditing />
        </div>
      </div>
    </div>
  );
} 