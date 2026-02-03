import { Task } from '../types/task';

/**
 * Calculate hierarchical task numbers for all tasks
 * Root tasks: 1, 2, 3, ...
 * Subtasks: 1.1, 1.2, 1.3, ...
 * Nested subtasks: 1.1.1, 1.1.2, ...
 */
export function assignTaskNumbers(tasks: Task[]): Task[] {
  return tasks.map((task, index) => assignNumbersRecursive(task, `${index + 1}`));
}

/**
 * Recursively assign numbers to a task and its subtasks
 */
function assignNumbersRecursive(task: Task, number: string): Task {
  const numberedSubtasks = task.subtasks.map((subtask, index) =>
    assignNumbersRecursive(subtask, `${number}.${index + 1}`)
  );

  return {
    ...task,
    number,
    subtasks: numberedSubtasks,
  };
}
