"use client";

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SendHorizonal, Bot } from 'lucide-react';
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

  useEffect(() => {
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
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
      setMessages(prev => prev.filter(m => !m.isTyping)); // remove typing indicator
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I encountered an error. Please try again.", sender: 'bot' };
      setMessages(prev => prev.filter(m => !m.isTyping));
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full rounded-lg border bg-card">
      <ScrollArea className="flex-1 p-4">
        <div className="h-full" ref={scrollViewportRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex items-start gap-3', {
                  'justify-end flex-row-reverse': message.sender === 'user',
                })}
              >
                <Avatar className="h-8 w-8 border">
                   {message.sender === 'bot' ? (
                     <AvatarFallback>
                        <Bot className="h-5 w-5 text-primary"/>
                    </AvatarFallback>
                   ) : (
                    <>
                      <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                      <AvatarFallback>U</AvatarFallback>
                    </>
                   )}
                </Avatar>
                <div
                  className={cn('max-w-sm sm:max-w-md rounded-lg p-3 text-sm shadow-sm', {
                    'bg-primary text-primary-foreground': message.sender === 'user',
                    'bg-muted': message.sender === 'bot',
                  })}
                >
                  {message.isTyping ? (
                     <div className="flex items-center space-x-1 py-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.3s]"></span>
                          <span className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.15s]"></span>
                          <span className="h-2 w-2 animate-bounce rounded-full bg-foreground"></span>
                      </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
      <div className="border-t bg-card p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what you’d like to do…"
            className="flex-1"
            disabled={isLoading}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <SendHorizonal className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
