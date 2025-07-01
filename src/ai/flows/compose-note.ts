'use server';
/**
 * @fileOverview An AI flow to compose and structure raw notes.
 *
 * - composeNote - A function that handles the note composition process.
 * - ComposeNoteInput - The input type for the composeNote function.
 * - ComposeNoteOutput - The return type for the composeNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComposeNoteInputSchema = z.object({
  noteContent: z.string().describe('The raw, unstructured text content of the note to be composed.'),
});
export type ComposeNoteInput = z.infer<typeof ComposeNoteInputSchema>;

const ComposeNoteOutputSchema = z.object({
  title: z.string().describe('A concise, descriptive title for the note, based on its content.'),
  composedContent: z.string().describe('The polished, organized, and markdown-formatted version of the original note.'),
});
export type ComposeNoteOutput = z.infer<typeof ComposeNoteOutputSchema>;

export async function composeNote(input: ComposeNoteInput): Promise<ComposeNoteOutput> {
  return composeNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'composeNotePrompt',
  input: {schema: ComposeNoteInputSchema},
  output: {schema: ComposeNoteOutputSchema},
  prompt: `You are an intelligent writing assistant. Your task is to take raw, unstructured text and transform it into a clean, organized, and well-structured version.

Your primary goal is to improve clarity and organization while preserving the user's original intent. Follow these instructions:
1.  **Generate a Title:** Create a short, descriptive title for the note.
2.  **Reformat the Content:**
    - Rephrase ideas into clearer sentences.
    - Break long paragraphs into lists, bullet points, or numbered lists where appropriate.
    - Identify tasks and format them as a markdown checklist (e.g., \`- [ ] Finish UI\`).
    - Identify goals or deadlines and highlight them, perhaps with an emoji (e.g., 🗓️ Goal: ...).
    - Correct grammar and spelling mistakes.
    - Use Markdown for all formatting (headings, bold, italics, lists, etc.).

Analyze the following raw note:
---
{{{noteContent}}}
---

Return the structured output with a new title and the composed, markdown-formatted content.`,
});

const composeNoteFlow = ai.defineFlow(
  {
    name: 'composeNoteFlow',
    inputSchema: ComposeNoteInputSchema,
    outputSchema: ComposeNoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
