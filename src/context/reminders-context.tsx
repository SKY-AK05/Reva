'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Reminder {
  id: string;
  title: string;
  time: string;
  notes: string;
}

interface RemindersContextType {
  reminders: Reminder[];
  updateReminder: (id: string, updates: Partial<Omit<Reminder, 'id'>>) => void;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

const initialReminders: Reminder[] = [
  {
    id: '1',
    title: 'Follow up with a client',
    time: '2024-10-25 10:00 AM',
    notes: 'Discuss the new proposal.',
  },
  {
    id: '2',
    title: 'Pay credit card bill',
    time: '2024-10-26 05:00 PM',
    notes: 'Due tomorrow.',
  },
  {
    id: '3',
    title: 'Team meeting',
    time: '2024-10-28 11:30 AM',
    notes: 'Project sync-up in Room 3.',
  },
];

export const RemindersContextProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);

  const updateReminder = useCallback((id: string, updates: Partial<Omit<Reminder, 'id'>>) => {
    setReminders(prevReminders =>
      prevReminders.map(rem =>
        rem.id === id ? { ...rem, ...updates } : rem
      )
    );
  }, []);
  
  const value = {
    reminders,
    updateReminder,
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
