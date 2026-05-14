import { useEffect, useState } from 'react';
import { Task } from '../../types/task';
import { TaskInput } from './TaskInput';
import { calculateTotalScore } from '../../utils/scoring';
import { formatElapsedTime, getTaskElapsedTime, getTaskTotalElapsedTime } from '../../utils/time';

interface TaskItemProps {
  task: Task;
  now: number;
  hasCompletedAncestor?: boolean;
  forceShowCompletedTasks?: boolean;
  parentDisplayNumber?: string;
  siblingIds: string[];
  reorderAnimation?: 'up' | 'down';
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onAddSubtask: (parentId: string, title: string, context?: string) => void;
  onToggleExpand: (taskId: string) => void;
  onStartTimer: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onMoveTask: (taskId: string, direction: -1 | 1) => void;
  onReorderTasks: (taskIds: string[]) => void;
}

export function TaskItem({
  task,
  now,
  hasCompletedAncestor = false,
  forceShowCompletedTasks = false,
  parentDisplayNumber,
  siblingIds,
  reorderAnimation,
  onToggleComplete,
  onDelete,
  onAddSubtask,
  onToggleExpand,
  onStartTimer,
  onUpdateTask,
  onMoveTask,
  onReorderTasks
}: TaskItemProps) {
  const [showInput, setShowInput] = useState(false);
  const [showContext, setShowContext] = useState(true);
  const [editingContext, setEditingContext] = useState(false);
  const [showCompletedSubtasks, setShowCompletedSubtasks] = useState(false);
  const [subtaskReorderAnimation, setSubtaskReorderAnimation] = useState<Record<string, 'up' | 'down'>>({});
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
  const hasIncompleteSubtasks = task.subtasks.some(subtask => !subtask.completed);
  const completedSubtaskCount = task.subtasks.filter(subtask => subtask.completed).length;
  const isBacklogTask = task.status === 'backlog';
  const isPlanningOnly = isBacklogTask;
  const canShowCompletedSubtasks = !isBacklogTask;
  const shouldShowCompletedSubtasks = canShowCompletedSubtasks && (forceShowCompletedTasks || showCompletedSubtasks);
  const visibleSubtasks = shouldShowCompletedSubtasks
    ? task.subtasks
    : task.subtasks.filter(subtask => !subtask.completed);
  const hasVisibleSubtasks = visibleSubtasks.length > 0;
  const isExpanded = task.expanded !== false; // Default to true if undefined
  const isMainTask = task.level === 0;
  const ownElapsedTime = getTaskElapsedTime(task, now);
  const totalElapsedTime = getTaskTotalElapsedTime(task, now);
  const isTimerRunning = Boolean(task.timerStartedAt);
  const shouldShowTimerButton = !isPlanningOnly && (!hasIncompleteSubtasks || isTimerRunning);
  const isCompletionLocked = hasCompletedAncestor;
  const displayScore = task.completed
    ? (hasSubtasks ? calculateTotalScore(task.subtasks) : task.score)
    : task.score;
  const siblingIndex = siblingIds.indexOf(task.id);
  const displayNumber = siblingIndex >= 0
    ? parentDisplayNumber
      ? `${parentDisplayNumber}.${siblingIndex + 1}`
      : `${siblingIndex + 1}`
    : task.number;
  const canMoveUp = siblingIndex > 0;
  const canMoveDown = siblingIndex >= 0 && siblingIndex < siblingIds.length - 1;
  const animationClass = reorderAnimation ? `is-reordering-${reorderAnimation}` : '';

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

    onStartTimer(task.id);
  };

  useEffect(() => {
    if (Object.keys(subtaskReorderAnimation).length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSubtaskReorderAnimation({});
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [subtaskReorderAnimation]);

  return (
    <div
      className={`task-item ${animationClass}`.trim()}
      style={{ '--task-indent': `${task.level * 20}px` } as React.CSSProperties}
    >
      <div className={`task-content ${isMainTask ? 'is-main-task' : ''}`}>
        {/* Expand/Collapse button */}
        {hasVisibleSubtasks && (
          <button
            className="task-expand-btn"
            onClick={() => onToggleExpand(task.id)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            title={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
          >
            {isExpanded ? '▼' : '►'}
          </button>
        )}

        <div className="task-reorder-controls" aria-label="Priority controls">
          <button
            className="task-reorder-btn"
            onClick={() => onMoveTask(task.id, -1)}
            disabled={!canMoveUp}
            aria-label="Move task up"
            title="Move task up"
          >
            ▲
          </button>
          <button
            className="task-reorder-btn"
            onClick={() => onMoveTask(task.id, 1)}
            disabled={!canMoveDown}
            aria-label="Move task down"
            title="Move task down"
          >
            ▼
          </button>
        </div>

        {/* Checkbox */}
        <button
          className={`task-checkbox ${task.completed ? 'completed' : ''} ${isCompletionLocked || isPlanningOnly ? 'locked' : ''}`}
          onClick={() => {
            if (isCompletionLocked || isPlanningOnly) return;
            onToggleComplete(task.id);
          }}
          disabled={isCompletionLocked || isPlanningOnly}
          aria-label={isPlanningOnly ? 'Backlog tasks cannot be completed' : isCompletionLocked ? 'Completion locked by completed parent task' : 'Toggle completion'}
          title={isPlanningOnly ? 'Activate this goal to mark tasks complete' : isCompletionLocked ? 'Uncheck the parent task first' : 'Toggle completion'}
        >
          {isPlanningOnly ? 'B' : isCompletionLocked ? '!' : ' '}
        </button>

        {/* Task number and title - click to toggle context */}
        <span
          className={`task-title ${task.completed ? 'completed' : ''}`}
          onClick={() => task.context && setShowContext(!showContext)}
          style={{ cursor: task.context ? 'pointer' : 'default' }}
        >
          <span className="task-number">{displayNumber}.</span> {task.title}
        </span>

        {/* Score badge */}
        <span className="task-score">[{displayScore} PTS]</span>

        {!isPlanningOnly && (
          <div className="task-timer-group">
            <span className="task-timer">
              [{hasSubtasks ? `TOTAL ${formatElapsedTime(totalElapsedTime)}` : formatElapsedTime(ownElapsedTime)}]
            </span>
            {shouldShowTimerButton && (
              <button
              className={`task-timer-btn ${isTimerRunning ? 'active' : ''}`}
              onClick={handleToggleTimer}
              disabled={task.completed || isPlanningOnly}
              aria-label={isPlanningOnly ? 'Backlog tasks cannot run timers' : isTimerRunning ? 'Pause timer' : 'Start timer'}
              title={isPlanningOnly ? 'Activate this goal to run timers' : isTimerRunning ? 'Pause timer' : 'Start timer'}
            >
              {isTimerRunning ? '❚❚' : '▶'}
              </button>
            )}
          </div>
        )}

        {/* Completed subtask visibility toggle */}
        {canShowCompletedSubtasks && hasSubtasks && completedSubtaskCount > 0 && (
          <button
            className={`task-visibility-btn ${shouldShowCompletedSubtasks ? 'active' : ''}`}
            onClick={() => setShowCompletedSubtasks(current => !current)}
            aria-label={shouldShowCompletedSubtasks ? 'Hide completed subtasks' : 'Show completed subtasks'}
            title={forceShowCompletedTasks ? 'Showing checked subtasks with checked goals' : shouldShowCompletedSubtasks ? 'Hide checked subtasks' : 'Show checked subtasks'}
            disabled={forceShowCompletedTasks}
          >
            {shouldShowCompletedSubtasks ? '◉' : '○'}
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
              title="Add subtask"
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
          title="Delete task"
        >
          ×
        </button>

        {/* Edit context button */}
        <button
          className="task-context-btn"
          onClick={() => setEditingContext(!editingContext)}
          aria-label="Edit context"
          title="Edit task details"
        >
          :
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
          {(() => {
            const childSiblingIds = visibleSubtasks.map(childTask => childTask.id);

            const moveSubtask = (taskId: string, direction: -1 | 1) => {
              const currentVisibleIndex = childSiblingIds.indexOf(taskId);
              const nextTaskId = childSiblingIds[currentVisibleIndex + direction];

              if (currentVisibleIndex < 0 || !nextTaskId) {
                return;
              }

              setSubtaskReorderAnimation({
                [taskId]: direction === -1 ? 'up' : 'down',
                [nextTaskId]: direction === -1 ? 'down' : 'up',
              });

              const allChildIds = task.subtasks.map(childTask => childTask.id);
              const currentIndex = allChildIds.indexOf(taskId);
              const nextIndex = allChildIds.indexOf(nextTaskId);

              if (currentIndex < 0 || nextIndex < 0) {
                return;
              }

              const nextIds = [...allChildIds];
              [nextIds[currentIndex], nextIds[nextIndex]] = [nextIds[nextIndex], nextIds[currentIndex]];
              onReorderTasks(nextIds);
            };

            return visibleSubtasks.map(subtask => (
              <TaskItem
                key={subtask.id}
                task={subtask}
                now={now}
                hasCompletedAncestor={hasCompletedAncestor || task.completed}
                forceShowCompletedTasks={forceShowCompletedTasks}
                parentDisplayNumber={displayNumber}
                siblingIds={childSiblingIds}
                reorderAnimation={subtaskReorderAnimation[subtask.id]}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onAddSubtask={onAddSubtask}
                onToggleExpand={onToggleExpand}
                onStartTimer={onStartTimer}
                onUpdateTask={onUpdateTask}
                onMoveTask={moveSubtask}
                onReorderTasks={onReorderTasks}
              />
            ));
          })()}
        </div>
      )}
    </div>
  );
}
