// src/services/expenses.ts
'use server';
import { createServerClient } from "@/lib/supabase/server";
import type { Expense } from "@/context/expenses-context";

export async function getExpenses(): Promise<Expense[]> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
  return data as Expense[];
}

export async function addExpense(expense: Omit<Expense, 'id'> & { userId: string }): Promise<Expense | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('expenses')
        .insert({
            user_id: expense.userId,
            item: expense.item,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error adding expense:', error);
        return null;
    }
    return data as Expense;
}

export async function addExpenses(expenses: (Omit<Expense, 'id'> & { userId: string })[]): Promise<Expense[] | null> {
    const supabase = createServerClient();
    const expensesToInsert = expenses.map(e => ({
        user_id: e.userId,
        item: e.item,
        amount: e.amount,
        category: e.category,
        date: e.date,
    }));

    const { data, error } = await supabase
        .from('expenses')
        .insert(expensesToInsert)
        .select();
    
    if (error) {
        console.error('Error adding expenses:', error);
        return null;
    }
    return data as Expense[];
}

export async function updateExpense(id: string, updates: Partial<Omit<Expense, 'id'>>): Promise<Expense | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating expense:', error);
        return null;
    }
    return data as Expense;
}
