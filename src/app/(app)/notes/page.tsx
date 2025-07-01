'use client';

import { Loader2, Sparkles, StickyNote, Zap } from 'lucide-react';
import { useNotesContext } from '@/context/notes-context';
import { Input } from '@/components/ui/input';
import React, { useState, useEffect, useCallback } from 'react';
import { getIconForTitle } from '@/lib/icon-map';
import { Button } from '@/components/ui/button';
import { getComposedNote, getChartDataFromText } from './actions';
import type { GenerateChartFromTextOutput } from '@/ai/flows/generate-chart-from-text';
import NoteChart from '@/components/note-chart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import RichTextEditor from '@/components/rich-text-editor';

export default function NotesPage() {
  const { activeNote, updateNote } = useNotesContext();
  const [isComposing, setIsComposing] = useState(false);
  const [isGeneratingChart, setIsGeneratingChart] = useState(false);
  const [generatedChartData, setGeneratedChartData] = useState<GenerateChartFromTextOutput | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  // Debounce state to avoid updating on every keystroke
  const [debouncedContent, setDebouncedContent] = useState(activeNote?.content || '');
  const debouncedUpdateNote = useCallback(updateNote, [updateNote]);

  // Update debounced content when active note changes
  useEffect(() => {
    if (activeNote) {
      setDebouncedContent(activeNote.content);
    }
  }, [activeNote]);

  // Debounce effect to save note content
  useEffect(() => {
    if (!activeNote || debouncedContent === activeNote.content) return;
    
    const handler = setTimeout(() => {
      debouncedUpdateNote(activeNote.id, { content: debouncedContent });
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedContent, activeNote, debouncedUpdateNote]);


  const handleContentChange = (content: string) => {
    // Update local state immediately for responsiveness
    setDebouncedContent(content);
  };

  const handleModifyWithAi = async () => {
    if (!activeNote || !activeNote.content) return;

    setIsComposing(true);
    try {
      const result = await getComposedNote(activeNote.content);
      // Directly update the note context and the debounced state
      const updatedContent = result.composedContent;
      updateNote(activeNote.id, {
        title: result.title,
        content: updatedContent,
      });
      setDebouncedContent(updatedContent);
    } catch (error) {
      console.error('Failed to modify note with AI', error);
    } finally {
      setIsComposing(false);
    }
  };

  const handleAiChartAction = async (selectedText: string) => {
    if (!selectedText) return;
    setIsGeneratingChart(true);
    setGeneratedChartData(null);
    setChartError(null);
    const betaErrorMessage = "Chart generation is a beta feature and we're working to improve it. Please try rephrasing your text or using a different selection.";
    try {
      const result = await getChartDataFromText(selectedText);
      if (result.isChartable && result.data && result.data.length > 0) {
        setGeneratedChartData(result);
      } else {
        setChartError(betaErrorMessage);
      }
    } catch (error) {
      console.error('Failed to generate chart', error);
      setChartError(betaErrorMessage);
    } finally {
      setIsGeneratingChart(false);
    }
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
        <RichTextEditor
            key={activeNote.id}
            content={activeNote.content}
            onChange={handleContentChange}
            onAiAction={handleAiChartAction}
        />
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
