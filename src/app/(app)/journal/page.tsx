
'use client';

import { useState } from 'react';
import { BookText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useJournalContext, type JournalEntry } from '@/context/journal-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function JournalPage() {
  const { entries, updateEntry, loading } = useJournalContext();
  const [editingField, setEditingField] = useState<{ id: string; field: keyof JournalEntry } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string, field: keyof JournalEntry) => {
    updateEntry(id, { [field]: e.target.value });
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
        {loading ? (
          [...Array(3)].map((_, i) => (
            <article key={i} className="space-y-3">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-16 w-full" />
              {i < 2 && <Separator className="my-8 bg-border/50" />}
            </article>
          ))
        ) : entries.length > 0 ? (
          entries.map((entry, index) => (
            <article key={entry.id}>
              {editingField?.id === entry.id && editingField?.field === 'title' ? (
                  <Input
                    defaultValue={entry.title}
                    onBlur={(e) => { handleInputChange(e, entry.id, 'title'); handleInputBlur(); }}
                    onKeyDown={(e) => { if(e.key === 'Enter') { handleInputChange(e as any, entry.id, 'title'); handleInputBlur(); } }}
                    autoFocus
                    className="text-2xl font-semibold tracking-tight h-auto mb-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
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
                    type="date"
                    defaultValue={entry.date}
                    onBlur={(e) => { handleInputChange(e, entry.id, 'date'); handleInputBlur(); }}
                    onKeyDown={(e) => { if(e.key === 'Enter') { handleInputChange(e as any, entry.id, 'date'); handleInputBlur(); } }}
                    autoFocus
                    className="text-sm text-muted-foreground h-auto mb-4 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                  />
              ) : (
                <p 
                  className="text-sm text-muted-foreground mb-4 cursor-pointer" 
                  onClick={() => setEditingField({ id: entry.id, field: 'date' })}
                >
                  {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                </p>
              )}

              {editingField?.id === entry.id && editingField?.field === 'content' ? (
                  <Textarea
                    defaultValue={entry.content || ''}
                    onBlur={(e) => { handleInputChange(e, entry.id, 'content'); handleInputBlur(); }}
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                    className="text-muted-foreground leading-relaxed w-full min-h-[10rem] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                  />
                ) : (
                  <p 
                    className="text-muted-foreground leading-relaxed cursor-pointer whitespace-pre-wrap" 
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
