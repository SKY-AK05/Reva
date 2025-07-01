'use server';

import { composeNote, type ComposeNoteOutput } from '@/ai/flows/compose-note';

export async function getComposedNote(noteContent: string): Promise<ComposeNoteOutput> {
    if (!noteContent.trim()) {
        throw new Error("Note content cannot be empty.");
    }
    const result = await composeNote({ noteContent });
    return result;
}
