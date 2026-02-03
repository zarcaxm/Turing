import { useState } from 'react';
import { Task } from '../types/task';
import { TaskInput } from './TaskInput';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onToggleExpand: (taskId: string) => void;
}

export function TaskItem({
  task,
  onToggleComplete,
  onDelete,
  onAddSubtask,
  onToggleExpand
}: TaskItemProps) {
  const [showInput, setShowInput] = useState(false);

  const handleAddSubtask = (title: string) => {
    onAddSubtask(task.id, title);
    setShowInput(false);
  };

  const hasSubtasks = task.subtasks.length > 0;
  const isExpanded = task.expanded !== false; // Default to true if undefined

  return (
    <div className="task-item" style={{ marginLeft: `${task.level * 20}px` }}>
      <div className="task-content">
        {/* Expand/Collapse button */}
        {hasSubtasks && (
          <button
            className="task-expand-btn"
            onClick={() => onToggleExpand(task.id)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? '▼' : '►'}
          </button>
        )}

        {/* Checkbox */}
        <button
          className={`task-checkbox ${task.completed ? 'completed' : ''}`}
          onClick={() => onToggleComplete(task.id)}
          aria-label="Toggle completion"
        >
          {task.completed ? '✓' : ' '}
        </button>

        {/* Task number and title */}
        <span className={`task-title ${task.completed ? 'completed' : ''}`}>
          <span className="task-number">{task.number}.</span> {task.title}
        </span>

        {/* Score badge */}
        <span className="task-score">[{task.score} PTS]</span>

        {/* Add subtask button */}
        <button
          className="task-add-btn"
          onClick={() => setShowInput(!showInput)}
          aria-label="Add subtask"
        >
          +
        </button>

        {/* Delete button */}
        <button
          className="task-delete-btn"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          ×
        </button>
      </div>

      {/* Subtask input */}
      {showInput && (
        <div className="task-subtask-input" style={{ marginLeft: '20px' }}>
          <TaskInput
            onAddTask={handleAddSubtask}
            placeholder="> NEW SUBTASK_"
            autoFocus={true}
          />
        </div>
      )}

      {/* Recursively render subtasks */}
      {isExpanded && hasSubtasks && (
        <div className="task-subtasks">
          {task.subtasks.map(subtask => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}
