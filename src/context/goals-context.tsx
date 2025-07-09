
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getGoals, addGoal as addGoalToDb, updateGoal as updateGoalInDb, deleteGoal as deleteGoalInDb } from '@/services/goals';
import { createClient } from '@/lib/supabase/client';

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  status: string | null;
}

export type NewGoal = Omit<Goal, 'id' | 'progress' | 'status'>;

interface GoalsContextType {
  goals: Goal[];
  addGoal: (goal: NewGoal) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id'>>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  loading: boolean;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsContextProvider = ({ children }: { children: ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    const fetchedGoals = await getGoals();
    setGoals(fetchedGoals);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    const channel = supabase
      .channel('public:goals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals' },
        (payload) => {
          const newGoal = payload.new as Goal;
          if (payload.eventType === 'INSERT') {
            setGoals(prev => [...prev, newGoal]);
          }
          if (payload.eventType === 'UPDATE') {
            setGoals(prev => prev.map(g => g.id === newGoal.id ? newGoal : g));
          }
          if (payload.eventType === 'DELETE') {
            setGoals(prev => prev.filter(g => g.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAddGoal = useCallback(async (goal: NewGoal) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const goalWithDefaults = {
      ...goal,
      progress: 0,
      status: 'Not Started',
      userId: user.id,
    };
    await addGoalToDb(goalWithDefaults);
  }, [supabase]);

  const handleUpdateGoal = useCallback(async (id: string, updates: Partial<Omit<Goal, 'id'>>) => {
    setGoals(prevGoals =>
        prevGoals.map(goal =>
            goal.id === id ? { ...goal, ...updates } as Goal : goal
        )
    );
    await updateGoalInDb(id, updates);
  }, []);

  const handleDeleteGoal = useCallback(async (id: string) => {
    await deleteGoalInDb(id);
  }, []);
  
  const value = {
    goals,
    addGoal: handleAddGoal,
    updateGoal: handleUpdateGoal,
    deleteGoal: handleDeleteGoal,
    loading,
  };

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
};

export const useGoalsContext = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoalsContext must be used within a GoalsContextProvider');
  }
  return context;
};
