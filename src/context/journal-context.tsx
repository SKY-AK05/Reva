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

  useEffect(() => {
    const fetchInitialEntries = async () => {
      setLoading(true);
      const fetchedEntries = await getJournalEntries();
      setEntries(fetchedEntries);
      setLoading(false);
    }
    fetchInitialEntries();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('public:journal_entries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_entries' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          if (eventType === 'INSERT') {
            setEntries(prev => [...prev, newRecord as JournalEntry].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          }
          if (eventType === 'UPDATE') {
            setEntries(prev => prev.map(e => e.id === (newRecord as JournalEntry).id ? newRecord as JournalEntry : e));
          }
          if (eventType === 'DELETE') {
            setEntries(prev => prev.filter(e => e.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

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
