"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SendHorizonal, Bot, PencilRuler, CreditCard, CalendarClock, Trophy, BookText } from 'lucide-react';
import { processUserChat } from '@/app/(app)/chat/actions';
import RevaLogo from '@/components/reva-logo';

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
  <div className="w-full max-w-2xl mx-auto px-4">
    <form onSubmit={handleSubmit} className="relative">
      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Start writing or tell me what to do..."
        className="w-full rounded-full p-4 pr-14 h-14 bg-card border-border/50 text-card-foreground text-base"
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

export default function ChatInterface({ isPublic = false }: { isPublic?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    if (!input.trim()) return;

    if (isPublic) {
      router.push('/login');
      return;
    }

    if (isLoading) return;

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
    inputRef.current?.focus();
  };

  const content = messages.length === 0 ? (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6 text-center">
          <div className="mx-auto inline-block">
            <RevaLogo size="lg" />
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            <Button variant="outline" className="rounded-full" onClick={() => handleSuggestionClick('Create a task to buy groceries')}>
                <PencilRuler className="mr-2 h-4 w-4" /> Create Task
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => handleSuggestionClick('I spent $12 on lunch')}>
                <CreditCard className="mr-2 h-4 w-4" /> Track Expense
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => handleSuggestionClick('Remind me to call mom tomorrow at 10am')}>
                <CalendarClock className="mr-2 h-4 w-4" /> Set Reminder
            </Button>
          </div>
        </div>
      </div>
  ) : (
    <div className="space-y-8 max-w-2xl mx-auto px-4 py-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn('flex items-start gap-4', {
            'justify-end': message.sender === 'user',
          })}
        >
          <Avatar className={cn("h-8 w-8 border", {'order-last': message.sender === 'user'})}>
             {message.sender === 'bot' ? (
               <AvatarFallback>
                  <Bot className="h-5 w-5 text-muted-foreground"/>
              </AvatarFallback>
             ) : (
              <>
                <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                <AvatarFallback>U</AvatarFallback>
              </>
             )}
          </Avatar>
          <div className="max-w-sm sm:max-w-md">
            {message.isTyping ? (
               <div className="flex items-center space-x-1 py-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground"></span>
                </div>
            ) : (
              <p className="whitespace-pre-wrap leading-9 text-base text-foreground/90">{message.text}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      <ScrollArea className="flex-1 notebook-lines-chat" viewportRef={scrollViewportRef}>
        {content}
      </ScrollArea>
      <div className="py-4 border-t border-border/50">
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
