import { useMemo, useState } from 'react';
import { Task } from '@/types/task';
import { TaskInput } from '../TaskManger/TaskInput';
import { calculateTotalScore } from '@/utils/scoring';
import { formatElapsedTime, getTaskElapsedTime, getTaskTotalElapsedTime } from '@/utils/time';

interface FocusScreenProps {
  rootTask: Task;
  now: number;
  onExit: () => void;
  onToggleComplete: (taskId: string) => void;
  onStartTimer: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, title: string, context?: string) => void;
}

interface FocusSnapshot {
  objective: Task;
  path: Task[];
  leafCount: number;
  completedLeafCount: number;
  completedScore: number;
  recentCompleted: Task[];
}

function findNextObjective(task: Task): Task | null {
  if (task.completed) {
    return null;
  }

  for (const subtask of task.subtasks) {
    const match = findNextObjective(subtask);
    if (match) {
      return match;
    }
  }

  return task;
}

function collectFocusSnapshot(rootTask: Task): FocusSnapshot {
  const objective = findNextObjective(rootTask) ?? rootTask;
  const path: Task[] = [];
  const recentCompleted: Task[] = [];
  let leafCount = 0;
  let completedLeafCount = 0;

  function walk(task: Task, currentPath: Task[]): boolean {
    const nextPath = [...currentPath, task];
    const isLeaf = task.subtasks.length === 0;

    if (isLeaf) {
      leafCount += 1;
      if (task.completed) {
        completedLeafCount += 1;
        recentCompleted.push(task);
      }
    }

    let containsObjective = task.id === objective.id;
    for (const subtask of task.subtasks) {
      containsObjective = walk(subtask, nextPath) || containsObjective;
    }

    if (containsObjective && path.length === 0) {
      path.push(...nextPath);
    }

    return containsObjective;
  }

  walk(rootTask, []);

  recentCompleted.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

  return {
    objective,
    path,
    leafCount,
    completedLeafCount,
    completedScore: calculateTotalScore([rootTask]),
    recentCompleted: recentCompleted.slice(0, 5),
  };
}

export function FocusScreen({
  rootTask,
  now,
  onExit,
  onToggleComplete,
  onStartTimer,
  onUpdateTask,
  onAddSubtask,
}: FocusScreenProps) {
  const [showSplitInput, setShowSplitInput] = useState(false);
  const snapshot = useMemo(() => collectFocusSnapshot(rootTask), [rootTask]);
  const { objective, path, leafCount, completedLeafCount, completedScore, recentCompleted } = snapshot;
  const isMissionComplete = rootTask.completed || (leafCount > 0 && completedLeafCount === leafCount);
  const objectiveElapsedTime = getTaskElapsedTime(objective, now);
  const totalElapsedTime = getTaskTotalElapsedTime(rootTask, now);
  const isTimerRunning = Boolean(objective.timerStartedAt);
  const progressPercent = leafCount === 0 ? 0 : Math.round((completedLeafCount / leafCount) * 100);

  const handleToggleTimer = () => {
    if (objective.completed || rootTask.status === 'backlog') {
      return;
    }

    if (isTimerRunning) {
      onUpdateTask(objective.id, {
        elapsedTimeMs: objectiveElapsedTime,
        timerStartedAt: null,
      });
      return;
    }

    onStartTimer(objective.id);
  };

  const handleAddSubtask = (title: string, context?: string) => {
    onAddSubtask(objective.id, title, context);
    setShowSplitInput(false);
  };

  return (
    <div className="focus-screen" aria-label="Mission focus mode">
      <div className="focus-header">
        <div>
          <div className="focus-kicker">MISSION FOCUS</div>
          <h2 className="focus-title">
            <span className="task-number">{rootTask.number}.</span> {rootTask.title}
          </h2>
        </div>
        <button className="focus-action-btn" onClick={onExit}>
          [EXIT]
        </button>
      </div>

      <div className="focus-grid">
        <section className="focus-panel focus-objective-panel">
          <div className="focus-panel-label">CURRENT OBJECTIVE</div>
          <div className="focus-path">
            {path.map((task, index) => (
              <span key={task.id}>
                {index > 0 && <span className="focus-path-separator">/</span>}
                {task.title}
              </span>
            ))}
          </div>
          <div className="focus-objective">
            <span className="task-number">{objective.number}.</span> {objective.title}
          </div>
          {objective.context && (
            <div className="focus-context">
              <span className="task-context-label">CONTEXT:</span> {objective.context}
            </div>
          )}

          <div className="focus-command-row">
            <button
              className="focus-action-btn"
              onClick={() => onToggleComplete(objective.id)}
              disabled={objective.completed || rootTask.status === 'backlog'}
            >
              [DONE]
            </button>
            <button
              className={`focus-action-btn ${isTimerRunning ? 'active' : ''}`}
              onClick={handleToggleTimer}
              disabled={objective.completed || rootTask.status === 'backlog'}
            >
              [{isTimerRunning ? 'PAUSE' : 'START'}]
            </button>
            <button
              className="focus-action-btn"
              onClick={() => setShowSplitInput(current => !current)}
              disabled={objective.completed}
            >
              [SPLIT]
            </button>
          </div>

          {showSplitInput && (
            <div className="focus-split-input">
              <TaskInput
                onAddTask={handleAddSubtask}
                placeholder="> SPLIT INTO NEXT SUBTASK_"
                autoFocus={true}
              />
            </div>
          )}
        </section>

        <section className="focus-panel">
          <div className="focus-panel-label">TELEMETRY</div>
          <div className="focus-stat-list">
            <div className="focus-stat">
              <span>MISSION PROGRESS</span>
              <strong>{completedLeafCount}/{leafCount} LEAF TASKS</strong>
            </div>
            <div className="focus-progress" aria-label={`Mission progress ${progressPercent}%`}>
              <div className="focus-progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="focus-stat">
              <span>POINTS SECURED</span>
              <strong>{completedScore} PTS</strong>
            </div>
            <div className="focus-stat">
              <span>OBJECTIVE TIMER</span>
              <strong>{formatElapsedTime(objectiveElapsedTime)}</strong>
            </div>
            <div className="focus-stat">
              <span>MISSION TIME</span>
              <strong>{formatElapsedTime(totalElapsedTime)}</strong>
            </div>
            <div className="focus-status">
              {isMissionComplete ? 'MISSION READY FOR FINAL CHECK' : 'MISSION IN PROGRESS'}
            </div>
          </div>
        </section>
      </div>

      <section className="focus-panel focus-log-panel">
        <div className="focus-panel-label">MISSION LOG</div>
        {recentCompleted.length === 0 ? (
          <div className="focus-empty-log">NO COMPLETED OBJECTIVES RECORDED</div>
        ) : (
          <ol className="focus-log-list">
            {recentCompleted.map(task => (
              <li key={task.id}>
                <span>{task.title}</span>
                <strong>+{task.score} PTS</strong>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
