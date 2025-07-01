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
  noteContent: z.string().describe('The raw, unstructured text or HTML content of the note to be composed.'),
});
export type ComposeNoteInput = z.infer<typeof ComposeNoteInputSchema>;

const ComposeNoteOutputSchema = z.object({
  title: z.string().describe('A concise, descriptive title for the note, based on its content.'),
  composedContent: z.string().describe('The polished, organized, and HTML-formatted version of the original note.'),
});
export type ComposeNoteOutput = z.infer<typeof ComposeNoteOutputSchema>;

export async function composeNote(input: ComposeNoteInput): Promise<ComposeNoteOutput> {
  return composeNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'composeNotePrompt',
  input: {schema: ComposeNoteInputSchema},
  output: {schema: ComposeNoteOutputSchema},
  prompt: `You are an intelligent writing assistant. Your task is to take raw, potentially messy HTML or plain text and transform it into clean, well-structured HTML.

Your primary goal is to improve clarity and organization while preserving the user's original intent. Follow these instructions:
1.  **Generate a Title:** Create a short, descriptive title for the note.
2.  **Reformat the Content:**
    - Rephrase ideas into clearer sentences.
    - Break long paragraphs into lists.
    - Identify tasks and format them as an unordered list (e.g., \`<ul><li>...</li></ul>\`).
    - Identify goals or deadlines and highlight them, perhaps using \`<strong>\` tags.
    - Correct grammar and spelling mistakes.
    - Use HTML tags for all formatting (e.g., \`<h1>\`, \`<h2>\`, \`<strong>\`, \`<em>\`, \`<ul>\`, \`<ol>\`, \`<li>\`). Do NOT use Markdown.

Analyze the following content. It might be plain text or HTML.
---
{{{noteContent}}}
---

Return the structured output with a new title and the composed, HTML-formatted content.`,
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
