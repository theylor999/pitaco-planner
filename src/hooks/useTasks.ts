
"use client";

import type { Task } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { defaultTaskIconValue } from '@/lib/icons';

const TASKS_STORAGE_KEY = 'pitacoPlannerTasks';

// Custom hook for managing tasks with local storage persistence
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // Tracks if tasks have been loaded from local storage

  // Load tasks from local storage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure running in browser
      try {
        const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error("Failed to load tasks from local storage:", error);
        setTasks([]); // Default to empty array on error
      } finally {
        setIsLoaded(true); // Mark as loaded
      }
    }
  }, []);

  // Save tasks to local storage whenever the tasks array or loaded status changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks to local storage:", error);
      }
    }
  }, [tasks, isLoaded]);

  // Adds a single new task
  const addTask = useCallback((newTaskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    setTasks(prevTasks => [
      ...prevTasks,
      { 
        ...newTaskData, 
        id: crypto.randomUUID(), // Generate unique ID
        completed: false, 
        createdAt: new Date().toISOString(), // Record creation time
        icon: newTaskData.icon || defaultTaskIconValue, // Assign default icon if none provided
      },
    ]);
  }, []);

  // Adds multiple tasks (e.g., example tasks)
  const addMultipleTasks = useCallback((newTasksData: Array<Omit<Task, 'id' | 'completed' | 'createdAt'>>) => {
    const tasksToAdd: Task[] = newTasksData.map(newTaskData => ({
      ...newTaskData,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
      icon: newTaskData.icon || defaultTaskIconValue,
    }));
    setTasks(prevTasks => [...prevTasks, ...tasksToAdd]);
  }, []);

  // Updates an existing task
  const updateTask = useCallback((updatedTaskData: Omit<Task, 'id' | 'createdAt'> & { id: string }) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === updatedTaskData.id ? { ...task, ...updatedTaskData, icon: updatedTaskData.icon || defaultTaskIconValue } : task))
    );
  }, []);
  
  // Deletes a task by ID
  const deleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  // Toggles the completion status of a task
  const toggleTaskCompletion = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  // Clears all user-created tasks from state (and subsequently local storage)
  const clearUserTasks = useCallback(() => {
    setTasks([]);
  }, []);

  return { 
    tasks, 
    addTask, 
    addMultipleTasks, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion, 
    clearUserTasks,
    isLoaded // Expose loaded status for UI to know when tasks are ready
  };
}
