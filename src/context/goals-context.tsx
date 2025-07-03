'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getGoals, addGoal, updateGoal as updateGoalInDb } from '@/services/goals';

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  status: string | null;
}

interface GoalsContextType {
  goals: Goal[];
  addGoal: (newGoal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id'>>) => Promise<void>;
  loading: boolean;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsContextProvider = ({ children }: { children: ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      const fetchedGoals = await getGoals();
      setGoals(fetchedGoals);
      setLoading(false);
    };
    fetchGoals();
  }, []);

  const handleAddGoal = useCallback(async (newGoal: Omit<Goal, 'id'>) => {
    const addedGoal = await addGoal(newGoal);
    if (addedGoal) {
      setGoals(prev => [...prev, addedGoal]);
    }
  }, []);

  const handleUpdateGoal = useCallback(async (id: string, updates: Partial<Omit<Goal, 'id'>>) => {
    // Optimistic update
    setGoals(prevGoals =>
      prevGoals.map(goal =>
        goal.id === id ? { ...goal, ...updates } : goal
      )
    );
    try {
      await updateGoalInDb(id, updates);
    } catch (error) {
      console.error("Failed to update goal, rolling back", error);
      // On error, refetch to get the source of truth
      const fetchedGoals = await getGoals();
      setGoals(fetchedGoals);
    }
  }, []);
  
  const value = {
    goals,
    addGoal: handleAddGoal,
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
