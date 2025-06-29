"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
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

const ChatInputForm = ({
  input,
  setInput,
  handleSubmit,
  isLoading,
  inputRef,
}: {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}) => (
  // This bar is absolutely positioned at the bottom of the parent container.
  // It has a top shadow to separate it from the content above.
  <div className="absolute bottom-0 left-0 right-0 bg-card p-4 pt-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
    <form onSubmit={handleSubmit} className="relative">
        <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Start a conversation with Reva..."
            // Restyled for a more grounded look.
            className="w-full rounded-xl p-4 pr-14 h-14 bg-background/80 backdrop-blur-sm border-border/50 text-card-foreground text-base shadow-lg transition-transform focus:scale-[1.01]"
            disabled={isLoading}
            autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full h-10 w-10">
            <SendHorizonal className="h-5 w-5" />
            <span className="sr-only">Send</span>
        </Button>
    </form>
  </div>
);

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollViewportRef.current) {
        const viewport = scrollViewportRef.current;
        setTimeout(() => {
            viewport.scrollTop = viewport.scrollHeight;
        }, 0);
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
      setMessages(prev => prev.filter(m => !m.isTyping));
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I encountered an error. Please try again.", sender: 'bot' };
      setMessages(prev => prev.filter(m => !m.isTyping));
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };
  
  const content = (
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
  );

  const welcomeScreen = (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
      <div className="space-y-4 max-w-sm">
        <span className="text-6xl" role="img" aria-label="waving hand">👋</span>
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Reva!</h1>
        <p className="text-muted-foreground text-lg">
          Just start typing to create tasks, track expenses, set reminders, and more.
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full relative notebook-lines-chat">
      {/* The padding-bottom on the scroll area makes space for the fixed input bar */}
      <ScrollArea className="h-full p-6 sm:p-8 lg:p-12 pb-28" viewportRef={scrollViewportRef}>
        {messages.length > 0 ? content : welcomeScreen}
      </ScrollArea>
      <ChatInputForm 
          handleSubmit={handleSubmit}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          inputRef={inputRef}
      />
    </div>
  );
}