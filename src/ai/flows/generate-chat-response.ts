'use server';
/**
 * @fileOverview A general-purpose chat response generator.
 *
 * - generateChatResponse - A function that provides a conversational response to user input.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChatResponseInputSchema = z.object({
  chatInput: z.string().describe('The user input from the chat interface.'),
});
type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;

const GenerateChatResponseOutputSchema = z.object({
    response: z.string().describe('A friendly, conversational response to the user input.'),
});
type GenerateChatResponseOutput = z.infer<typeof GenerateChatResponseOutputSchema>;


export async function generateChatResponse(chatInput: string): Promise<string> {
  const result = await generateChatResponseFlow({ chatInput });
  return result.response;
}

const prompt = ai.definePrompt({
  name: 'generateChatResponsePrompt',
  input: {schema: GenerateChatResponseInputSchema},
  output: {schema: GenerateChatResponseOutputSchema},
  prompt: `You are a friendly and helpful assistant named Reva. Your personality is cheerful and encouraging.

Your primary capabilities are:
- Creating and managing tasks and to-dos.
- Tracking user expenses.
- Setting and managing reminders.
- Helping users track their goals.
- Acting as a personal journal.

If the user asks what you can do, summarize these capabilities in a friendly and conversational way. For all other conversational inputs, provide a concise and helpful response.

User Input: {{{chatInput}}}`,
});

const generateChatResponseFlow = ai.defineFlow(
  {
    name: 'generateChatResponseFlow',
    inputSchema: GenerateChatResponseInputSchema,
    outputSchema: GenerateChatResponseOutputSchema,
  },
  async (input): Promise<GenerateChatResponseOutput> => {
    const {output} = await prompt(input);
    return output!;
  }
);
