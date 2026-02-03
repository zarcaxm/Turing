import { Task } from '../types/task';

/**
 * Calculate the score for a task based on its nesting level
 * Base score is 100, decreases by 10 per level
 * Minimum score is 0
 */
export function calculateScore(level: number): number {
  return Math.max(0, 100 - (level * 10));
}

/**
 * Recursively calculate the total score for all incomplete tasks
 * Only counts tasks that are not completed
 */
export function calculateTotalScore(tasks: Task[]): number {
  let total = 0;

  for (const task of tasks) {
    // Only count incomplete tasks
    if (!task.completed) {
      total += task.score;

      // Recursively add subtask scores
      if (task.subtasks.length > 0) {
        total += calculateTotalScore(task.subtasks);
      }
    }
  }

  return total;
}

/**
 * Count total number of tasks (including subtasks)
 */
export function countTasks(tasks: Task[]): number {
  let count = tasks.length;

  for (const task of tasks) {
    if (task.subtasks.length > 0) {
      count += countTasks(task.subtasks);
    }
  }

  return count;
}

/**
 * Count completed tasks (including subtasks)
 */
export function countCompletedTasks(tasks: Task[]): number {
  let count = 0;

  for (const task of tasks) {
    if (task.completed) {
      count++;
    }

    if (task.subtasks.length > 0) {
      count += countCompletedTasks(task.subtasks);
    }
  }

  return count;
}
