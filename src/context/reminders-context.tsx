'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getReminders, addReminder, updateReminder as updateReminderInDb } from '@/services/reminders';

export interface Reminder {
  id: string;
  title: string;
  time: string;
  notes: string | null;
}

interface RemindersContextType {
  reminders: Reminder[];
  addReminder: (newReminder: Omit<Reminder, 'id'>) => Promise<void>;
  updateReminder: (id: string, updates: Partial<Omit<Reminder, 'id'>>) => Promise<void>;
  loading: boolean;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export const RemindersContextProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true);
      const fetchedReminders = await getReminders();
      setReminders(fetchedReminders);
      setLoading(false);
    };
    fetchReminders();
  }, []);


  const handleAddReminder = useCallback(async (newReminder: Omit<Reminder, 'id'>) => {
    const addedReminder = await addReminder(newReminder);
    if (addedReminder) {
      setReminders(prev => [...prev, addedReminder]);
    }
  }, []);

  const handleUpdateReminder = useCallback(async (id: string, updates: Partial<Omit<Reminder, 'id'>>) => {
    setReminders(prevReminders =>
      prevReminders.map(rem =>
        rem.id === id ? { ...rem, ...updates } : rem
      )
    );
    try {
      await updateReminderInDb(id, updates);
    } catch(e) {
      console.error("Failed to update reminder", e);
      const fetchedReminders = await getReminders();
      setReminders(fetchedReminders);
    }
  }, []);
  
  const value = {
    reminders,
    addReminder: handleAddReminder,
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
