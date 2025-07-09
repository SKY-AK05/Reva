
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getTasks, addTask as addTaskToDb, updateTask as updateTaskInDb, toggleTask as toggleTaskInDb, deleteTask as deleteTaskInDb } from '@/services/tasks';
import { createClient } from '@/lib/supabase/client';

export interface Task {
  id: string;
  description: string;
  dueDate: string | null;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export type NewTask = Partial<Omit<Task, 'id' | 'completed'>> & { description: string };

interface TasksContextType {
  tasks: Task[];
  addTask: (task: NewTask) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'completed'>>) => Promise<void>;
  toggleTaskCompletion: (id: string, completed: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  loading: boolean;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksContextProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const fetchedTasks = await getTasks();
    setTasks(fetchedTasks);
    setLoading(false);
  }, []);

  // Effect for the initial data fetch.
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Effect for the real-time subscription.
  useEffect(() => {
    const channel = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          const mapPayloadToTask = (p: any): Task => ({
            id: p.id,
            description: p.description,
            dueDate: p.due_date,
            priority: p.priority,
            completed: p.completed,
          });

          if (payload.eventType === 'INSERT') {
            setTasks(prev => [mapPayloadToTask(payload.new), ...prev]);
          }
          if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => t.id === payload.new.id ? mapPayloadToTask(payload.new) : t));
          }
          if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAddTask = useCallback(async (task: NewTask) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await addTaskToDb({ ...task, userId: user.id });
  }, [supabase]);

  const handleUpdateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id' | 'completed'>>) => {
    // The realtime listener will handle the UI update after this call succeeds.
    await updateTaskInDb(id, updates);
  }, []);

  const handleToggleTaskCompletion = useCallback(async (id: string, completed: boolean) => {
    // The realtime listener will handle the UI update.
    await toggleTaskInDb(id, completed);
  }, []);

  const handleDeleteTask = useCallback(async (id: string) => {
    await deleteTaskInDb(id);
  }, []);
  
  const value = {
    tasks,
    addTask: handleAddTask,
    updateTask: handleUpdateTask,
    toggleTaskCompletion: handleToggleTaskCompletion,
    deleteTask: handleDeleteTask,
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
