import { Task } from '../types/task';
import { TaskItem } from './TaskItem';
import { calculateTotalScore, countTasks, countCompletedTasks } from '../utils/scoring';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onToggleExpand: (taskId: string) => void;
}

export function TaskList({
  tasks,
  onToggleComplete,
  onDelete,
  onAddSubtask,
  onToggleExpand
}: TaskListProps) {
  const totalScore = calculateTotalScore(tasks);
  const totalTaskCount = countTasks(tasks);
  const completedTaskCount = countCompletedTasks(tasks);

  return (
    <div className="task-list">
      {/* Stats header */}
      <div className="task-stats">
        <div className="stat-item">
          <span className="stat-label">TOTAL SCORE:</span>
          <span className="stat-value">{totalScore} PTS</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">TASKS:</span>
          <span className="stat-value">{completedTaskCount}/{totalTaskCount}</span>
        </div>
      </div>

      {/* Task list */}
      <div className="tasks-container">
        {tasks.length === 0 ? (
          <div className="no-tasks">NO ACTIVE TASKS</div>
        ) : (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
              onToggleExpand={onToggleExpand}
            />
          ))
        )}
      </div>
    </div>
  );
}
