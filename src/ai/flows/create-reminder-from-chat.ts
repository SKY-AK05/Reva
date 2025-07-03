// src/ai/flows/create-reminder-from-chat.ts
'use server';
/**
 * @fileOverview Creates a reminder from chat input using AI to extract the description and time.
 *
 * - createReminderFromChat - A function that handles reminder creation from chat input.
 * - CreateReminderFromChatInput - The input type for the createReminderFromChat function.
 * - CreateReminderFromChatOutput - The return type for the createReminderFromChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateReminderFromChatInputSchema = z.object({
  chatInput: z.string().describe('The user input from the chat interface.'),
});
export type CreateReminderFromChatInput = z.infer<typeof CreateReminderFromChatInputSchema>;

const PromptInputSchema = CreateReminderFromChatInputSchema.extend({
  currentDate: z.string(),
});

const CreateReminderFromChatOutputSchema = z.object({
  reminderDescription: z.string().describe('The description of what to be reminded of.'),
  remindAt: z.string().describe('The date and time for the reminder in full ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).'),
});
export type CreateReminderFromChatOutput = z.infer<typeof CreateReminderFromChatOutputSchema>;

export async function createReminderFromChat(input: CreateReminderFromChatInput): Promise<CreateReminderFromChatOutput> {
  return createReminderFromChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createReminderFromChatPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: CreateReminderFromChatOutputSchema},
  prompt: `You are a reminder assistant. Extract the reminder description and the exact date and time from the following user input.

- If the user provides a relative time (e.g., "in 5 minutes", "tomorrow at 3pm"), calculate the absolute ISO 8601 timestamp.
- If the user does not specify a time, default to 9:00 AM on the specified day. If no day is specified, default to tomorrow at 9:00 AM.
- The current date and time for reference is {{{currentDate}}}.

User Input: {{{chatInput}}}

Ensure that the remindAt field is a full ISO 8601 timestamp (YYYY-MM-DDTHH:mm:ss.sssZ).
`,
});

const createReminderFromChatFlow = ai.defineFlow(
  {
    name: 'createReminderFromChatFlow',
    inputSchema: CreateReminderFromChatInputSchema,
    outputSchema: CreateReminderFromChatOutputSchema,
  },
  async input => {
    const {output} = await prompt({
        ...input,
        currentDate: new Date().toISOString(),
    });
    return output!;
  }
);
