import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { TextSuggestions } from './TextSuggestions';

interface JournalEntryEditorProps {
  initialTitle?: string;
  initialContent?: string;
  onSave: (title: string, content: string) => void;
}

export function JournalEntryEditor({ initialTitle = '', initialContent = '', onSave }: JournalEntryEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const handleApplySuggestion = (replacement: string) => {
    // For now, just append the suggestion
    // TODO: Implement more sophisticated text replacement
    setContent(prev => prev + ' ' + replacement);
  };

  const handleSelectCompletion = (completion: string) => {
    setContent(prev => prev + ' ' + completion);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <Input
            placeholder="Entry Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold"
          />
          <Textarea
            placeholder="Write your journal entry..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px]"
          />
        </div>
      </Card>

      <TextSuggestions
        content={content}
        onApplySuggestion={handleApplySuggestion}
        onSelectCompletion={handleSelectCompletion}
      />
    </div>
  );
} 