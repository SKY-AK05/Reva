'use server';

// Chat is now ephemeral. All database persistence functions have been removed.
import type { Goal } from '@/context/goals-context';

export interface ChatMessage {
  id: string;
  user_id: string; // Still here for type consistency, but not used for persistence
  sender: 'user' | 'bot';
  text: string;
  created_at: string;
  goal?: Goal;
  actionIcon?: 'task' | 'reminder' | 'expense' | 'goal' | 'journalEntry';
}
