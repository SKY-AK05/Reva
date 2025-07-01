'use server';

import { composeNote, type ComposeNoteOutput } from '@/ai/flows/compose-note';
import { generateChartFromText, type GenerateChartFromTextOutput } from '@/ai/flows/generate-chart-from-text';

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
