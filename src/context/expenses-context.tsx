'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Expense {
  id: string;
  item: string;
  category: string;
  date: string;
  amount: number;
}

interface ExpensesContextType {
  expenses: Expense[];
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => void;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

const initialExpenses: Expense[] = [
  {
    id: '1',
    item: 'Coffee',
    category: 'Food',
    date: '2024-10-24',
    amount: 250.0,
  },
  {
    id: '2',
    item: 'Lunch with team',
    category: 'Food',
    date: '2024-10-23',
    amount: 1250.0,
  },
  {
    id: '3',
    item: 'Monthly subscription',
    category: 'Software',
    date: '2024-10-22',
    amount: 999.0,
  },
  {
    id: '4',
    item: 'Groceries',
    category: 'Home',
    date: '2024-10-21',
    amount: 3500.0,
  },
  {
    id: '5',
    item: 'Movie tickets',
    category: 'Entertainment',
    date: '2024-10-20',
    amount: 800.0,
  },
];


export const ExpensesContextProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  const updateExpense = useCallback((id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    setExpenses(prevExpenses =>
      prevExpenses.map(expense =>
        expense.id === id ? { ...expense, ...updates } : expense
      )
    );
  }, []);
  
  const value = {
    expenses,
    updateExpense,
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
