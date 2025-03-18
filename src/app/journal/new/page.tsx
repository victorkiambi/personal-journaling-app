import { JournalEntryForm } from '@/components/journal/JournalEntryForm';

export default function NewJournalEntryPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">
            New Journal Entry
          </h1>
        </div>
        <div className="mt-8">
          <JournalEntryForm />
        </div>
      </div>
    </div>
  );
} 