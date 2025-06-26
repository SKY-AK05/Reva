// src/ai/flows/create-task-from-chat.ts
'use server';
/**
 * @fileOverview Creates a task from chat input using AI to extract task description, due date, and priority.
 *
 * - createTaskFromChat - A function that handles task creation from chat input.
 * - CreateTaskFromChatInput - The input type for the createTaskFromChat function.
 * - CreateTaskFromChatOutput - The return type for the createTaskFromChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateTaskFromChatInputSchema = z.object({
  chatInput: z.string().describe('The user input from the chat interface.'),
});
export type CreateTaskFromChatInput = z.infer<typeof CreateTaskFromChatInputSchema>;

const CreateTaskFromChatOutputSchema = z.object({
  taskDescription: z.string().describe('The description of the task.'),
  dueDate: z.string().describe('The due date of the task in ISO format (YYYY-MM-DD).'),
  priority: z.enum(['high', 'medium', 'low']).describe('The priority of the task.'),
});
export type CreateTaskFromChatOutput = z.infer<typeof CreateTaskFromChatOutputSchema>;

export async function createTaskFromChat(input: CreateTaskFromChatInput): Promise<CreateTaskFromChatOutput> {
  return createTaskFromChatFlow(input);
}

const createTaskFromChatPrompt = ai.definePrompt({
  name: 'createTaskFromChatPrompt',
  input: {schema: CreateTaskFromChatInputSchema},
  output: {schema: CreateTaskFromChatOutputSchema},
  prompt: `You are a task management assistant. Extract the task description, due date, and priority from the following user input. If the user did not specify a due date, set it to today.

User Input: {{{chatInput}}}

Ensure that the due date is formatted in ISO format (YYYY-MM-DD).
`,
});

const createTaskFromChatFlow = ai.defineFlow(
  {
    name: 'createTaskFromChatFlow',
    inputSchema: CreateTaskFromChatInputSchema,
    outputSchema: CreateTaskFromChatOutputSchema,
  },
  async input => {
    const {output} = await createTaskFromChatPrompt(input);
    return output!;
  }
);
