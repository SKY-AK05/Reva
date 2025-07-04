'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getJournalEntries, updateJournalEntry as updateEntryInDb } from '@/services/journal';
import { createClient } from '@/lib/supabase/client';

export interface JournalEntry {
  id: string;
  title: string;
  content: string | null;
  date: string;
}

interface JournalContextType {
  entries: JournalEntry[];
  updateEntry: (id: string, updates: Partial<Omit<JournalEntry, 'id'>>) => Promise<void>;
  loading: boolean;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalContextProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    const fetchedEntries = await getJournalEntries();
    setEntries(fetchedEntries);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    const channel = supabase
      .channel('public:journal_entries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_entries' },
        () => {
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchEntries]);

  const handleUpdateEntry = useCallback(async (id: string, updates: Partial<Omit<JournalEntry, 'id'>>) => {
     // The realtime listener will handle the UI update.
    await updateEntryInDb(id, updates);
  }, []);
  
  const value = {
    entries,
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
