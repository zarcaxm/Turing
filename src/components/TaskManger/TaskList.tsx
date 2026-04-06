import { Task } from '../../types/task';
import { TaskItem } from './TaskItem';
import { calculateCompletedScoreForRange } from '../../utils/scoring';

interface TaskListProps {
  tasks: Task[];
  now: number;
  mode: 'active' | 'backlog';
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onAddSubtask: (parentId: string, title: string, context?: string) => void;
  onToggleExpand: (taskId: string) => void;
  onStartTimer: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskList({
  tasks,
  now,
  mode,
  onToggleComplete,
  onDelete,
  onAddSubtask,
  onToggleExpand,
  onStartTimer,
  onUpdateTask
}: TaskListProps) {
  const isBacklog = mode === 'backlog';
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const totalScore = calculateCompletedScoreForRange(
    tasks,
    startOfToday.getTime(),
    endOfToday.getTime()
  );

  return (
    <div className="task-list">
      <div className="task-stats">
        <div className="stat-item">
          <span className="stat-label">{isBacklog ? 'BACKLOG POINT SUM:' : 'POINT SUM:'}</span>
          <span className="stat-value">{totalScore} PTS</span>
        </div>
      </div>

      <div className="tasks-container">
        {tasks.length === 0 ? (
          <div className="no-tasks">{isBacklog ? 'NO BACKLOG GOALS' : 'NO ACTIVE TASKS'}</div>
        ) : (
          tasks.filter(task => !task.completed).map(task => (
            <TaskItem
              key={task.id}
              task={task}
              now={now}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
              onToggleExpand={onToggleExpand}
              onStartTimer={onStartTimer}
              onUpdateTask={onUpdateTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
