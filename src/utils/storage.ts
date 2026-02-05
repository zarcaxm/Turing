import { Task } from '../types/task';

const STORAGE_KEY = 'turing_tasks';

/// Save tasks to localStorage
export function saveTasks(tasks: Task[]): void {
  try {
    const json = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save tasks:', error);
  }
}

///Load tasks from localStorage
///Returns empty array if no tasks are stored
export function loadTasks(): Task[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) {
      return [];
    }
    return JSON.parse(json) as Task[];
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
}

/// Clear all tasks from storage
export function clearTasks(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear tasks:', error);
  }
}
