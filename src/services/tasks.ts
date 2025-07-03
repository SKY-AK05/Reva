// src/services/tasks.ts
'use server';
import { createServerClient } from "@/lib/supabase/server";
import type { Task } from "@/context/tasks-context";

export async function getTasks(): Promise<Task[]> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return data.map(t => ({...t, dueDate: t.due_date})) as Task[];
}

export async function addTask(task: Partial<Omit<Task, 'id' | 'completed'>> & { userId: string, description: string }): Promise<Task | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('tasks')
        .insert({
            user_id: task.userId,
            description: task.description,
            due_date: task.dueDate,
            priority: task.priority,
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error adding task:', error);
        return null;
    }
    return {...data, dueDate: data.due_date } as Task;
}


export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'completed'>>): Promise<Task | null> {
    const supabase = createServerClient();
    // Supabase uses snake_case for column names
    const updatesForDb: {[key: string]: any} = {};
    if (updates.description) updatesForDb.description = updates.description;
    if (updates.dueDate) updatesForDb.due_date = updates.dueDate;
    if (updates.priority) updatesForDb.priority = updates.priority;


    const { data, error } = await supabase
        .from('tasks')
        .update(updatesForDb)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating task:', error);
        return null;
    }
    return {...data, dueDate: data.due_date } as Task;
}

export async function toggleTask(id: string, completed: boolean): Promise<Task | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error toggling task:', error);
        return null;
    }
    return {...data, dueDate: data.due_date } as Task;
}
