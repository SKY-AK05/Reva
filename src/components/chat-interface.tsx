
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SendHorizonal, Bot, CheckSquare, DollarSign, Bell, Target } from 'lucide-react';
import { processUserChat } from '@/app/(app)/chat/actions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '@/services/chat';
import { useChatContext } from '@/context/chat-context';
import { useTasksContext } from '@/context/tasks-context';
import { useExpensesContext } from '@/context/expenses-context';
import { useRemindersContext } from '@/context/reminders-context';
import { useGoalsContext } from '@/context/goals-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BotTypingMessage from './bot-typing-message';

export default function ChatInterface() {
  const { messages, setMessages, lastItemContext, setLastItemContext, loading: isFetchingHistory } = useChatContext();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { tasks } = useTasksContext();
  const { expenses } = useExpensesContext();
  const { reminders } = useRemindersContext();
  const { goals } = useGoalsContext();

  const totalTasks = tasks.filter(t => !t.completed).length;
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const upcomingReminders = reminders.length;
  const goalsInProgress = goals.filter(g => g.progress < 100).length;

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
      const result = await processUserChat(messageText, lastItemContext);
      
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: result.botResponse,
        created_at: new Date().toISOString(),
        user_id: '',
      };
      setMessages(prev => [...prev, botMessage]);

      // Update context for the next turn
      if (result.newItemContext) {
        setLastItemContext(result.newItemContext);
      } else {
        setLastItemContext(null); // Clear context if the turn didn't result in a new item
      }

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
    <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
      <div className="space-y-4">
        <span className="text-6xl" role="img" aria-label="waving hand">👋</span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">Welcome to Reva!</h1>
        <p className="text-muted-foreground text-lg">
          Just start typing to create tasks, track expenses, set reminders, and more.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 w-full max-w-4xl">
        <Card className="bg-secondary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalExpenses.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingReminders}</div>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{goalsInProgress}</div>
            <p className="text-xs text-muted-foreground">in Progress</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col h-full">
      <ScrollArea className="flex-1 p-6 sm:p-8 lg:p-12 notebook-lines-chat" viewportRef={scrollViewportRef}>
        {messages.length > 0 ? (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn('w-full flex', {
                  'justify-end': message.sender === 'user',
                  'items-start': message.sender === 'bot',
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
                    {index === messages.length - 1 && !isLoading ? (
                      <BotTypingMessage content={message.text} />
                    ) : (
                      <div className="flex-1 prose dark:prose-invert leading-relaxed text-base pt-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="w-full flex items-start">
                 <p className="text-sm text-muted-foreground animate-pulse pt-1">Reva is thinking...</p>
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
