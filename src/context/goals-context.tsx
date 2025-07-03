'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: string;
}

interface GoalsContextType {
  goals: Goal[];
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id'>>) => void;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

const initialGoals: Goal[] = [
  {
    id: '1',
    title: 'Read 3 books this month',
    description: 'Expand knowledge on product management and design.',
    progress: 33,
    status: '1/3 books read',
  },
  {
    id: '2',
    title: 'Save $1,000 for vacation',
    description: 'Contribute to the travel fund for the trip to Italy.',
    progress: 75,
    status: '$750 saved',
  },
  {
    id: '3',
    title: 'Go to the gym 12 times',
    description: 'Focus on strength training and cardio.',
    progress: 50,
    status: '6/12 sessions completed',
  },
   {
    id: '4',
    title: 'Complete the side project',
    description: 'Launch the MVP of the new app by end of Q4.',
    progress: 20,
    status: 'Design phase complete',
  },
];

export const GoalsContextProvider = ({ children }: { children: ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  const updateGoal = useCallback((id: string, updates: Partial<Omit<Goal, 'id'>>) => {
    setGoals(prevGoals =>
      prevGoals.map(goal =>
        goal.id === id ? { ...goal, ...updates } : goal
      )
    );
  }, []);
  
  const value = {
    goals,
    updateGoal,
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
