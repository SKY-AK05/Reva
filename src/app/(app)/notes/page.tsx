'use client';

import { StickyNote } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useNotesContext } from '@/context/notes-context';
import { Input } from '@/components/ui/input';

export default function NotesPage() {
  const { activeNote, updateNote } = useNotesContext();

  if (!activeNote) {
    return (
      <div className="flex flex-1 flex-col h-full items-center justify-center text-center text-muted-foreground p-8">
        <StickyNote className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-semibold">No Note Selected</h2>
        <p className="max-w-xs mt-2">Create a new note or select an existing one from the "Notes" menu in the header to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      <header className="flex items-center gap-4 h-[5.5rem] px-6 sm:px-8 lg:p-12 border-b shrink-0">
        <StickyNote className="w-9 h-9 text-primary" />
        <Input
          value={activeNote.title}
          onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
          className="text-3xl font-bold tracking-tight border-0 focus-visible:ring-0 p-0 bg-transparent h-auto"
          placeholder="Untitled Note"
        />
      </header>
      <main className="flex-1 p-6 sm:p-8 lg:p-12 notebook-lines-journal">
        <Textarea
          placeholder="Start with a brain dump... just write anything that comes to mind."
          value={activeNote.content}
          onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
          className="w-full h-full text-base resize-none border-0 focus-visible:ring-0 p-0 bg-transparent"
        />
      </main>
    </div>
  );
}
