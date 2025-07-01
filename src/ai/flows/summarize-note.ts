'use server';
/**
 * @fileOverview An AI flow to summarize unstructured notes and extract key information.
 *
 * - summarizeNote - A function that handles the note summarization process.
 * - SummarizeNoteInput - The input type for the summarizeNote function.
 * - SummarizeNoteOutput - The return type for the summarizeNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNoteInputSchema = z.object({
  noteContent: z.string().describe('The unstructured text content of the note to be summarized.'),
});
export type SummarizeNoteInput = z.infer<typeof SummarizeNoteInputSchema>;

const SummarizeNoteOutputSchema = z.object({
  title: z.string().describe('A concise, descriptive title for the note, based on its content.'),
  summary: z.string().describe('A brief, one to two sentence summary of the entire note.'),
  actionItems: z.array(z.string()).describe('A list of clear, actionable to-do items or tasks mentioned in the note.'),
  keyPoints: z.array(z.string()).describe('A list of the most important points, ideas, or pieces of information from the note.'),
});
export type SummarizeNoteOutput = z.infer<typeof SummarizeNoteOutputSchema>;

export async function summarizeNote(input: SummarizeNoteInput): Promise<SummarizeNoteOutput> {
  return summarizeNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNotePrompt',
  input: {schema: SummarizeNoteInputSchema},
  output: {schema: SummarizeNoteOutputSchema},
  prompt: `You are an intelligent note-processing assistant. Your goal is to analyze unstructured text and extract structured, useful information.

From the user's note content provided below, please perform the following actions:
1.  Generate a short, descriptive title for the note.
2.  Write a concise summary (1-2 sentences) of the note's main theme.
3.  Identify and list all distinct action items or tasks. These should be clear, actionable steps. If there are no action items, return an empty array.
4.  Extract and list the key points, main ideas, or critical information.

Analyze the following note:
---
{{{noteContent}}}
---

Return the structured output.`,
});

const summarizeNoteFlow = ai.defineFlow(
  {
    name: 'summarizeNoteFlow',
    inputSchema: SummarizeNoteInputSchema,
    outputSchema: SummarizeNoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
