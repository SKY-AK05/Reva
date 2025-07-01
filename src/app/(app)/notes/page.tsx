'use client';

import { Loader2, Sparkles, StickyNote, Zap } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useNotesContext } from '@/context/notes-context';
import { Input } from '@/components/ui/input';
import React, { useRef, useEffect, useState } from 'react';
import { getIconForTitle } from '@/lib/icon-map';
import { Button } from '@/components/ui/button';
import { getComposedNote, getChartDataFromText } from './actions';
import {
  FormattingToolbar,
  type FormatType,
  type AiActionType,
} from '@/components/formatting-toolbar';
import type { GenerateChartFromTextOutput } from '@/ai/flows/generate-chart-from-text';
import NoteChart from '@/components/note-chart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function NotesPage() {
  const { activeNote, updateNote } = useNotesContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isComposing, setIsComposing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [isGeneratingChart, setIsGeneratingChart] = useState(false);
  const [generatedChartData, setGeneratedChartData] = useState<GenerateChartFromTextOutput | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  // New state for view/edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Auto-resize textarea and focus when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.focus();
    }
  }, [isEditing, activeNote?.content]);

  // Reset to view mode when switching to a different note
  useEffect(() => {
    setIsEditing(false);
  }, [activeNote?.id]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeNote) {
      updateNote(activeNote.id, { content: e.target.value });
    }
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
      // Ensure we are in edit mode to see the modified content
      setIsEditing(true);
    } catch (error) {
      console.error('Failed to modify note with AI', error);
    } finally {
      setIsComposing(false);
    }
  };

  const handleSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Use a small timeout to ensure selection properties are updated
    setTimeout(() => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const hasSelection = start !== end;
      if (hasSelection && document.activeElement === textarea) {
        setShowToolbar(true);
        setSelectedText(textarea.value.substring(start, end));
        setSelection({ start, end });
      } else if (document.activeElement === textarea) {
        setShowToolbar(false);
      }
    }, 10);
  };

  const handleAiAction = async (actionType: AiActionType) => {
    setShowToolbar(false);
    if (actionType === 'generateChart' && selectedText) {
      setIsGeneratingChart(true);
      setGeneratedChartData(null);
      setChartError(null);
      try {
        const result = await getChartDataFromText(selectedText);
        if (result.isChartable && result.data && result.data.length > 0) {
          setGeneratedChartData(result);
        } else {
          setChartError(result.reasoning || "Could not generate a chart from the selected text.");
        }
      } catch (error) {
        console.error('Failed to generate chart', error);
        setChartError("An unexpected error occurred while generating the chart.");
      } finally {
        setIsGeneratingChart(false);
      }
    }
  };

  const handleFormat = (formatType: FormatType) => {
    if (!activeNote || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const { start, end } = selection;
    const currentText = activeNote.content;

    if (start === end) return;

    const selectedText = currentText.substring(start, end);
    let replacement = '';
    switch (formatType) {
      case 'bold': replacement = `**${selectedText}**`; break;
      case 'italic': replacement = `*${selectedText}*`; break;
      case 'strikethrough': replacement = `~~${selectedText}~~`; break;
      case 'code': replacement = `\`${selectedText}\``; break;
      case 'h1': case 'h2': case 'blockquote':
        const prefix = { h1: '# ', h2: '## ', blockquote: '> ' }[formatType];
        replacement = selectedText.split('\n').map((line) => `${prefix}${line}`).join('\n');
        break;
      case 'bulletList':
        replacement = selectedText.split('\n').map((line) => `- ${line}`).join('\n');
        break;
      case 'orderedList':
        replacement = selectedText.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n');
        break;
      default: replacement = selectedText;
    }

    const newContent = `${currentText.substring(0, start)}${replacement}${currentText.substring(end)}`;
    updateNote(activeNote.id, { content: newContent });

    setShowToolbar(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 0);
  };

  const clearChartData = () => {
    setGeneratedChartData(null);
    setChartError(null);
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
            onClick={handleModifyWithAi}
            disabled={isComposing || !activeNote.content.trim()}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isComposing ? 'Modifying...' : 'Modify with AI'}
          </Button>
        </div>
      </header>
      <main className="relative flex-1 p-6 sm:p-8 lg:p-12 notebook-lines-journal overflow-y-auto">
        {isEditing ? (
          <>
            <div
              className="w-full flex justify-center mb-4 transition-opacity duration-300"
              style={{
                opacity: showToolbar ? 1 : 0,
                pointerEvents: showToolbar ? 'auto' : 'none',
              }}
            >
              <FormattingToolbar
                onFormat={handleFormat}
                onAiAction={handleAiAction}
              />
            </div>
            <Textarea
              ref={textareaRef}
              placeholder="Start with a brain dump..."
              value={activeNote.content}
              onChange={handleContentChange}
              onKeyUp={handleSelection}
              onMouseUp={handleSelection}
              onBlur={() => {
                setShowToolbar(false);
                setIsEditing(false);
              }}
              className="w-full text-2xl resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 bg-transparent block overflow-hidden"
              rows={1}
            />
          </>
        ) : (
          <div
            className="prose dark:prose-invert max-w-none text-2xl cursor-text w-full min-h-[5rem]"
            onClick={() => setIsEditing(true)}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {activeNote.content || 'Click to start writing...'}
            </ReactMarkdown>
          </div>
        )}
        <div className="mt-6">
          {isGeneratingChart && (
            <div className="flex items-center justify-center gap-3 text-muted-foreground p-8 animate-fade-in-up">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">Generating chart...</span>
            </div>
          )}
          {chartError && (
            <Alert variant="destructive" className="animate-fade-in-up">
              <Zap className="h-4 w-4" />
              <AlertTitle>Chart Generation Failed</AlertTitle>
              <AlertDescription>{chartError}</AlertDescription>
            </Alert>
          )}
          {generatedChartData && (
            <NoteChart
              chartData={generatedChartData}
              onClear={clearChartData}
            />
          )}
        </div>
      </main>
    </div>
  );
}
