import { useEffect, useMemo, useState } from 'react';
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
  onReorderTasks: (taskIds: string[]) => void;
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
  onUpdateTask,
  onReorderTasks
}: TaskListProps) {
  const [showCompletedGoals, setShowCompletedGoals] = useState(false);
  const [reorderAnimation, setReorderAnimation] = useState<Record<string, 'up' | 'down'>>({});
  const isBacklog = mode === 'backlog';
  const canShowCompletedGoals = !isBacklog;
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
    () => canShowCompletedGoals && showCompletedGoals
      ? tasks.filter(task => !task.completed || isCompletedToday(task))
      : tasks.filter(task => !task.completed),
    [canShowCompletedGoals, showCompletedGoals, tasks, startOfTodayMs, endOfTodayMs]
  );
  const hasCompletedGoalsToday = canShowCompletedGoals && tasks.some(isCompletedToday);
  const siblingIds = tasks.map(task => task.id);

  const moveTask = (taskId: string, direction: -1 | 1) => {
    const currentIndex = siblingIds.indexOf(taskId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= siblingIds.length) {
      return;
    }

    setReorderAnimation({
      [taskId]: direction === -1 ? 'up' : 'down',
      [siblingIds[nextIndex]]: direction === -1 ? 'down' : 'up',
    });

    const nextIds = [...siblingIds];
    [nextIds[currentIndex], nextIds[nextIndex]] = [nextIds[nextIndex], nextIds[currentIndex]];
    onReorderTasks(nextIds);
  };

  useEffect(() => {
    if (Object.keys(reorderAnimation).length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setReorderAnimation({});
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [reorderAnimation]);

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
              forceShowCompletedTasks={canShowCompletedGoals && showCompletedGoals}
              siblingIds={siblingIds}
              reorderAnimation={reorderAnimation[task.id]}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
              onToggleExpand={onToggleExpand}
              onStartTimer={onStartTimer}
              onUpdateTask={onUpdateTask}
              onMoveTask={moveTask}
              onReorderTasks={onReorderTasks}
            />
          ))
        )}
      </div>
    </div>
  );
}
