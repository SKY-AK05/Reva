'use client';

import { useState } from 'react';
import { StickyNote } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function NotesPage() {
  const [content, setContent] = useState(
`This is your canvas.

Write anything that comes to mind—a random thought, a project plan, meeting notes, or a journal entry.

Unlike other pages, this one is a simple, open space for you to think. The other modules like Tasks, Reminders, and Goals are designed for structured entries.`
  );

  return (
    <div className="flex flex-1 flex-col h-full">
      <header className="flex items-center gap-4 h-[5.5rem] px-6 sm:px-8 lg:p-12 border-b shrink-0">
        <StickyNote className="w-9 h-9 text-primary" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Note</h1>
          <p className="text-muted-foreground">Your canvas for thoughts and ideas.</p>
        </div>
      </header>
      <main className="flex-1 p-6 sm:p-8 lg:p-12 notebook-lines-journal">
        <Textarea
          placeholder="Start with a brain dump... just write anything that comes to mind."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full text-base resize-none border-0 focus-visible:ring-0 p-0 bg-transparent"
        />
      </main>
    </div>
  );
}
