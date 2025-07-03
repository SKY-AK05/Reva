'use server';

// Chat is now ephemeral. All database persistence functions have been removed.

export interface ChatMessage {
  id: string;
  user_id: string; // Still here for type consistency, but not used for persistence
  sender: 'user' | 'bot';
  text: string;
  created_at: string;
}
