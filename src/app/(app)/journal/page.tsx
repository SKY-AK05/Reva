'use client';

import { useState } from 'react';
import { BookText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const initialEntries = [
  {
    id: '1',
    date: 'October 24, 2024',
    title: 'A breakthrough idea',
    content: 'Had a fantastic idea for a new feature today. It involves using machine learning to predict user intent and proactively suggest actions. This could be a game-changer for the app...',
  },
  {
    id: '2',
    date: 'October 23, 2024',
    title: 'Reflections on the week',
    content: 'This week was productive but challenging. Managed to close out the main deliverables for the Q3 report. Feeling a bit drained but accomplished. Need to remember to take a proper break this weekend.',
  },
  {
    id: '3',
    date: 'October 21, 2024',
    title: 'Random thought',
    content: 'Why do we call it a "building" when it\'s already built?',
  },
];

type Entry = typeof initialEntries[0];

export default function JournalPage() {
  const [entries, setEntries] = useState(initialEntries);
  const [editingField, setEditingField] = useState<{ id: string; field: keyof Entry } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string, field: keyof Entry) => {
    setEntries(entries.map(entry => (entry.id === id ? { ...entry, [field]: e.target.value } : entry)));
  };
  
  const handleInputBlur = () => {
    setEditingField(null);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      setEditingField(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-6 sm:p-8 lg:p-12 notebook-lines-journal">
      <header className="flex items-center gap-4 h-[5.25rem]">
        <BookText className="w-9 h-9 text-primary" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
          <p className="text-muted-foreground">Your private space for thoughts and ideas.</p>
        </div>
      </header>

      <div className="space-y-8 mt-7">
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <article key={entry.id}>
              {editingField?.id === entry.id && editingField?.field === 'title' ? (
                  <Input
                    value={entry.title}
                    onChange={(e) => handleInputChange(e, entry.id, 'title')}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                    className="text-2xl font-semibold tracking-tight h-auto mb-1"
                  />
                ) : (
                  <h2 
                    className="text-2xl font-semibold tracking-tight cursor-pointer" 
                    onClick={() => setEditingField({ id: entry.id, field: 'title' })}
                  >
                    {entry.title}
                  </h2>
                )}

              {editingField?.id === entry.id && editingField?.field === 'date' ? (
                <Input
                    value={entry.date}
                    onChange={(e) => handleInputChange(e, entry.id, 'date')}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                    className="text-sm text-muted-foreground h-auto mb-4"
                  />
              ) : (
                <p 
                  className="text-sm text-muted-foreground mb-4 cursor-pointer" 
                  onClick={() => setEditingField({ id: entry.id, field: 'date' })}
                >
                  {entry.date}
                </p>
              )}

              {editingField?.id === entry.id && editingField?.field === 'content' ? (
                  <Textarea
                    value={entry.content}
                    onChange={(e) => handleInputChange(e, entry.id, 'content')}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                    className="text-muted-foreground leading-relaxed w-full"
                  />
                ) : (
                  <p 
                    className="text-muted-foreground leading-relaxed cursor-pointer" 
                    onClick={() => setEditingField({ id: entry.id, field: 'content' })}
                  >
                    {entry.content}
                  </p>
                )}
                
              {index < entries.length - 1 && <Separator className="my-8 bg-border/50" />}
            </article>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16">
            <BookText className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Journal Entries</h3>
            <p className="mt-2 text-sm">Start your journaling journey today.</p>
          </div>
        )}
      </div>
    </div>
  );
}
