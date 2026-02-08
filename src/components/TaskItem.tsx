import { useState } from 'react';
import { Task } from '../types/task';
import { TaskInput } from './TaskInput';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onAddSubtask: (parentId: string, title: string, context?: string) => void;
  onToggleExpand: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskItem({
  task,
  onToggleComplete,
  onDelete,
  onAddSubtask,
  onToggleExpand,
  onUpdateTask
}: TaskItemProps) {
  const [showInput, setShowInput] = useState(false);
  const [showContext, setShowContext] = useState(true);
  const [editingContext, setEditingContext] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [contextValue, setContextValue] = useState(task.context || '');

  const handleAddSubtask = (title: string, context?: string) => {
    onAddSubtask(task.id, title, context);
    setShowInput(false);
  };

  const handleSaveEdit = () => {
    onUpdateTask(task.id, {
      title: titleValue.trim() || task.title,
      context: contextValue.trim() || undefined
    });
    setEditingContext(false);
  };

  const handleCancelEdit = () => {
    setTitleValue(task.title);
    setContextValue(task.context || '');
    setEditingContext(false);
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
          {task.completed ? ' ' : ' '}
        </button>

        {/* Task number and title - click to toggle context */}
        <span
          className={`task-title ${task.completed ? 'completed' : ''}`}
          onClick={() => task.context && setShowContext(!showContext)}
          style={{ cursor: task.context ? 'pointer' : 'default' }}
        >
          <span className="task-number">{task.number}.</span> {task.title}
        </span>

        {/* Score badge */}
        <span className="task-score">[{task.score} PTS]</span>

        {/* Add subtask button */}
        {!task.completed &&
          (
            <button
              className="task-add-btn"
              disabled={task.completed}
              onClick={() => setShowInput(!showInput)}
              aria-label="Add subtask"
            >
              +
            </button>
          )
        }


        {/* Delete button */}
        <button
          className="task-delete-btn"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          ×
        </button>

        {/* Edit context button */}
        <button
          className="task-context-btn"
          onClick={() => setEditingContext(!editingContext)}
          aria-label="Edit context"
          title="Edit context/details"
        >
          ✎
        </button>
      </div>

      {/* Context display/edit */}
      {(editingContext || (task.context && showContext)) && (
        <div className="task-context" style={{ marginLeft: `${task.level * 20 + 40}px` }}>
          {editingContext ? (
            <div className="task-context-edit">
              <input
                className="task-title-input"
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                placeholder="> TASK TITLE_"
                autoFocus
              />
              <textarea
                className="task-context-input"
                value={contextValue}
                onChange={(e) => setContextValue(e.target.value)}
                placeholder="> CONTEXT/DETAILS_"
                rows={3}
              />
              <div className="task-context-actions">
                <button onClick={handleSaveEdit} className="task-context-save">
                  [SAVE]
                </button>
                <button onClick={handleCancelEdit} className="task-context-cancel">
                  [CANCEL]
                </button>
              </div>
            </div>
          ) : (
            task.context && (
              <div className="task-context-display">
                <span className="task-context-label">CONTEXT:</span> {task.context}
              </div>
            )
          )}
        </div>
      )}

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
              onUpdateTask={onUpdateTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
