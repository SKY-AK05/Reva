
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getExpenses, addExpense as addExpenseToDb, updateExpense as updateExpenseInDb, deleteExpense as deleteExpenseFromDb } from '@/services/expenses';
import { createClient } from '@/lib/supabase/client';

export interface Expense {
  id: string;
  item: string;
  category: string | null;
  date: string;
  amount: number;
}

export type NewExpense = Omit<Expense, 'id'>;

interface ExpensesContextType {
  expenses: Expense[];
  addExpense: (expense: NewExpense) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
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

  const handleAddExpense = useCallback(async (expense: NewExpense) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await addExpenseToDb({ ...expense, userId: user.id });
  }, [supabase]);

  const handleUpdateExpense = useCallback(async (id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    setExpenses(prevExpenses =>
        prevExpenses.map(expense =>
            expense.id === id ? { ...expense, ...updates } as Expense : expense
        )
    );
    await updateExpenseInDb(id, updates);
  }, []);

  const handleDeleteExpense = useCallback(async (id: string) => {
    // The realtime listener will handle the UI update after this call succeeds.
    await deleteExpenseFromDb(id);
  }, []);
  
  const value = {
    expenses,
    addExpense: handleAddExpense,
    updateExpense: handleUpdateExpense,
    deleteExpense: handleDeleteExpense,
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
