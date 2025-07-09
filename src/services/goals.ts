// src/services/goals.ts
'use server';
import { createServerClient } from "@/lib/supabase/server";
import type { Goal } from "@/context/goals-context";

export async function getGoals(): Promise<Goal[]> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
  return data as Goal[];
}

export async function addGoal(goal: Omit<Goal, 'id'> & { userId: string }): Promise<Goal | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('goals')
        .insert({
            user_id: goal.userId,
            title: goal.title,
            description: goal.description,
            progress: goal.progress,
            status: goal.status
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error adding goal:', error);
        return null;
    }
    return data as Goal;
}

export async function updateGoal(id: string, updates: Partial<Omit<Goal, 'id'>>): Promise<Goal | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating goal:', error);
        return null;
    }
    return data as Goal;
}

export async function deleteGoal(id: string): Promise<{ id: string } | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .select('id')
        .single();
    
    if (error) {
        console.error('Error deleting goal:', error);
        return null;
    }

    return data ? { id: data.id } : null;
}
