import { useMemo, useState } from 'react';
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
  const [showCompletedGoals, setShowCompletedGoals] = useState(false);
  const isBacklog = mode === 'backlog';
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const startOfTodayMs = startOfToday.getTime();
  const endOfTodayMs = endOfToday.getTime();

  const isCompletedToday = (task: Task) =>
    task.completed &&
    task.completedAt != null &&
    task.completedAt >= startOfTodayMs &&
    task.completedAt <= endOfTodayMs;

  const totalScore = calculateCompletedScoreForRange(
    tasks,
    startOfTodayMs,
    endOfTodayMs
  );
  const visibleTasks = useMemo(
    () => showCompletedGoals
      ? tasks.filter(task => !task.completed || isCompletedToday(task))
      : tasks.filter(task => !task.completed),
    [showCompletedGoals, tasks, startOfTodayMs, endOfTodayMs]
  );
  const hasCompletedGoalsToday = tasks.some(isCompletedToday);

  return (
    <div className="task-list">
      <div className="task-stats">
        <div className="stat-item">
          <span className="stat-label">{isBacklog ? 'BACKLOG POINT SUM:' : 'POINT SUM:'}</span>
          <span className="stat-value">{totalScore} PTS</span>
        </div>
        {hasCompletedGoalsToday && (
          <button
            className={`task-list-visibility-btn ${showCompletedGoals ? 'active' : ''}`}
            onClick={() => setShowCompletedGoals(current => !current)}
            aria-label={showCompletedGoals ? 'Hide today checked goals' : 'Show today checked goals'}
            title={showCompletedGoals ? 'Hide goals checked today' : 'Show goals checked today'}
          >
            [{showCompletedGoals ? 'HIDE TODAY CHECKED' : 'SHOW TODAY CHECKED'}]
          </button>
        )}
      </div>

      <div className="tasks-container">
        {visibleTasks.length === 0 ? (
          <div className="no-tasks">{isBacklog ? 'NO BACKLOG GOALS' : 'NO ACTIVE TASKS'}</div>
        ) : (
          visibleTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              now={now}
              forceShowCompletedTasks={showCompletedGoals}
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
