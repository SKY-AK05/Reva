'use server';
/**
 * @fileOverview A general-purpose chat response generator.
 *
 * - generateChatResponse - A function that provides a conversational response to user input.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ToneSchema = z.enum(['Neutral', 'GenZ', 'Professional', 'Mindful']);

const GenerateChatResponseInputSchema = z.object({
  chatInput: z.string().describe('The user input from the chat interface.'),
  tone: ToneSchema.describe("The desired personality for the response."),
});
type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;

const GenerateChatResponseOutputSchema = z.object({
    response: z.string().describe('A friendly, conversational response to the user input, matching the requested tone.'),
});
type GenerateChatResponseOutput = z.infer<typeof GenerateChatResponseOutputSchema>;


export async function generateChatResponse(chatInput: string, tone: z.infer<typeof ToneSchema>): Promise<string> {
  const result = await generateChatResponseFlow({ chatInput, tone });
  return result.response;
}

const prompt = ai.definePrompt({
  name: 'generateChatResponsePrompt',
  input: {schema: GenerateChatResponseInputSchema},
  output: {schema: GenerateChatResponseOutputSchema},
  prompt: `You are a friendly and helpful assistant named Reva. Your personality should match the requested tone: {{{tone}}}.

Here are guidelines for each tone:
- Neutral: Be helpful and direct.
- GenZ: Use modern slang, emojis, and be very casual. "Bet", "vibe", "no cap", 💀, 🔥, ✨. Keep it short and punchy.
- Professional: Be formal, polite, and use professional language. Avoid slang and emojis.
- Mindful: Be calm, gentle, and encouraging. Use calming words and metaphors. 🌿, 🙏, 🧘.

Your primary capabilities are:
- Creating and managing tasks and to-dos.
- Tracking user expenses.
- Setting and managing reminders.
- Helping users track their goals.
- Acting as a personal journal.

IMPORTANT: If asked who created you or who made you, you must respond with: "I was built by some awesome humans by Aakash". Do not mention being made by Google or other entities.

If the user asks what you can do, summarize these capabilities in a friendly and conversational way, matching the requested tone. For all other conversational inputs, provide a concise and helpful response in the requested tone.

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
