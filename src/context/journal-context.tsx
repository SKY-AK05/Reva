
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getJournalEntries, addJournalEntry as addEntryToDb, updateJournalEntry as updateEntryInDb, deleteJournalEntry as deleteEntryInDb } from '@/services/journal';
import { createClient } from '@/lib/supabase/client';

export interface JournalEntry {
  id: string;
  title: string;
  content: string | null;
  date: string;
}

export type NewJournalEntry = Omit<JournalEntry, 'id'>;

interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (entry: NewJournalEntry) => Promise<void>;
  updateEntry: (id: string, updates: Partial<Omit<JournalEntry, 'id'>>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  loading: boolean;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalContextProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const fetchedEntries = await getJournalEntries();
    setEntries(fetchedEntries);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    const channel = supabase
      .channel('public:journal_entries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_entries' },
        (payload) => {
          const newEntry = payload.new as JournalEntry;
          if (payload.eventType === 'INSERT') {
            setEntries(prev => [...prev, newEntry].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          }
          if (payload.eventType === 'UPDATE') {
            setEntries(prev => prev.map(e => e.id === newEntry.id ? newEntry : e).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          }
          if (payload.eventType === 'DELETE') {
            setEntries(prev => prev.filter(e => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAddEntry = useCallback(async (entry: NewJournalEntry) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await addEntryToDb({ ...entry, userId: user.id });
  }, [supabase]);

  const handleUpdateEntry = useCallback(async (id: string, updates: Partial<Omit<JournalEntry, 'id'>>) => {
     // The realtime listener will handle the UI update.
    await updateEntryInDb(id, updates);
  }, []);

  const handleDeleteEntry = useCallback(async (id: string) => {
    await deleteEntryInDb(id);
  }, []);
  
  const value = {
    entries,
    addEntry: handleAddEntry,
    updateEntry: handleUpdateEntry,
    deleteEntry: handleDeleteEntry,
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
