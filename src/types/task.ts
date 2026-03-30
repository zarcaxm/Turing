export interface Task {
  id: string;              // Unique identifier
  number: string;          // Hierarchical task number (e.g., "1", "1.1", "1.2.1")
  title: string;           // Task description
  completed: boolean;      // Completion status
  level: number;           // Nesting level (0 = root)
  score: number;           // Derived display score: leaf base score or parent roll-up from children
  subtasks: Task[];        // Nested child tasks
  createdAt: number;       // Timestamp
  completedAt?: number;    // Timestamp when task was completed
  expanded?: boolean;      // UI state for expand/collapse
  context?: string;        // Additional details/context about the task
}
