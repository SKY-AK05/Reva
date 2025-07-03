
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SendHorizonal, Bot } from 'lucide-react';
import { processUserChat } from '@/app/(app)/chat/actions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '@/services/chat';
import { useChatContext } from '@/context/chat-context';

const quickStartSuggestions = [
  "Add task: Finish the Q4 report by Friday",
  "Track expense: 500 for coffee today",
  "Remind me to call John tomorrow at 10am",
  "What are some tips for staying productive?",
];

export default function ChatInterface() {
  const { messages, setMessages, loading: isFetchingHistory } = useChatContext();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFetchingHistory) {
      inputRef.current?.focus();
    }
  }, [isFetchingHistory]);

  useEffect(() => {
    scrollViewportRef.current?.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: messageText,
      created_at: new Date().toISOString(),
      user_id: '',
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponseText = await processUserChat(messageText);
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: botResponseText,
        created_at: new Date().toISOString(),
        user_id: '',
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: 'bot',
        created_at: new Date().toISOString(),
        user_id: '',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(input);
  }

  const welcomeScreen = (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
      <div className="space-y-4 max-w-2xl w-full">
        <Bot className="w-16 h-16 mx-auto text-primary" />
        <h1 className="text-4xl font-headline font-bold tracking-tight">How can I help you today?</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-8">
          {quickStartSuggestions.map((suggestion, i) => (
             <Button
              key={i}
              variant="outline"
              className="w-full h-auto justify-start text-left font-normal p-4 whitespace-normal"
              onClick={() => handleSendMessage(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col h-full">
      <ScrollArea className="flex-1 p-6 sm:p-8 lg:p-12 notebook-lines-chat" viewportRef={scrollViewportRef}>
        {messages.length > 0 ? (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('w-full flex', {
                  'justify-end': message.sender === 'user',
                  'items-start gap-3': message.sender === 'bot',
                })}
              >
                {message.sender === 'user' ? (
                  <div className="max-w-xl p-4 rounded-2xl bg-primary text-primary-foreground">
                    <div className="leading-relaxed text-base">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-1">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 prose dark:prose-invert leading-relaxed text-base pt-1">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                    </div>
                  </>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="w-full flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-1">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center space-x-1 pt-3">
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>
        ) : (
          !isFetchingHistory && welcomeScreen
        )}
      </ScrollArea>
      
      <div className="p-4 bg-card border-t">
        <div className="w-full max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
              <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Start a conversation with Reva..."
                  className="w-full rounded-xl p-4 pr-14 h-14 bg-background text-base border-border/50 focus:border-primary transition-colors"
                  disabled={isLoading || isFetchingHistory}
                  autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={isLoading || isFetchingHistory || !input.trim()} className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full h-10 w-10 bg-primary hover:bg-primary/90">
                  <SendHorizonal className="h-5 w-5" />
                  <span className="sr-only">Send</span>
              </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
