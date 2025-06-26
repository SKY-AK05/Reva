"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SendHorizonal, Bot, PencilRuler, CreditCard, CalendarClock, Trophy } from 'lucide-react';
import { processUserChat } from '@/app/(app)/chat/actions';
import RevaLogo from '@/components/reva-logo';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isTyping?: boolean;
};

// Moved ChatInputForm outside of the ChatInterface component
// to prevent it from being redeclared on every render.
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
  <div className="w-full max-w-2xl mx-auto px-4">
    <form onSubmit={handleSubmit} className="relative">
      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Tell me what you’d like to do…"
        className="w-full rounded-full p-4 pr-14 h-14 bg-card border-border text-card-foreground"
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
        // Use timeout to ensure scrolling happens after the new message is rendered and sized.
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
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Focus the input after setting the suggestion
    inputRef.current?.focus();
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-4">
            <div className="text-center space-y-2">
                <div className="inline-block p-4 bg-sidebar rounded-full">
                    <RevaLogo size="md" />
                </div>
                <h2 className="text-2xl font-semibold">How can I help you today?</h2>
            </div>
        </div>
        <div className="pb-8">
             <div className="flex justify-center gap-2 flex-wrap mb-4 px-4">
                <Button variant="outline" className="rounded-full" onClick={() => handleSuggestionClick('Create a task to buy groceries')}>
                    <PencilRuler className="mr-2 h-4 w-4" /> Create Task
                </Button>
                 <Button variant="outline" className="rounded-full" onClick={() => handleSuggestionClick('I spent $12 on lunch')}>
                    <CreditCard className="mr-2 h-4 w-4" /> Track Expense
                </Button>
                 <Button variant="outline" className="rounded-full" onClick={() => handleSuggestionClick('What are my upcoming reminders?')}>
                    <CalendarClock className="mr-2 h-4 w-4" /> Reminders
                </Button>
                 <Button variant="outline" className="rounded-full" onClick={() => handleSuggestionClick('Show me my goals')}>
                    <Trophy className="mr-2 h-4 w-4" /> Goals
                </Button>
            </div>
            <ChatInputForm 
              handleSubmit={handleSubmit}
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              inputRef={inputRef}
            />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1" viewportRef={scrollViewportRef}>
        <div className="py-6">
          <div className="space-y-6 max-w-2xl mx-auto px-4">
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
      <div className="py-4 border-t border-border">
        <ChatInputForm 
            handleSubmit={handleSubmit}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            inputRef={inputRef}
        />
      </div>
    </div>
  );
}
