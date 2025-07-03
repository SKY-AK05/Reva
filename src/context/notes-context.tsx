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

  // Initial fetch
  useEffect(() => {
    const getInitialNotes = async () => {
        setLoading(true);
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes);
        if (fetchedNotes.length > 0 && !activeNoteId) {
          setActiveNoteId(fetchedNotes[0].id);
        }
        setLoading(false);
    }
    getInitialNotes();
  }, [activeNoteId]);

  // Realtime listener
  useEffect(() => {
    const channel = supabase
      .channel('public:notes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            
            const formatNote = (record: any): Note => ({
              id: record.id,
              title: record.title,
              content: record.content || '',
              createdAt: record.created_at,
            });

            if (eventType === 'INSERT') {
                const newNote = formatNote(newRecord);
                setNotes(prevNotes => [newNote, ...prevNotes]);
            }
            if (eventType === 'UPDATE') {
                const updatedNote = formatNote(newRecord);
                setNotes(prevNotes => prevNotes.map(n => n.id === updatedNote.id ? updatedNote : n));
            }
            if (eventType === 'DELETE') {
                const deletedId = oldRecord.id;
                setNotes(prevNotes => {
                    const remainingNotes = prevNotes.filter(n => n.id !== deletedId);
                    if (activeNoteId === deletedId) {
                        setActiveNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
                    }
                    return remainingNotes;
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
    // The DB call will trigger the realtime listener which updates state.
    const newNote = await addNoteToDb(newNoteStub);
    if (newNote) {
      // Set the new note as active immediately.
      setActiveNoteId(newNote.id);
      return newNote.id;
    }
    return null;
  }, [supabase]);

  const updateNote = useCallback(async (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    // Optimistic update for responsiveness
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, ...updates } as Note : note
      )
    );
    // The DB call will trigger the realtime listener which will re-sync state.
    await updateNoteInDb(id, updates);
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    // The DB call will trigger the realtime listener which will handle state update.
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
