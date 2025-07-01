'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface NotesContextType {
  notes: Note[];
  activeNote: Note | null;
  setActiveNoteById: (id: string | null) => void;
  addNewNote: () => string; // Returns the new note's ID
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const initialNotes: Note[] = [
    {
      id: '1',
      title: 'A breakthrough idea',
      content: 'Had a fantastic idea for a new feature today. It involves using machine learning to predict user intent and proactively suggest actions. This could be a game-changer for the app...',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Meeting Notes 10/24',
      content: '- Project Phoenix: Sync on Q4 goals.\n- Discussed budget for new marketing campaign.\n- Action item: Alex to draft proposal by EOD Friday.',
      createdAt: new Date().toISOString(),
    },
    {
        id: '3',
        title: 'My Favorite Quotes',
        content: '1. "The only way to do great work is to love what you do." - Steve Jobs\n2. "The best way to predict the future is to create it." - Peter Drucker',
        createdAt: new Date().toISOString(),
    },
];

export const NotesContextProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(initialNotes[0]?.id || null);

  const activeNote = notes.find(note => note.id === activeNoteId) || null;

  const setActiveNoteById = (id: string | null) => {
    setActiveNoteId(id);
  };

  const addNewNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
    return newNote.id;
  };

  const updateNote = (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, ...updates } : note
      )
    );
  };
  
  const value = {
    notes,
    activeNote,
    setActiveNoteById,
    addNewNote,
    updateNote,
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
