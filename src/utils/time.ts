import { Task } from '../types/task';

export function getTaskElapsedTime(task: Task, now = Date.now()): number {
  if (!task.timerStartedAt) {
    return task.elapsedTimeMs;
  }

  return task.elapsedTimeMs + Math.max(0, now - task.timerStartedAt);
}

export function getTaskTotalElapsedTime(task: Task, now = Date.now()): number {
  const ownElapsed = getTaskElapsedTime(task, now);

  if (task.subtasks.length === 0) {
    return ownElapsed;
  }

  return ownElapsed + task.subtasks.reduce(
    (total, subtask) => total + getTaskTotalElapsedTime(subtask, now),
    0
  );
}

export function hasActiveTimer(tasks: Task[]): boolean {
  return tasks.some((task) => Boolean(task.timerStartedAt) || hasActiveTimer(task.subtasks));
}

export function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}
