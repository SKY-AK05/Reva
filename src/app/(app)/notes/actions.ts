'use server';

import { composeNote, type ComposeNoteOutput } from '@/ai/flows/compose-note';
import { generateChartFromText, type GenerateChartFromTextOutput } from '@/ai/flows/generate-chart-from-text';
import { createServerClient } from '@/lib/supabase/server';

export async function getComposedNote(noteContent: string): Promise<ComposeNoteOutput> {
    if (!noteContent.trim()) {
        throw new Error("Note content cannot be empty.");
    }
    const result = await composeNote({ noteContent });
    return result;
}

export async function getChartDataFromText(selectedText: string): Promise<GenerateChartFromTextOutput> {
    if (!selectedText.trim()) {
        throw new Error("Selected text cannot be empty.");
    }
    const result = await generateChartFromText({ selectedText });
    return result;
}

export async function uploadImage(formData: FormData): Promise<string | null> {
  const file = formData.get('image') as File;
  if (!file) return null;

  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`; 

  const { error: uploadError } = await supabase.storage
    .from('notes-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return null;
  }

  const { data } = supabase.storage.from('notes-images').getPublicUrl(filePath);
  return data.publicUrl;
}
