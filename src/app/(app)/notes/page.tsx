'use client';

import { Sparkles, StickyNote } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useNotesContext } from '@/context/notes-context';
import { Input } from '@/components/ui/input';
import React, { useRef, useEffect, useState } from 'react';
import { getIconForTitle } from '@/lib/icon-map';
import { Button } from '@/components/ui/button';
import { getComposedNote } from './actions';

export default function NotesPage() {
  const { activeNote, updateNote } = useNotesContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  // Adjust textarea height to fit content when the note changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [activeNote]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeNote) {
      updateNote(activeNote.id, { content: e.target.value });
    }
    // Auto-resize the textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleModifyWithAi = async () => {
    if (!activeNote || !activeNote.content) return;

    setIsComposing(true);
    try {
      const result = await getComposedNote(activeNote.content);
      updateNote(activeNote.id, {
        title: result.title,
        content: result.composedContent,
      });
    } catch (error) {
      console.error('Failed to modify note with AI', error);
      // TODO: Add user-facing error toast
    } finally {
      setIsComposing(false);
    }
  };

  if (!activeNote) {
    return (
      <div className="flex flex-1 flex-col h-full items-center justify-center text-center text-muted-foreground p-8">
        <StickyNote className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-semibold">No Note Selected</h2>
        <p className="max-w-xs mt-2">
          Create a new note or select an existing one from the "Notes" menu in
          the header to get started.
        </p>
      </div>
    );
  }

  const NoteIcon = getIconForTitle(activeNote.title, activeNote.id);

  return (
    <div className="flex flex-1 flex-col h-full">
      <header className="flex items-center gap-4 p-6 sm:p-8 lg:p-12 border-b shrink-0">
        <NoteIcon className="w-9 h-9 text-primary flex-shrink-0" />
        <Input
          value={activeNote.title}
          onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
          className="text-5xl font-bold tracking-tight border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 bg-transparent h-auto"
          placeholder="Untitled Note"
        />
        <Button
          onClick={handleModifyWithAi}
          disabled={isComposing || !activeNote.content.trim()}
          className="ml-auto"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isComposing ? 'Modifying...' : 'Modify with AI'}
        </Button>
      </header>
      <main className="flex-1 p-6 sm:p-8 lg:p-12 notebook-lines-journal overflow-y-auto">
        <Textarea
          ref={textareaRef}
          placeholder="Start with a brain dump... just write anything that comes to mind."
          value={activeNote.content}
          onChange={handleContentChange}
          className="w-full text-2xl resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 bg-transparent block overflow-hidden"
          rows={1}
        />
      </main>
    </div>
  );
}
