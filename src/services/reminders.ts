// src/services/reminders.ts
'use server';
import { createServerClient } from "@/lib/supabase/server";
import type { Reminder } from "@/context/reminders-context";

export async function getReminders(): Promise<Reminder[]> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .order('time', { ascending: true });

  if (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }
  return data as Reminder[];
}

export async function addReminder(reminder: Omit<Reminder, 'id'> & { userId: string }): Promise<Reminder | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('reminders')
        .insert({
            user_id: reminder.userId,
            title: reminder.title,
            notes: reminder.notes,
            time: reminder.time,
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error adding reminder:', error);
        return null;
    }
    return data as Reminder;
}

export async function updateReminder(id: string, updates: Partial<Omit<Reminder, 'id'>>): Promise<Reminder | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating reminder:', error);
        return null;
    }
    return data as Reminder;
}
