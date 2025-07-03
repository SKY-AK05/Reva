'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Task {
  id: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface TasksContextType {
  tasks: Task[];
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'completed'>>) => void;
  toggleTaskCompletion: (id: string, completed: boolean) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

const initialTasks: Task[] = [
  {
    id: '1',
    description: 'Buy groceries for the week',
    dueDate: '2024-10-25',
    priority: 'high',
    completed: false,
  },
  {
    id: '2',
    description: 'Finish the Q3 report for work',
    dueDate: '2024-10-26',
    priority: 'high',
    completed: false,
  },
  {
    id: '3',
    description: 'Schedule dentist appointment',
    dueDate: '2024-10-28',
    priority: 'medium',
    completed: true,
  },
  {
    id: '4',
    description: 'Call mom',
    dueDate: '2024-10-24',
    priority: 'low',
    completed: false,
  },
  {
    id: '5',
    description: 'Renew gym membership',
    dueDate: '2024-11-01',
    priority: 'medium',
    completed: false,
  },
];

export const TasksContextProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id' | 'completed'>>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  }, []);

  const toggleTaskCompletion = useCallback((id: string, completed: boolean) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed } : task
      )
    );
  }, []);
  
  const value = {
    tasks,
    updateTask,
    toggleTaskCompletion,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasksContext must be used within a TasksContextProvider');
  }
  return context;
};
