'use server';

import { summarizeNote, type SummarizeNoteOutput } from '@/ai/flows/summarize-note';

export async function getNoteSummary(noteContent: string): Promise<SummarizeNoteOutput> {
    if (!noteContent.trim()) {
        throw new Error("Note content cannot be empty.");
    }
    const result = await summarizeNote({ noteContent });
    return result;
}
