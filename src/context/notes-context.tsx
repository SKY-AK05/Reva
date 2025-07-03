'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getNotes, addNote as addNoteToDb, updateNote as updateNoteInDb, deleteNote as deleteNoteFromDb } from '@/services/notes';
import { createClient } from '@/lib/supabase/client';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  activeNote: Note | null;
  setActiveNoteById: (id: string | null) => void;
  addNewNote: () => Promise<string | null>; // Returns the new note's ID
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  deleteNote: (id: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesContextProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const fetchedNotes = await getNotes();
    setNotes(fetchedNotes);
    if (fetchedNotes.length > 0 && !activeNoteId) {
      setActiveNoteId(fetchedNotes[0].id);
    }
    setLoading(false);
  }, [activeNoteId]);

  useEffect(() => {
    fetchNotes();
  }, []); // Initial fetch

  useEffect(() => {
    const channel = supabase
      .channel('public:notes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload) => {
           // Re-fetch all notes to ensure consistency
           fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchNotes]);

  const activeNote = notes.find(note => note.id === activeNoteId) || null;

  const setActiveNoteById = useCallback((id: string | null) => {
    setActiveNoteId(id);
  }, []);

  const addNewNote = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const newNoteStub = {
      title: 'Untitled Note',
      content: '',
      userId: user.id
    };
    const newNote = await addNoteToDb(newNoteStub);
    if (newNote) {
      setActiveNoteId(newNote.id);
      return newNote.id;
    }
    return null;
  }, [supabase]);

  const updateNote = useCallback(async (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    // Optimistic update
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, ...updates } : note
      )
    );
    // Debounced update will be handled by the component using this.
    // The actual DB update will be triggered from the component.
    await updateNoteInDb(id, updates);
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    const deletedNote = await deleteNoteFromDb(id);
    if (deletedNote) {
      // If the active note was deleted, select the next one or null
      if (activeNoteId === id) {
        const remainingNotes = notes.filter(n => n.id !== id);
        setActiveNoteId(remainingNotes[0]?.id || null);
      }
    }
  }, [activeNoteId, notes]);
  
  const value = {
    notes,
    loading,
    activeNote,
    setActiveNoteById,
    addNewNote,
    updateNote,
    deleteNote
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotesContext must be used within a NotesContextProvider');
  }
  return context;
};
