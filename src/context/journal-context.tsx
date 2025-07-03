'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getJournalEntries, addJournalEntry, updateJournalEntry as updateEntryInDb } from '@/services/journal';
import { v4 as uuidv4 } from 'uuid';

export interface JournalEntry {
  id: string;
  title: string;
  content: string | null;
  date: string;
}

interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (newEntry: Omit<JournalEntry, 'id'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<Omit<JournalEntry, 'id'>>) => Promise<void>;
  loading: boolean;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalContextProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      const fetchedEntries = await getJournalEntries();
      setEntries(fetchedEntries);
      setLoading(false);
    };
    fetchEntries();
  }, []);

  const handleAddEntry = useCallback(async (newEntry: Omit<JournalEntry, 'id'>) => {
    const addedEntry = await addJournalEntry(newEntry);
    if(addedEntry) {
      setEntries(prev => [addedEntry, ...prev]);
    }
  }, []);

  const handleUpdateEntry = useCallback(async (id: string, updates: Partial<Omit<JournalEntry, 'id'>>) => {
     // Optimistic update
    setEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === id ? { ...entry, ...updates } : entry
      )
    );
    try {
      await updateEntryInDb(id, updates);
    } catch (error) {
       console.error("Failed to update entry, rolling back", error);
       const fetchedEntries = await getJournalEntries();
       setEntries(fetchedEntries);
    }
  }, []);
  
  const value = {
    entries,
    addEntry: handleAddEntry,
    updateEntry: handleUpdateEntry,
    loading,
  };

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
};

export const useJournalContext = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournalContext must be used within a JournalContextProvider');
  }
  return context;
};
