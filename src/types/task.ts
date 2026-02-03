export interface Task {
  id: string;              // Unique identifier
  number: string;          // Hierarchical task number (e.g., "1", "1.1", "1.2.1")
  title: string;           // Task description
  completed: boolean;      // Completion status
  level: number;           // Nesting level (0 = root)
  score: number;           // Calculated score (100 - level * 10)
  subtasks: Task[];        // Nested child tasks
  createdAt: number;       // Timestamp
  expanded?: boolean;      // UI state for expand/collapse
  context?: string;        // Additional details/context about the task
}
