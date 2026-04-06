import { useState } from 'react';
import { Task } from '../../types/task';
import { TaskInput } from './TaskInput';
import { calculateTotalScore } from '../../utils/scoring';
import { formatElapsedTime, getTaskElapsedTime, getTaskTotalElapsedTime } from '../../utils/time';

interface TaskItemProps {
  task: Task;
  now: number;
  ancestorIds?: string[];
  hasCompletedAncestor?: boolean;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onAddSubtask: (parentId: string, title: string, context?: string) => void;
  onToggleExpand: (taskId: string) => void;
  onStartTimer: (taskId: string, ancestorIds: string[]) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskItem({
  task,
  now,
  ancestorIds = [],
  hasCompletedAncestor = false,
  onToggleComplete,
  onDelete,
  onAddSubtask,
  onToggleExpand,
  onStartTimer,
  onUpdateTask
}: TaskItemProps) {
  const [showInput, setShowInput] = useState(false);
  const [showContext, setShowContext] = useState(true);
  const [editingContext, setEditingContext] = useState(false);
  const [showCompletedSubtasks, setShowCompletedSubtasks] = useState(true);
  const [titleValue, setTitleValue] = useState(task.title);
  const [contextValue, setContextValue] = useState(task.context || '');

  const handleAddSubtask = (title: string, context?: string) => {
    onAddSubtask(task.id, title, context);
    setShowInput(false);
  };

  const handleSaveEdit = () => {
    onUpdateTask(task.id, {
      title: titleValue.trim() || task.title,
      context: contextValue.trim() || null
    });
    setEditingContext(false);
  };

  const handleCancelEdit = () => {
    setTitleValue(task.title);
    setContextValue(task.context || '');
    setEditingContext(false);
  };

  const hasSubtasks = task.subtasks.length > 0;
  const completedSubtaskCount = task.subtasks.filter(subtask => subtask.completed).length;
  const visibleSubtasks = showCompletedSubtasks
    ? task.subtasks
    : task.subtasks.filter(subtask => !subtask.completed);
  const hasVisibleSubtasks = visibleSubtasks.length > 0;
  const isExpanded = task.expanded !== false; // Default to true if undefined
  const isMainTask = task.level === 0;
  const ownElapsedTime = getTaskElapsedTime(task, now);
  const totalElapsedTime = getTaskTotalElapsedTime(task, now);
  const isTimerRunning = Boolean(task.timerStartedAt);
  const isCompletionLocked = hasCompletedAncestor;
  const displayScore = task.completed
    ? (hasSubtasks ? calculateTotalScore(task.subtasks) : task.score)
    : task.score;
  const isBacklogTask = task.status === 'backlog';
  const isPlanningOnly = isBacklogTask;

  const handleToggleTimer = () => {
    if (task.completed) return;
    if (isPlanningOnly) return;

    if (isTimerRunning) {
      onUpdateTask(task.id, {
        elapsedTimeMs: ownElapsedTime,
        timerStartedAt: null
      });
      return;
    }

    onStartTimer(task.id, ancestorIds);
  };

  return (
    <div
      className="task-item"
      style={{ '--task-indent': `${task.level * 20}px` } as React.CSSProperties}
    >
      <div className={`task-content ${isMainTask ? 'is-main-task' : ''}`}>
        {/* Expand/Collapse button */}
        {hasVisibleSubtasks && (
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
          className={`task-checkbox ${task.completed ? 'completed' : ''} ${isCompletionLocked || isPlanningOnly ? 'locked' : ''}`}
          onClick={() => {
            if (isCompletionLocked || isPlanningOnly) return;
            onToggleComplete(task.id);
          }}
          disabled={isCompletionLocked || isPlanningOnly}
          aria-label={isPlanningOnly ? 'Backlog tasks cannot be completed' : isCompletionLocked ? 'Completion locked by completed parent task' : 'Toggle completion'}
          title={isPlanningOnly ? 'Move this goal to active before marking tasks complete' : isCompletionLocked ? 'Complete the parent task status first to change this subtask' : 'Toggle completion'}
        >
          {isPlanningOnly ? 'B' : isCompletionLocked ? '!' : ' '}
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
        <span className="task-score">[{displayScore} PTS]</span>

        {!isPlanningOnly && (
          <div className="task-timer-group">
            <span className="task-timer">
              [{hasSubtasks ? `TOTAL ${formatElapsedTime(totalElapsedTime)}` : formatElapsedTime(ownElapsedTime)}]
            </span>
            <button
              className={`task-timer-btn ${isTimerRunning ? 'active' : ''}`}
              onClick={handleToggleTimer}
              disabled={task.completed || isPlanningOnly}
              aria-label={isPlanningOnly ? 'Backlog tasks cannot run timers' : isTimerRunning ? 'Pause timer' : 'Start timer'}
              title={isPlanningOnly ? 'Move this goal to active before starting timers' : isTimerRunning ? 'Pause timer' : 'Start timer'}
            >
              {isTimerRunning ? '❚❚' : '▶'}
            </button>
          </div>
        )}

        {/* Completed subtask visibility toggle */}
        {hasSubtasks && completedSubtaskCount > 0 && (
          <button
            className={`task-visibility-btn ${showCompletedSubtasks ? 'active' : ''}`}
            onClick={() => setShowCompletedSubtasks(current => !current)}
            aria-label={showCompletedSubtasks ? 'Hide completed subtasks' : 'Show completed subtasks'}
            title={showCompletedSubtasks ? 'Hide completed subtasks' : 'Show completed subtasks'}
          >
            {showCompletedSubtasks ? '◉' : '○'}
          </button>
        )}

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

        {isMainTask && (
          <button
            className={`task-status-btn ${isBacklogTask ? 'is-backlog' : 'is-active'}`}
            onClick={() => onUpdateTask(task.id, { status: isBacklogTask ? 'active' : 'backlog' })}
            aria-label={isBacklogTask ? 'Move goal to active' : 'Move goal to backlog'}
            title={isBacklogTask ? 'Move goal to active' : 'Move goal to backlog'}
          >
            [{isBacklogTask ? 'ACTIVATE' : 'BACKLOG'}]
          </button>
        )}
      </div>

      {/* Context display/edit */}
      {(editingContext || (task.context && showContext)) && (
        <div
          className="task-context"
          style={{ '--task-context-indent': `${task.level * 20 + 40}px` } as React.CSSProperties}
        >
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
        <div className="task-subtask-input">
          <TaskInput
            onAddTask={handleAddSubtask}
            placeholder="> NEW SUBTASK_"
            autoFocus={true}
          />
        </div>
      )}
      {isExpanded && hasVisibleSubtasks && (
        <div className="task-subtasks">
          {visibleSubtasks.map(subtask => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              now={now}
              ancestorIds={[...ancestorIds, task.id]}
              hasCompletedAncestor={hasCompletedAncestor || task.completed}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
              onToggleExpand={onToggleExpand}
              onStartTimer={onStartTimer}
              onUpdateTask={onUpdateTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
