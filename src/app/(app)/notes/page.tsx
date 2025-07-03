'use client';

import { Loader2, Sparkles, StickyNote, Zap, Trash2 } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function NotesPage() {
  const { notes, activeNote, updateNote, loading, deleteNote, addNewNote } = useNotesContext();
  const [isComposing, setIsComposing] = useState(false);
  const [isGeneratingChart, setIsGeneratingChart] = useState(false);
  const [generatedChartData, setGeneratedChartData] = useState<GenerateChartFromTextOutput | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  // Debounce state to avoid updating on every keystroke
  const [debouncedContent, setDebouncedContent] = useState('');
  const debouncedUpdateNote = useCallback(updateNote, []);

  // Effect to handle creating the first note if none exist
  useEffect(() => {
    if (!loading && notes.length === 0) {
        addNewNote();
    }
  }, [loading, notes.length, addNewNote]);


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
    setDebouncedContent(content);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeNote) {
        updateNote(activeNote.id, { title: e.target.value })
    }
  }

  const handleDeleteNote = async () => {
    if (activeNote) {
      await deleteNote(activeNote.id);
    }
  }

  const handleModifyWithAi = async () => {
    if (!activeNote || !activeNote.content) return;

    setIsComposing(true);
    try {
      const result = await getComposedNote(activeNote.content);
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

  if (loading || !activeNote) {
    return (
        <div className="flex flex-1 flex-col h-full">
            <header className="flex items-center gap-4 p-6 sm:p-8 lg:p-12 border-b shrink-0">
                <Skeleton className="w-9 h-9 rounded-full" />
                <Skeleton className="h-12 w-1/2" />
            </header>
            <main className="flex-1 p-6 sm:p-8 lg:p-12 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </main>
        </div>
    );
  }

  const NoteIcon = getIconForTitle(activeNote.title, activeNote.id);

  return (
    <div className="flex flex-1 flex-col h-full">
      <header className="flex items-center gap-4 p-6 sm:p-8 lg:p-12 border-b shrink-0">
        <NoteIcon className="w-9 h-9 text-primary flex-shrink-0" />
        <Input
          key={activeNote.id} // Re-mount input when active note changes
          defaultValue={activeNote.title}
          onChange={handleTitleChange}
          className="text-5xl font-bold tracking-tight border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 bg-transparent h-auto"
          placeholder="Untitled Note"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={handleModifyWithAi}
            disabled={isComposing || !activeNote.content.trim()}
            variant="outline"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isComposing ? 'Modifying...' : 'Modify with AI'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your note.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteNote}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
