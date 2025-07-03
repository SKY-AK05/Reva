'use server';
import { createServerClient } from "@/lib/supabase/server";

export interface ChatMessage {
  id: string;
  user_id: string;
  sender: 'user' | 'bot';
  text: string;
  created_at: string;
}

export async function getChatMessages(): Promise<ChatMessage[]> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("No user found, returning empty messages.");
    return [];
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }

  return data || [];
}

export async function addChatMessage(message: { userId: string, sender: 'user' | 'bot', text: string }): Promise<void> {
    const supabase = createServerClient();
    const { error } = await supabase.from('chat_messages').insert({
        user_id: message.userId,
        sender: message.sender,
        text: message.text,
    });

    if (error) {
        console.error('Error adding chat message:', error);
    }
}

export async function clearChatHistory(): Promise<void> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error("No user found, cannot clear chat history.");
        return;
    }

    const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id);

    if (error) {
        console.error('Error clearing chat history:', error);
    }
}
