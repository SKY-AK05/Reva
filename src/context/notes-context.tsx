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

    // If there is no active note, or the active note was deleted, set a new one.
    if (!activeNoteId || !fetchedNotes.some(n => n.id === activeNoteId)) {
        setActiveNoteId(fetchedNotes.length > 0 ? fetchedNotes[0].id : null);
    }
    
    setLoading(false);
  }, [activeNoteId]);

  // Initial fetch
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Realtime listener
  useEffect(() => {
    const channel = supabase
      .channel('public:notes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload) => {
          const mapPayloadToNote = (p: any): Note => ({
            id: p.id,
            title: p.title,
            content: p.content || '',
            createdAt: p.created_at,
          });

          if (payload.eventType === 'INSERT') {
            setNotes(prev => [mapPayloadToNote(payload.new), ...prev]);
          }
          if (payload.eventType === 'UPDATE') {
            setNotes(prev => prev.map(n => n.id === payload.new.id ? mapPayloadToNote(payload.new) : n));
          }
          if (payload.eventType === 'DELETE') {
            setNotes(prev => {
              const newNotes = prev.filter(n => n.id !== payload.old.id);
              // If the deleted note was active, set a new active note
              if (activeNoteId === payload.old.id) {
                setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null);
              }
              return newNotes;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, activeNoteId]);

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
    // Let the realtime listener handle the state update after this call.
    const newNote = await addNoteToDb(newNoteStub);
    if (newNote) {
      // Set the new note as active immediately.
      setActiveNoteId(newNote.id);
      return newNote.id;
    }
    return null;
  }, [supabase]);

  const updateNote = useCallback(async (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    // Optimistic update for responsiveness on the current note
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, ...updates } as Note : note
      )
    );
    // The DB call will trigger the realtime listener which will re-sync state.
    await updateNoteInDb(id, updates);
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    // The DB call will trigger the realtime listener which will handle state update
    // and setting a new active note.
    await deleteNoteFromDb(id);
  }, []);
  
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
