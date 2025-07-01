'use client';

import { Plus, Sparkles, StickyNote } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useNotesContext } from '@/context/notes-context';
import { Input } from '@/components/ui/input';
import React, { useRef, useEffect, useState } from 'react';
import { getIconForTitle } from '@/lib/icon-map';
import { Button } from '@/components/ui/button';
import { getComposedNote } from './actions';
import {
  FormattingToolbar,
  type FormatType,
} from '@/components/formatting-toolbar';

export default function NotesPage() {
  const { activeNote, updateNote, addNewNote } = useNotesContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  // State for the formatting toolbar
  const mainContainerRef = useRef<HTMLElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

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

  const handleSelection = () => {
    // We need a slight delay to allow the selection to be reported
    setTimeout(() => {
      if (!mainContainerRef.current) return;
      const selection = window.getSelection();

      if (
        selection &&
        selection.rangeCount > 0 &&
        selection.toString().trim().length > 0 &&
        document.activeElement === textareaRef.current
      ) {
        const range = selection.getRangeAt(0);
        const rangeRect = range.getBoundingClientRect();
        const containerRect = mainContainerRef.current.getBoundingClientRect();

        const top = rangeRect.top - containerRect.top - 60; // Offset for toolbar height
        const left =
          rangeRect.left - containerRect.left + rangeRect.width / 2;

        setToolbarPosition({ top, left });
        setShowToolbar(true);
      } else {
        setShowToolbar(false);
      }
    }, 10);
  };

  const handleFormat = (formatType: FormatType) => {
    if (!activeNote || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = activeNote.content;
    const selectedText = currentText.substring(start, end);

    if (start === end) return;

    let replacement = '';
    switch (formatType) {
      case 'bold':
        replacement = `**${selectedText}**`;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        break;
      case 'strikethrough':
        replacement = `~~${selectedText}~~`;
        break;
      case 'code':
        replacement = `\`${selectedText}\``;
        break;
      case 'h1':
      case 'h2':
      case 'blockquote':
        const prefix =
          { h1: '# ', h2: '## ', blockquote: '> ' }[formatType];
        replacement = selectedText
          .split('\n')
          .map((line) => `${prefix}${line}`)
          .join('\n');
        break;
      case 'bulletList':
        replacement = selectedText
          .split('\n')
          .map((line) => `- ${line}`)
          .join('\n');
        break;
      case 'orderedList':
        replacement = selectedText
          .split('\n')
          .map((line, index) => `${index + 1}. ${line}`)
          .join('\n');
        break;
      default:
        replacement = selectedText;
    }

    const newContent = `${currentText.substring(
      0,
      start
    )}${replacement}${currentText.substring(end)}`;
    updateNote(activeNote.id, { content: newContent });

    setShowToolbar(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 0);
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
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            onClick={addNewNote}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
          <Button
            onClick={handleModifyWithAi}
            disabled={isComposing || !activeNote.content.trim()}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isComposing ? 'Modifying...' : 'Modify with AI'}
          </Button>
        </div>
      </header>
      <main
        ref={mainContainerRef}
        onMouseUp={handleSelection}
        className="relative flex-1 p-6 sm:p-8 lg:p-12 notebook-lines-journal overflow-y-auto"
      >
        {showToolbar && (
          <FormattingToolbar
            onFormat={handleFormat}
            className="absolute"
            style={{
              top: toolbarPosition.top,
              left: toolbarPosition.left,
              transform: 'translateX(-50%)',
            }}
          />
        )}
        <Textarea
          ref={textareaRef}
          placeholder="Start with a brain dump... just write anything that comes to mind."
          value={activeNote.content}
          onChange={handleContentChange}
          onKeyUp={handleSelection}
          onBlur={() => setTimeout(() => setShowToolbar(false), 200)} // delay to allow clicks
          className="w-full text-2xl resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 bg-transparent block overflow-hidden"
          rows={1}
        />
      </main>
    </div>
  );
}
