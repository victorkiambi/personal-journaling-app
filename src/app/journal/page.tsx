import JournalEntryList from '@/components/journal/JournalEntryList';

export default function JournalPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">
          My Journal
        </h1>
      </div>
      <div className="mt-8">
        <JournalEntryList />
      </div>
    </div>
  );
} 