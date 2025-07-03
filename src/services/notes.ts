// src/services/notes.ts
'use server';
import { createServerClient } from "@/lib/supabase/server";
import type { Note } from "@/context/notes-context";

export async function getNotes(): Promise<Note[]> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notes')
    .select('id, title, content, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
  
  return (data || []).map(note => ({
    id: note.id,
    title: note.title,
    content: note.content || '', // Ensure content is always a string
    createdAt: note.created_at,
  }));
}

export async function addNote(note: Omit<Note, 'id' | 'createdAt'> & { userId: string }): Promise<Note | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('notes')
        .insert({
            user_id: note.userId,
            title: note.title,
            content: note.content,
        })
        .select('id, title, content, created_at')
        .single();
    
    if (error) {
        console.error('Error adding note:', error);
        return null;
    }
    return {
        id: data.id,
        title: data.title,
        content: data.content || '',
        createdAt: data.created_at,
    };
}


export async function updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select('id, title, content, created_at')
        .single();

    if (error) {
        console.error('Error updating note:', error);
        return null;
    }
    return {
        id: data.id,
        title: data.title,
        content: data.content || '',
        createdAt: data.created_at,
    };
}

export async function deleteNote(id: string): Promise<{ id: string } | null> {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .select('id')
        .single();
    
    if (error) {
        console.error('Error deleting note:', error);
        return null;
    }

    return data ? { id: data.id } : null;
}
