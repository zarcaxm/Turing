import { Task } from '../types/task';

/**
 * Calculate the base score for a leaf task from its nesting level.
 * Base score is 100, decreases by 10 per level, minimum 0.
 */
export function calculateScore(level: number): number {
  return Math.max(0, 100 - (level * 10));
}

/**
 * Rebuild task scores so any parent task is worth the sum of its direct subtasks.
 * Leaf tasks keep their depth-based base score.
 */
export function deriveTaskScores(tasks: Task[]): Task[] {
  return tasks.map((task) => {
    const subtasks = deriveTaskScores(task.subtasks);
    const score = subtasks.length > 0
      ? subtasks.reduce((total, subtask) => total + subtask.score, 0)
      : calculateScore(task.level);

    return {
      ...task,
      score,
      subtasks,
    };
  });
}

/**
 * Recursively calculate the total score for completed tasks only.
 * Deleted tasks are excluded because they are no longer present in the task tree.
 */
export function calculateTotalScore(tasks: Task[]): number {
  let total = 0;

  for (const task of tasks) {
    if (task.completed) {
      total += task.score;
    }

    if (task.subtasks.length > 0) {
      total += calculateTotalScore(task.subtasks);
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

function getLocalDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Recursively aggregate completed task scores by local calendar day.
 * Keys use YYYY-MM-DD in the user's local timezone.
 */
export function calculateCompletedScoresByDay(tasks: Task[]): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const task of tasks) {
    if (task.completed && task.completedAt !== undefined) {
      const dayKey = getLocalDateKey(task.completedAt);
      totals[dayKey] = (totals[dayKey] ?? 0) + task.score;
    }

    if (task.subtasks.length > 0) {
      const subtaskTotals = calculateCompletedScoresByDay(task.subtasks);

      for (const [dayKey, score] of Object.entries(subtaskTotals)) {
        totals[dayKey] = (totals[dayKey] ?? 0) + score;
      }
    }
  }

  return totals;
}
