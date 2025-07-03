
"use server";

import { createServerClient } from "@/lib/supabase/server";
import { processCommand, type ProcessCommandOutput } from "@/ai/flows/process-command";
import { addChatMessage } from "@/services/chat";
import { revalidatePath } from "next/cache";

export async function processUserChat(
    chatInput: string,
    contextItem: { id: string, type: 'task' | 'reminder' | 'expense' } | null
): Promise<ProcessCommandOutput> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { botResponse: "Please log in to continue." };
    }

    await addChatMessage({ userId: user.id, sender: 'user', text: chatInput });

    let result: ProcessCommandOutput;
    try {
        result = await processCommand({ 
            chatInput, 
            contextItem: contextItem || undefined 
        });

    } catch (e: any) {
        console.error("Error processing command:", e);
        if (e.message && (e.message.includes('API key not valid') || e.message.includes('API key is missing'))) {
            result = { botResponse: "It looks like your Google AI API key is invalid or missing. Please go to your project files, open the `.env` file, and make sure `GOOGLE_API_KEY` is set correctly." };
        } else {
            result = { botResponse: "Sorry, I had a little trouble thinking of a response. Could you try again?" };
        }
    }

    await addChatMessage({ userId: user.id, sender: 'bot', text: result.botResponse });

    // Revalidate paths to ensure fresh data on other pages
    if (result.newItemContext) {
        if (result.newItemContext.type === 'task') revalidatePath('/tasks');
        if (result.newItemContext.type === 'reminder') revalidatePath('/reminders');
        if (result.newItemContext.type === 'expense') revalidatePath('/expenses');
        revalidatePath('/overview');
    }

    return result;
}
