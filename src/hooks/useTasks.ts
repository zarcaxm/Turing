import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task } from '../types/task';
import { assignTaskNumbers } from '../utils/numbering';
import { deriveTaskScores } from '../utils/scoring';
import { hasActiveTimer } from '../utils/time';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const hasElectronApi = typeof window !== 'undefined' && typeof window.electron !== 'undefined';

  const numberedTasks = useMemo(() => assignTaskNumbers(deriveTaskScores(tasks)), [tasks]);

  // Load tasks from SQLite on mount, migrate localStorage data if present
  useEffect(() => {
    if (!hasElectronApi) {
      setLoading(false);
      return;
    }

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
  }, [hasElectronApi]);

  useEffect(() => {
    if (!hasActiveTimer(tasks)) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [tasks]);

  const addTask = useCallback(async (
    title: string,
    parentId: string | null = null,
    context?: string,
    status: Task['status'] = 'active'
  ) => {
    if (!title.trim() || !hasElectronApi) return;
    const updatedTasks = await window.electron.addTask({ title, parentId, context, status });
    setTasks(updatedTasks);
  }, [hasElectronApi]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!hasElectronApi) return;
    const updatedTasks = await window.electron.deleteTask({ taskId });
    setTasks(updatedTasks);
  }, [hasElectronApi]);

  const toggleComplete = useCallback(async (taskId: string) => {
    if (!hasElectronApi) return;
    const updatedTasks = await window.electron.toggleComplete({ taskId });
    setTasks(updatedTasks);
  }, [hasElectronApi]);

  const toggleExpand = useCallback(async (taskId: string) => {
    if (!hasElectronApi) return;
    const updatedTasks = await window.electron.toggleExpand({ taskId });
    setTasks(updatedTasks);
  }, [hasElectronApi]);

  const startTaskTimer = useCallback(async (taskId: string, ancestorIds: string[] = []) => {
    if (!hasElectronApi) return;
    const updatedTasks = await window.electron.startTaskTimer({ taskId, ancestorIds });
    setTasks(updatedTasks);
  }, [hasElectronApi]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!hasElectronApi) return;
    const updatedTasks = await window.electron.updateTask({ taskId, updates });
    setTasks(updatedTasks);
  }, [hasElectronApi]);

  return {
    tasks: numberedTasks,
    loading,
    now,
    hasElectronApi,
    addTask,
    deleteTask,
    toggleComplete,
    toggleExpand,
    startTaskTimer,
    updateTask,
  };
}
