'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getExpenses, addExpense, updateExpense as updateExpenseInDb } from '@/services/expenses';

export interface Expense {
  id: string;
  item: string;
  category: string | null;
  date: string;
  amount: number;
}

interface ExpensesContextType {
  expenses: Expense[];
  addExpense: (newExpense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => Promise<void>;
  loading: boolean;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export const ExpensesContextProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      const fetchedExpenses = await getExpenses();
      setExpenses(fetchedExpenses);
      setLoading(false);
    };
    fetchExpenses();
  }, []);

  const handleAddExpense = useCallback(async (newExpense: Omit<Expense, 'id'>) => {
    const addedExpense = await addExpense(newExpense);
    if(addedExpense) {
      setExpenses(prev => [...prev, addedExpense]);
    }
  }, []);

  const handleUpdateExpense = useCallback(async (id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    const updatedExpense = await updateExpenseInDb(id, updates);
    if (updatedExpense) {
      setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense : exp));
    }
  }, []);
  
  const value = {
    expenses,
    addExpense: handleAddExpense,
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
