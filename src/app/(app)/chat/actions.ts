
"use server";

import { createServerClient } from "@/lib/supabase/server";
import { processCommand, type ProcessCommandOutput } from "@/ai/flows/process-command";
// Chat messages are no longer persisted
// import { addChatMessage } from "@/services/chat";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ToneSchema = z.enum(['Neutral', 'GenZ', 'Sarcastic', 'Poetic']);

export async function processUserChat(
    chatInput: string,
    contextItem: { id: string, type: 'task' | 'reminder' | 'expense' | 'goal' | 'journalEntry' } | null,
    chatHistory: { sender: 'user' | 'bot'; text: string }[],
    tone: z.infer<typeof ToneSchema>
): Promise<ProcessCommandOutput> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { botResponse: "Please log in to continue." };
    }

    // Chat messages are no longer persisted to the database.
    // await addChatMessage({ userId: user.id, sender: 'user', text: chatInput });

    let result: ProcessCommandOutput;
    
    const formattedHistory = chatHistory.map(msg => ({
        role: msg.sender,
        content: msg.text,
    }));

    try {
        result = await processCommand({ 
            chatInput, 
            contextItem: contextItem || undefined,
            chatHistory: formattedHistory,
            tone,
        });

    } catch (e: any) {
        console.error("Error processing command:", e);
        if (e.message && (e.message.includes('API key not valid') || e.message.includes('API key is missing'))) {
            result = { botResponse: "It looks like your Google AI API key is invalid or missing. Please go to your project files, open the `.env` file, and make sure `GOOGLE_API_KEY` is set correctly." };
        } else {
            result = { botResponse: "Sorry, I had a little trouble thinking of a response. Could you try again?" };
        }
    }

    // Chat messages are no longer persisted to the database.
    // await addChatMessage({ userId: user.id, sender: 'bot', text: result.botResponse });

    // Revalidate paths to ensure fresh data on other pages
    const revalidateAll = () => {
        revalidatePath('/tasks');
        revalidatePath('/reminders');
        revalidatePath('/expenses');
        revalidatePath('/goals');
        revalidatePath('/journal');
        revalidatePath('/overview');
    };

    if (result.newItemContext || result.updatedItemType) {
        revalidateAll();
    }

    return result;
}
