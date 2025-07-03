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

  const fetchReminders = useCallback(async () => {
    const fetchedReminders = await getReminders();
    setReminders(fetchedReminders);
    if (loading) {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchReminders();

    const client = createClient();
    const channel = client
      .channel('public:reminders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reminders' },
        () => {
          fetchReminders();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [fetchReminders]);


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
