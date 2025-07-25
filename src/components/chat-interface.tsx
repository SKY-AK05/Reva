
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SendHorizonal, CheckSquare, DollarSign, Bell, Target, User, BookText } from 'lucide-react';
import { processUserChat } from '@/app/(app)/chat/actions';
import type { ChatMessage } from '@/services/chat';
import { useChatContext } from '@/context/chat-context';
import { useTasksContext } from '@/context/tasks-context';
import { useExpensesContext } from '@/context/expenses-context';
import { useRemindersContext } from '@/context/reminders-context';
import { useGoalsContext, type Goal } from '@/context/goals-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BotTypingMessage from './bot-typing-message';
import { useToneContext } from '@/context/tone-context';
import { Progress } from '@/components/ui/progress';
import RevaLogo from './reva-logo';

function GoalCard({ goal }: { goal: Goal }) {
  return (
    <Card className="mt-2 animate-fade-in-up bg-background/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{goal.title}</CardTitle>
        {goal.description && <CardDescription>{goal.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Progress value={goal.progress} className="h-2 flex-1" />
          <span className="text-sm font-semibold text-muted-foreground">{goal.progress}%</span>
        </div>
        {goal.status && <p className="text-xs text-muted-foreground mt-2">Status: {goal.status}</p>}
      </CardContent>
    </Card>
  )
}

export default function ChatInterface() {
  const { messages, setMessages, lastItemContext, setLastItemContext, loading: isFetchingHistory } = useChatContext();
  const { tone } = useToneContext();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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

  const iconMap = {
    task: CheckSquare,
    reminder: Bell,
    expense: DollarSign,
    goal: Target,
    journalEntry: BookText,
  };

  useEffect(() => {
    // Scroll to the bottom of the chat on new messages
    scrollViewportRef.current?.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });

    // Refocus the input field when it's ready for input
    if (!isLoading && !isFetchingHistory) {
      inputRef.current?.focus();
    }
  }, [messages, isLoading, isFetchingHistory]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: messageText,
      created_at: new Date().toISOString(),
      user_id: '',
    };
    
    const historyForAi = messages.slice(-10);
    const formattedHistory = historyForAi.map(msg => ({
        sender: msg.sender,
        text: msg.text,
    }));

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsAnimating(false);

    try {
      const result = await processUserChat(messageText, lastItemContext, formattedHistory, tone);
      
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: result.botResponse,
        created_at: new Date().toISOString(),
        user_id: '',
        goal: result.goal,
        actionIcon: result.actionIcon
      };
      
      setIsLoading(false); // Hide "thinking..." message
      setMessages(prev => [...prev, botMessage]);
      setIsAnimating(true); // Start animation for the new message

      if (result.newItemContext) {
        setLastItemContext(result.newItemContext);
      } else if (!result.updatedItemType) {
        setLastItemContext(null); 
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
      setIsLoading(false);
      setMessages(prev => [...prev, errorMessage]);
      setIsAnimating(true);
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
            <div className="text-3xl font-bold">₹{totalExpenses.toFixed(2)}</div>
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
                className={cn('w-full flex gap-4', {
                  'justify-end': message.sender === 'user',
                  'items-start': message.sender === 'bot',
                })}
              >
                {message.sender === 'bot' && (
                  <>
                    {message.actionIcon && iconMap[message.actionIcon] ? (
                      React.createElement(iconMap[message.actionIcon], { className: "h-6 w-6 text-primary flex-shrink-0" })
                    ) : (
                      <div className="h-8 w-8 flex items-center justify-center flex-shrink-0">
                        <RevaLogo size="xs" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <BotTypingMessage
                        content={message.text}
                        animate={index === messages.length - 1 && isAnimating}
                        onAnimationComplete={() => setIsAnimating(false)}
                      />
                      {message.goal && <GoalCard goal={message.goal} />}
                    </div>
                  </>
                )}
                {message.sender === 'user' && (
                  <>
                    <div className="max-w-xl p-4 rounded-2xl bg-primary text-primary-foreground">
                        {message.text}
                    </div>
                    <User className="h-6 w-6 text-primary flex-shrink-0" />
                  </>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="w-full flex items-start gap-4">
                 <div className="h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <RevaLogo size="xs" />
                  </div>
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
