"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SendHorizonal } from 'lucide-react';
import { processUserChat } from '@/app/(app)/chat/actions';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isTyping?: boolean;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Focus the input field on initial load and when loading completes
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Automatically scroll to the bottom whenever messages are updated
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setMessages(prev => [...prev, { id: 'typing', text: '', sender: 'bot', isTyping: true }]);

    try {
      const botResponseText = await processUserChat(input);
      const botMessage: Message = { id: (Date.now() + 1).toString(), text: botResponseText, sender: 'bot' };
      setMessages(prev => [...prev.filter(m => !m.isTyping), botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I encountered an error. Please try again.", sender: 'bot' };
      setMessages(prev => [...prev.filter(m => !m.isTyping), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const content = (
    <>
      <div className="space-y-8">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('w-full flex', {
              'justify-end': message.sender === 'user',
              'justify-start': message.sender === 'bot',
            })}
          >
            <div className="max-w-xl">
              {message.isTyping ? (
                 <div className="flex items-center space-x-1 py-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-foreground"></span>
                  </div>
              ) : (
                <p className="whitespace-pre-wrap leading-8 text-base text-foreground/90">{message.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div ref={messagesEndRef} />
    </>
  );

  const welcomeScreen = (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
      <div className="space-y-4 max-w-sm">
        <span className="text-6xl" role="img" aria-label="waving hand">👋</span>
        <h1 className="text-4xl font-headline font-bold tracking-tight">Welcome to Reva!</h1>
        <p className="text-muted-foreground">
          Just start typing to create tasks, track expenses, set reminders, and more.
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
       <ScrollArea className="flex-1 p-6 sm:p-8 lg:p-12 notebook-lines-chat" viewportRef={scrollViewportRef}>
        {messages.length > 0 ? content : welcomeScreen}
      </ScrollArea>
      
      <div className="p-4 bg-card">
        <div className="w-full max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
              <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Start a conversation with Reva..."
                  className="w-full rounded-xl p-4 pr-14 h-14 bg-background text-base border-border/50 focus:border-primary transition-colors"
                  disabled={isLoading}
                  autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full h-10 w-10 bg-primary hover:bg-primary/90">
                  <SendHorizonal className="h-5 w-5" />
                  <span className="sr-only">Send</span>
              </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
