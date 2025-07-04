'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getGoals, updateGoal as updateGoalInDb } from '@/services/goals';
import { createClient } from '@/lib/supabase/client';

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  status: string | null;
}

interface GoalsContextType {
  goals: Goal[];
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id'>>) => Promise<void>;
  loading: boolean;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsContextProvider = ({ children }: { children: ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchGoals = useCallback(async () => {
    const fetchedGoals = await getGoals();
    setGoals(fetchedGoals);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    const channel = supabase
      .channel('public:goals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals' },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchGoals]);

  const handleUpdateGoal = useCallback(async (id: string, updates: Partial<Omit<Goal, 'id'>>) => {
    // The realtime listener will handle the UI update.
    await updateGoalInDb(id, updates);
  }, []);
  
  const value = {
    goals,
    updateGoal: handleUpdateGoal,
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
