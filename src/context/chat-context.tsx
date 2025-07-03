'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { ChatMessage } from '@/services/chat';

type ItemContext = { id: string; type: 'task' | 'reminder' | 'expense' };

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  clearChat: () => void;
  loading: boolean;
  lastItemContext: ItemContext | null;
  setLastItemContext: React.Dispatch<React.SetStateAction<ItemContext | null>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false); // Chat history is no longer loaded
  const [lastItemContext, setLastItemContext] = useState<ItemContext | null>(null);

  // Chat history is now ephemeral and does not persist across reloads.
  // The useEffect to fetch messages has been removed.

  const handleClearChat = useCallback(() => {
    // Clear local UI state only
    setMessages([]);
    setLastItemContext(null);
  }, []);

  const value = {
    messages,
    setMessages,
    clearChat: handleClearChat,
    loading,
    lastItemContext,
    setLastItemContext,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatContextProvider');
  }
  return context;
};
