'use server';
/**
 * @fileOverview AI agent to track expenses from chat input.
 *
 * - trackExpenseFromChat - A function that handles the expense tracking process.
 * - TrackExpenseFromChatInput - The input type for the trackExpenseFromChat function.
 * - TrackExpenseFromChatOutput - The return type for the trackExpenseFromChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrackExpenseFromChatInputSchema = z.object({
  chatInput: z.string().describe('The user input from the chat.'),
});
export type TrackExpenseFromChatInput = z.infer<typeof TrackExpenseFromChatInputSchema>;

const TrackExpenseFromChatOutputSchema = z.object({
  amount: z.number().optional().describe('The amount of the expense.'),
  category: z.string().optional().describe('The category of the expense.'),
  date: z.string().optional().describe('The date of the expense (YYYY-MM-DD).'),
  needsClarification: z
    .boolean()
    .describe(
      'Whether the AI needs clarification from the user to track the expense completely.'
    ),
  clarificationPrompt: z
    .string()
    .optional()
    .describe('The prompt to ask the user for clarification.'),
});
export type TrackExpenseFromChatOutput = z.infer<typeof TrackExpenseFromChatOutputSchema>;

export async function trackExpenseFromChat(
  input: TrackExpenseFromChatInput
): Promise<TrackExpenseFromChatOutput> {
  return trackExpenseFromChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'trackExpenseFromChatPrompt',
  input: {schema: TrackExpenseFromChatInputSchema},
  output: {schema: TrackExpenseFromChatOutputSchema},
  prompt: `You are a personal finance assistant. Your task is to extract expense information from user chat input.

  The user will provide expense details in natural language. You need to identify the amount, category, and date of the expense. If any of this information is missing, set needsClarification to true and provide a clarificationPrompt to ask the user for the missing information.

  If all information is present, set needsClarification to false and return the extracted information.  Dates should be YYYY-MM-DD format.

  Here's the user input:
  {{chatInput}}`,
});

const trackExpenseFromChatFlow = ai.defineFlow(
  {
    name: 'trackExpenseFromChatFlow',
    inputSchema: TrackExpenseFromChatInputSchema,
    outputSchema: TrackExpenseFromChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
