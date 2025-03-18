'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
}

export function JournalEntryList() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/journal', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch journal entries');
        }

        const data = await response.json();
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-4">
        Error: {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No journal entries yet</h3>
        <p className="mt-2 text-sm text-gray-600">
          Start writing your first journal entry to begin your journaling journey.
        </p>
        <Link
          href="/journal/new"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create your first entry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-gray-900">
                  <Link href={`/journal/${entry.id}`} className="hover:text-indigo-600">
                    {entry.title}
                  </Link>
                </h3>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${entry.category.color}20`,
                    color: entry.category.color,
                  }}
                >
                  {entry.category.name}
                </span>
              </div>
              <time className="text-sm text-gray-500">
                {new Date(entry.createdAt).toLocaleDateString()}
              </time>
            </div>
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">{entry.content}</p>
            <div className="mt-4">
              <Link
                href={`/journal/${entry.id}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Read more
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          </div>
        </div>
      ))}
      <div className="fixed bottom-8 right-8">
        <Link
          href="/journal/new"
          className="inline-flex items-center p-3 border border-transparent rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
} 