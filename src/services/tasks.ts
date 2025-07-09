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
    .select('id, description, due_date, priority, completed')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  
  return (data || []).map(task => ({
    id: task.id,
    description: task.description,
    dueDate: task.due_date,
    priority: task.priority,
    completed: task.completed,
  }));
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
        .select('id, description, due_date, priority, completed')
        .single();
    
    if (error) {
        console.error('Error adding task:', error);
        return null;
    }
    return {
        id: data.id,
        description: data.description,
        dueDate: data.due_date,
        priority: data.priority,
        completed: data.completed,
    };
}


export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'completed'>>): Promise<Task | null> {
    const supabase = createServerClient();
    const updatesForDb: {[key: string]: any} = {};
    if (updates.description !== undefined) updatesForDb.description = updates.description;
    if (updates.dueDate !== undefined) updatesForDb.due_date = updates.dueDate;
    if (updates.priority !== undefined) updatesForDb.priority = updates.priority;


    const { data, error } = await supabase
        .from('tasks')
        .update(updatesForDb)
        .eq('id', id)
        .select('id, description, due_date, priority, completed')
        .single();

    if (error) {
        console.error('Error updating task:', error);
        return null;
    }
    return {
        id: data.id,
        description: data.description,
        dueDate: data.due_date,
        priority: data.priority,
        completed: data.completed,
    };
}

export async function toggleTask(id: string, completed: boolean): Promise<Task | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', id)
        .select('id, description, due_date, priority, completed')
        .single();

    if (error) {
        console.error('Error toggling task:', error);
        return null;
    }
    return {
        id: data.id,
        description: data.description,
        dueDate: data.due_date,
        priority: data.priority,
        completed: data.completed,
    };
}

export async function deleteTask(id: string): Promise<{ id: string } | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .select('id')
        .single();
    
    if (error) {
        console.error('Error deleting task:', error);
        return null;
    }

    return data ? { id: data.id } : null;
}
