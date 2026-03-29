export interface Task {
  id: string;              // Unique identifier
  number: string;          // Hierarchical task number (e.g., "1", "1.1", "1.2.1")
  title: string;           // Task description
  completed: boolean;      // Completion status
  level: number;           // Nesting level (0 = root)
  score: number;           // Derived score: leaf base score or sum of child scores
  subtasks: Task[];        // Nested child tasks
  createdAt: number;       // Timestamp
  completedAt?: number;    // Timestamp when task was completed
  expanded?: boolean;      // UI state for expand/collapse
  context?: string;        // Additional details/context about the task
}
