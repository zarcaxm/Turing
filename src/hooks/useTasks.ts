import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task } from '../types/task';
import { assignTaskNumbers } from '../utils/numbering';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const numberedTasks = useMemo(() => assignTaskNumbers(tasks), [tasks]);

  // Load tasks from SQLite on mount, migrate localStorage data if present
  useEffect(() => {
    async function init() {
      try {
        const legacyData = localStorage.getItem('turing_tasks');
        if (legacyData) {
          const legacyTasks = JSON.parse(legacyData) as Task[];
          if (legacyTasks.length > 0) {
            await window.electron.importFromLocalStorage({ tasks: legacyTasks });
          }
          localStorage.removeItem('turing_tasks');
        }

        const loadedTasks = await window.electron.getTasks();
        setTasks(loadedTasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const addTask = useCallback(async (title: string, parentId: string | null = null, context?: string) => {
    if (!title.trim()) return;
    const updatedTasks = await window.electron.addTask({ title, parentId, context });
    setTasks(updatedTasks);
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    const updatedTasks = await window.electron.deleteTask({ taskId });
    setTasks(updatedTasks);
  }, []);

  const toggleComplete = useCallback(async (taskId: string) => {
    const updatedTasks = await window.electron.toggleComplete({ taskId });
    setTasks(updatedTasks);
  }, []);

  const toggleExpand = useCallback(async (taskId: string) => {
    const updatedTasks = await window.electron.toggleExpand({ taskId });
    setTasks(updatedTasks);
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = await window.electron.updateTask({ taskId, updates });
    setTasks(updatedTasks);
  }, []);

  return {
    tasks: numberedTasks,
    loading,
    addTask,
    deleteTask,
    toggleComplete,
    toggleExpand,
    updateTask,
  };
}
