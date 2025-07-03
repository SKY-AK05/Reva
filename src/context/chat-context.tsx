'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getChatMessages, clearChatHistory as clearChatHistoryInDb, type ChatMessage } from '@/services/chat';

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  clearChat: () => Promise<void>;
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const fetchedMessages = await getChatMessages();
      setMessages(fetchedMessages);
      setLoading(false);
    };
    fetchMessages();
  }, []);

  const handleClearChat = useCallback(async () => {
    // Optimistically clear the UI
    setMessages([]);
    // Then clear the database
    await clearChatHistoryInDb();
  }, []);

  const value = {
    messages,
    setMessages,
    clearChat: handleClearChat,
    loading,
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
