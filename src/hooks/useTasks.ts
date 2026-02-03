import { useState, useEffect, useMemo } from 'react';
import { Task } from '../types/task';
import { calculateScore } from '../utils/scoring';
import { loadTasks, saveTasks } from '../utils/storage';
import { assignTaskNumbers } from '../utils/numbering';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Automatically assign hierarchical numbers to tasks
  const numberedTasks = useMemo(() => assignTaskNumbers(tasks), [tasks]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const loadedTasks = loadTasks();
    setTasks(loadedTasks);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem('turing_tasks')) {
      saveTasks(tasks);
    }
  }, [tasks]);

  /**
   * Generate a unique ID for a task
   */
  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Add a new task (root level or as subtask)
   */
  const addTask = (title: string, parentId: string | null = null) => {
    if (!title.trim()) return;

    if (parentId === null) {
      // Add root level task
      const newTask: Task = {
        id: generateId(),
        number: '', // Will be assigned by assignTaskNumbers
        title: title.trim(),
        completed: false,
        level: 0,
        score: calculateScore(0),
        subtasks: [],
        createdAt: Date.now(),
        expanded: true,
      };
      setTasks([...tasks, newTask]);
    } else {
      // Add subtask to parent
      const addSubtaskRecursive = (taskList: Task[]): Task[] => {
        return taskList.map(task => {
          if (task.id === parentId) {
            const newSubtask: Task = {
              id: generateId(),
              number: '', // Will be assigned by assignTaskNumbers
              title: title.trim(),
              completed: false,
              level: task.level + 1,
              score: calculateScore(task.level + 1),
              subtasks: [],
              createdAt: Date.now(),
              expanded: true,
            };
            return {
              ...task,
              subtasks: [...task.subtasks, newSubtask],
              expanded: true, // Auto-expand when adding subtask
            };
          }
          if (task.subtasks.length > 0) {
            return {
              ...task,
              subtasks: addSubtaskRecursive(task.subtasks),
            };
          }
          return task;
        });
      };
      setTasks(addSubtaskRecursive(tasks));
    }
  };

  /**
   * Delete a task and all its subtasks
   */
  const deleteTask = (taskId: string) => {
    const deleteRecursive = (taskList: Task[]): Task[] => {
      return taskList
        .filter(task => task.id !== taskId)
        .map(task => ({
          ...task,
          subtasks: deleteRecursive(task.subtasks),
        }));
    };
    setTasks(deleteRecursive(tasks));
  };

  /**
   * Toggle task completion status
   */
  const toggleComplete = (taskId: string) => {
    const toggleRecursive = (taskList: Task[]): Task[] => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, completed: !task.completed };
        }
        if (task.subtasks.length > 0) {
          return {
            ...task,
            subtasks: toggleRecursive(task.subtasks),
          };
        }
        return task;
      });
    };
    setTasks(toggleRecursive(tasks));
  };

  /**
   * Toggle task expand/collapse state
   */
  const toggleExpand = (taskId: string) => {
    const toggleRecursive = (taskList: Task[]): Task[] => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, expanded: !task.expanded };
        }
        if (task.subtasks.length > 0) {
          return {
            ...task,
            subtasks: toggleRecursive(task.subtasks),
          };
        }
        return task;
      });
    };
    setTasks(toggleRecursive(tasks));
  };

  /**
   * Update a task's properties
   */
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updateRecursive = (taskList: Task[]): Task[] => {
      return taskList.map(task => {
        if (task.id === taskId) {
          return { ...task, ...updates };
        }
        if (task.subtasks.length > 0) {
          return {
            ...task,
            subtasks: updateRecursive(task.subtasks),
          };
        }
        return task;
      });
    };
    setTasks(updateRecursive(tasks));
  };

  return {
    tasks: numberedTasks,
    addTask,
    deleteTask,
    toggleComplete,
    toggleExpand,
    updateTask,
  };
}
