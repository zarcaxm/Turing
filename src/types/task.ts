export interface Task {
  id: string;              // Unique identifier
  number: string;          // Hierarchical task number (e.g., "1", "1.1", "1.2.1")
  title: string;           // Task description
  status: 'active' | 'backlog'; // Planning state for root goals and their trees
  completed: boolean;      // Completion status
  level: number;           // Nesting level (0 = root)
  score: number;           // Derived display score: leaf base score or parent roll-up from children
  subtasks: Task[];        // Nested child tasks
  createdAt: number;       // Timestamp
  completedAt?: number | null; // Timestamp when task was completed
  expanded?: boolean;      // UI state for expand/collapse
  context?: string | null; // Additional details/context about the task
  elapsedTimeMs: number;   // Total persisted elapsed time
  timerStartedAt?: number | null; // Timestamp when the timer was last started
}
