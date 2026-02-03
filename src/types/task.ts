export interface Task {
  id: string;              // Unique identifier
  title: string;           // Task description
  completed: boolean;      // Completion status
  level: number;           // Nesting level (0 = root)
  score: number;           // Calculated score (100 - level * 10)
  subtasks: Task[];        // Nested child tasks
  createdAt: number;       // Timestamp
  expanded?: boolean;      // UI state for expand/collapse
}
