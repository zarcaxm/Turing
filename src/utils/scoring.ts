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
 * Count total number of visible tasks (including subtasks)
 * Completed tasks' children are hidden, so don't recurse into them
 */
export function countTasks(tasks: Task[]): number {
  let count = tasks.length;

  for (const task of tasks) {
    if (!task.completed && task.subtasks.length > 0) {
      count += countTasks(task.subtasks);
    }
  }

  return count;
}

/**
 * Count completed tasks among visible ones
 * Only recurse into non-completed tasks (completed tasks hide their children)
 */
export function countCompletedTasks(tasks: Task[]): number {
  let count = 0;

  for (const task of tasks) {
    if (task.completed) {
      count++;
    } else if (task.subtasks.length > 0) {
      count += countCompletedTasks(task.subtasks);
    }
  }

  return count;
}
