'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getReminders, updateReminder as updateReminderInDb } from '@/services/reminders';
import { createClient } from '@/lib/supabase/client';

export interface Reminder {
  id: string;
  title: string;
  time: string;
  notes: string | null;
}

interface RemindersContextType {
  reminders: Reminder[];
  updateReminder: (id: string, updates: Partial<Omit<Reminder, 'id'>>) => Promise<void>;
  loading: boolean;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export const RemindersContextProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchInitialReminders = async () => {
      setLoading(true);
      const fetchedReminders = await getReminders();
      setReminders(fetchedReminders);
      setLoading(false);
    }
    fetchInitialReminders();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('public:reminders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reminders' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
           if (eventType === 'INSERT') {
            setReminders(prev => [...prev, newRecord as Reminder].sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime()));
          }
          if (eventType === 'UPDATE') {
            setReminders(prev => prev.map(r => r.id === (newRecord as Reminder).id ? newRecord as Reminder : r));
          }
          if (eventType === 'DELETE') {
            setReminders(prev => prev.filter(r => r.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);


  const handleUpdateReminder = useCallback(async (id: string, updates: Partial<Omit<Reminder, 'id'>>) => {
    // The realtime listener will handle the UI update.
    await updateReminderInDb(id, updates);
  }, []);
  
  const value = {
    reminders,
    updateReminder: handleUpdateReminder,
    loading,
  };

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
};

export const useRemindersContext = () => {
  const context = useContext(RemindersContext);
  if (context === undefined) {
    throw new Error('useRemindersContext must be used within a RemindersContextProvider');
  }
  return context;
};
