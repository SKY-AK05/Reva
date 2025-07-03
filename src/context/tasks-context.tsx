'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getTasks, updateTask as updateTaskInDb, toggleTask as toggleTaskInDb } from '@/services/tasks';
import { createClient } from '@/lib/supabase/client';

export interface Task {
  id: string;
  description: string;
  dueDate: string | null;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface TasksContextType {
  tasks: Task[];
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'completed'>>) => Promise<void>;
  toggleTaskCompletion: (id: string, completed: boolean) => Promise<void>;
  loading: boolean;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksContextProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    const fetchedTasks = await getTasks();
    setTasks(fetchedTasks);
    if (loading) {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchTasks();

    const client = createClient();
    const channel = client
      .channel('public:tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [fetchTasks]);

  const handleUpdateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id' | 'completed'>>) => {
    // The realtime listener will handle the UI update after this call succeeds.
    await updateTaskInDb(id, updates);
  }, []);

  const handleToggleTaskCompletion = useCallback(async (id: string, completed: boolean) => {
    // The realtime listener will handle the UI update.
    await toggleTaskInDb(id, completed);
  }, []);
  
  const value = {
    tasks,
    updateTask: handleUpdateTask,
    toggleTaskCompletion: handleToggleTaskCompletion,
    loading,
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
