// src/services/journal.ts
'use server';
import { createServerClient } from "@/lib/supabase/server";
import type { JournalEntry } from "@/context/journal-context";

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }
  return data as JournalEntry[];
}

export async function addJournalEntry(entry: Omit<JournalEntry, 'id'> & { userId: string }): Promise<JournalEntry | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('journal_entries')
        .insert({
            user_id: entry.userId,
            title: entry.title,
            content: entry.content,
            date: entry.date,
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error adding journal entry:', error);
        return null;
    }
    return data as JournalEntry;
}

export async function updateJournalEntry(id: string, updates: Partial<Omit<JournalEntry, 'id'>>): Promise<JournalEntry | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating journal entry:', error);
        return null;
    }
    return data as JournalEntry;
}

export async function deleteJournalEntry(id: string): Promise<{ id: string } | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .select('id')
        .single();
    
    if (error) {
        console.error('Error deleting journal entry:', error);
        return null;
    }

    return data ? { id: data.id } : null;
}
