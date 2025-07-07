'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getExpenses, updateExpense as updateExpenseInDb } from '@/services/expenses';
import { createClient } from '@/lib/supabase/client';

export interface Expense {
  id: string;
  item: string;
  category: string | null;
  date: string;
  amount: number;
}

interface ExpensesContextType {
  expenses: Expense[];
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => Promise<void>;
  loading: boolean;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export const ExpensesContextProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const fetchedExpenses = await getExpenses();
    setExpenses(fetchedExpenses);
    setLoading(false);
  }, []);

  // Effect for the initial data fetch.
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);


  // Effect for the real-time subscription.
  useEffect(() => {
    const channel = supabase
      .channel('public:expenses')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        (payload) => {
          const newExpense = payload.new as Expense;
          if (payload.eventType === 'INSERT') {
            setExpenses(prev => [newExpense, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          }
          if (payload.eventType === 'UPDATE') {
            setExpenses(prev => prev.map(e => e.id === newExpense.id ? newExpense : e));
          }
          if (payload.eventType === 'DELETE') {
            setExpenses(prev => prev.filter(e => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleUpdateExpense = useCallback(async (id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    // The realtime listener will handle the UI update after this call succeeds.
    await updateExpenseInDb(id, updates);
  }, []);
  
  const value = {
    expenses,
    updateExpense: handleUpdateExpense,
    loading,
  };

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
};

export const useExpensesContext = () => {
  const context = useContext(ExpensesContext);
  if (context === undefined) {
    throw new Error('useExpensesContext must be used within a ExpensesContextProvider');
  }
  return context;
};
