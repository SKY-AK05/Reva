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

const PromptInputSchema = TrackExpenseFromChatInputSchema.extend({
    currentDate: z.string(),
});

const ExpenseItemSchema = z.object({
    description: z.string().describe("The description or name of the expense item."),
    amount: z.number().describe("The amount of the expense item."),
    category: z.string().optional().describe("The category of the expense (e.g., Food, Travel). If not specified, infer a likely category."),
});

const TrackExpenseFromChatOutputSchema = z.object({
  expenses: z.array(ExpenseItemSchema).describe("A list of all expenses identified in the user's input."),
  date: z.string().optional().describe('The date for all expenses, if specified (YYYY-MM-DD). If not specified, use today.'),
  currency: z.string().optional().describe("The currency of the expenses (e.g., USD, EUR, rupees)."),
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
  input: {schema: PromptInputSchema},
  output: {schema: TrackExpenseFromChatOutputSchema},
  prompt: `You are a personal finance assistant. Your task is to extract one or more expense items from user chat input.

The user may provide multiple expense details in a single message. You need to identify each individual item, its amount, and category.

- The current date is {{{currentDate}}}.
- If a date is mentioned (e.g. "today", "yesterday", "Oct 23"), apply it to all expenses and format it as YYYY-MM-DD. If not, default to today's date: {{{currentDate}}}.
- If a currency is mentioned (e.g., dollars, rupees, €, $), identify and return it in the currency field.
- For each item, infer a likely category (e.g., Food, Drink, Transport, Entertainment).
- If any crucial information for an item is missing (like the amount for a specified item), set needsClarification to true and provide a clarificationPrompt asking for the missing details.
- If all information is present, set needsClarification to false and return the extracted information as a list of expense objects in the 'expenses' array.

Here's the user input:
{{{chatInput}}}`,
});

const trackExpenseFromChatFlow = ai.defineFlow(
  {
    name: 'trackExpenseFromChatFlow',
    inputSchema: TrackExpenseFromChatInputSchema,
    outputSchema: TrackExpenseFromChatOutputSchema,
  },
  async input => {
    const {output} = await prompt({
        ...input,
        currentDate: new Date().toISOString().split('T')[0]
    });
    return output!;
  }
);
