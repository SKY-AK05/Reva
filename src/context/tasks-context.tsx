'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getTasks, addTask, updateTask as updateTaskInDb, toggleTask as toggleTaskInDb } from '@/services/tasks';

export interface Task {
  id: string;
  description: string;
  dueDate: string | null;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface TasksContextType {
  tasks: Task[];
  addTask: (newTask: Omit<Task, 'id' | 'completed'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'completed'>>) => Promise<void>;
  toggleTaskCompletion: (id: string, completed: boolean) => Promise<void>;
  loading: boolean;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksContextProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
      setLoading(false);
    };
    fetchTasks();
  }, []);

  const handleAddTask = useCallback(async (newTask: Omit<Task, 'id' | 'completed'>) => {
    const addedTask = await addTask(newTask);
    if(addedTask) {
        setTasks(prev => [...prev, addedTask]);
    }
  }, []);

  const handleUpdateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id' | 'completed'>>) => {
    const updatedTask = await updateTaskInDb(id, updates);
    if (updatedTask) {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? updatedTask : task
            )
        );
    }
  }, []);

  const handleToggleTaskCompletion = useCallback(async (id: string, completed: boolean) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed } : task
      )
    );
    await toggleTaskInDb(id, completed);
  }, []);
  
  const value = {
    tasks,
    addTask: handleAddTask,
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
