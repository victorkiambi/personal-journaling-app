'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { JournalEntryForm } from '@/components/journal/JournalEntryForm';

export default function EditJournalEntryPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/journal/${id}`)}
          className="inline-flex items-center text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Entry
        </Button>
      </div>
      
      <JournalEntryForm entryId={id} isEditing={true} />
    </div>
  );
} 