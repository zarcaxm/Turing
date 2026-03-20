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
 * Recursively calculate the total score for tasks completed within a date range.
 * Only counts tasks that are completed and have a completion timestamp in range.
 */
export function calculateCompletedScoreForRange(
  tasks: Task[],
  startTime: number,
  endTime: number
): number {
  let total = 0;

  for (const task of tasks) {
    if (
      task.completed &&
      task.completedAt !== undefined &&
      task.completedAt >= startTime &&
      task.completedAt <= endTime
    ) {
      total += task.score;
    }

    if (task.subtasks.length > 0) {
      total += calculateCompletedScoreForRange(task.subtasks, startTime, endTime);
    }
  }

  return total;
}
