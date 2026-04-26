import { Task } from './task';

interface ElectronAPI {
  getTasks: () => Promise<Task[]>;
  addTask: (args: { title: string; parentId: string | null; context?: string; status?: Task['status'] }) => Promise<Task[]>;
  deleteTask: (args: { taskId: string }) => Promise<Task[]>;
  toggleComplete: (args: { taskId: string }) => Promise<Task[]>;
  toggleExpand: (args: { taskId: string }) => Promise<Task[]>;
  startTaskTimer: (args: { taskId: string }) => Promise<Task[]>;
  updateTask: (args: { taskId: string; updates: Partial<Task> }) => Promise<Task[]>;
  reorderTasks: (args: { taskIds: string[] }) => Promise<Task[]>;
  importFromLocalStorage: (args: { tasks: Task[] }) => Promise<number>;
  getTasksByDateRange: (args: { startDate: number; endDate: number }) => Promise<Task[]>;
  getDailyScores: (args: { startDate: number; endDate: number }) => Promise<{ date: string; totalScore: number; completedCount: number }[]>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
