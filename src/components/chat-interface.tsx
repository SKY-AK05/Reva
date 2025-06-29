
"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SendHorizonal, CheckSquare, DollarSign, Bell, Target } from 'lucide-react';
import { processUserChat } from '@/app/(app)/chat/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isTyping?: boolean;
};

const quickStartCards = [
  { title: 'Tasks', value: '12', icon: CheckSquare, colorClass: 'text-chart-1' },
  { title: 'Expenses', value: '$258.50', icon: DollarSign, colorClass: 'text-chart-2' },
  { title: 'Reminders', value: '3 Upcoming', icon: Bell, colorClass: 'text-chart-3' },
  { title: 'Goals', value: '5 in Progress', icon: Target, colorClass: 'text-chart-4' },
];

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
      
      // Remove the "..." typing indicator
      setMessages(prev => prev.filter(m => !m.isTyping));

      // Add an empty message shell for the bot's response
      const botMessageId = (Date.now() + 1).toString();
      const newBotMessage: Message = { id: botMessageId, text: '', sender: 'bot' };
      setMessages(prev => [...prev, newBotMessage]);

      // Start the typing animation
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < botResponseText.length) {
          // Update the bot message with the next character
          setMessages(currentMessages =>
            currentMessages.map(msg =>
              msg.id === botMessageId
                ? { ...msg, text: botResponseText.slice(0, i + 1) }
                : msg
            )
          );
          i++;
        } else {
          // When typing is complete, clear the interval and allow new input
          clearInterval(typingInterval);
          setIsLoading(false);
        }
      }, 25); // Typing speed in milliseconds per character
      
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I encountered an error. Please try again.", sender: 'bot' };
      setMessages(prev => [...prev.filter(m => !m.isTyping), errorMessage]);
      setIsLoading(false);
    }
  };
  
  const content = (
    <>
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('w-full flex', {
              'justify-end': message.sender === 'user',
              'justify-start': message.sender === 'bot',
            })}
          >
            <div
              className={cn(
                "max-w-xl",
                message.sender === 'user' && "p-4 rounded-2xl bg-primary text-primary-foreground",
                message.isTyping && "p-4 rounded-2xl bg-muted"
              )}
            >
              {message.isTyping ? (
                 <div className="flex items-center space-x-1 py-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-foreground"></span>
                  </div>
              ) : message.sender === 'bot' ? (
                 <div className="prose dark:prose-invert leading-relaxed text-base">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                 </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed text-base">{message.text}</p>
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
      <div className="space-y-4 max-w-2xl w-full">
        <span className="text-6xl" role="img" aria-label="waving hand">👋</span>
        <h1 className="text-4xl font-headline font-bold tracking-tight">Welcome to Reva!</h1>
        <p className="text-muted-foreground">
          Just start typing to create tasks, track expenses, set reminders, and more.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 text-left">
          {quickStartCards.map((card) => (
            <Card key={card.title} className="bg-secondary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.colorClass}`} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col h-full">
      {messages.length > 0 ? (
        <ScrollArea className="flex-1 p-6 sm:p-8 lg:p-12 notebook-lines-chat" viewportRef={scrollViewportRef}>
          {content}
        </ScrollArea>
      ) : (
        <div className="flex-1 p-6 sm:p-8 lg:p-12 notebook-lines-chat">
          {welcomeScreen}
        </div>
      )}
      
      <div className="p-4 bg-card border-t">
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
