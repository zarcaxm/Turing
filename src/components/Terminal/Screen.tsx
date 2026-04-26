import { useTasks } from "@/hooks/useTasks";
import { useEffect, useMemo, useState } from "react";
import { Task } from "@/types/task";
import { calculateCompletedScoreForRange } from "@/utils/scoring";
import { TaskScreen } from "./TaskScreen";
import { CalendarScreen } from "./CalendarScreen";

interface ScreenProps {
    isFullscreen: boolean;
    onToggleFullscreen: () => void | Promise<void>;
}

interface PendingDeleteState {
    id: string;
    title: string;
    level: number;
    hasSubtasks: boolean;
}

function findTaskById(tasks: Task[], taskId: string): Task | null {
    for (const task of tasks) {
        if (task.id === taskId) {
            return task;
        }

        const nestedMatch = findTaskById(task.subtasks, taskId);
        if (nestedMatch) {
            return nestedMatch;
        }
    }

    return null;
}

export function Screen({ isFullscreen, onToggleFullscreen }: ScreenProps) {
    const isWebMode = typeof window !== 'undefined' && !window.electron;
    type ViewMode = 'active' | 'backlog';
    type MobilePanel = 'tasks' | 'calendar';

    const {
        tasks,
        now,
        addTask,
        deleteTask,
        toggleComplete,
        toggleExpand,
        startTaskTimer,
        updateTask,
        reorderTasks,
    } = useTasks();

    type Theme = 'dark' | 'light';

    const [viewMode, setViewMode] = useState<ViewMode>('active');
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('turing_theme');
        return (savedTheme as Theme) || 'dark';
    });
    const [mobilePanel, setMobilePanel] = useState<MobilePanel>('tasks');
    const [pendingDelete, setPendingDelete] = useState<PendingDeleteState | null>(null);

    const todayScore = useMemo(() => {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        return calculateCompletedScoreForRange(
            tasks,
            startOfToday.getTime(),
            endOfToday.getTime()
        );
    }, [tasks]);

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('turing_theme', theme);
    }, [theme]);

    useEffect(() => {
        if (!pendingDelete) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setPendingDelete(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [pendingDelete]);


    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    const handleAddRootTask = (title: string, context?: string) => {
        addTask(title, null, context, viewMode);
    };

    const handleAddSubtask = (parentId: string, title: string, context?: string) => {
        addTask(title, parentId, context);
    };

    const handleRequestDelete = (taskId: string) => {
        const task = findTaskById(tasks, taskId);
        if (!task) {
            return;
        }

        setPendingDelete({
            id: task.id,
            title: task.title,
            level: task.level,
            hasSubtasks: task.subtasks.length > 0,
        });
    };

    const handleConfirmDelete = () => {
        if (!pendingDelete) {
            return;
        }

        void deleteTask(pendingDelete.id);
        setPendingDelete(null);
    };

    const visibleTasks = useMemo(
        () => tasks.filter(task => task.status === viewMode),
        [tasks, viewMode]
    );

    return (
        <div className="app">
            <div className="app-header">
                <h1 className="app-title">HYPERION </h1>
                <div className="app-subtitle">WEYLAND-YUTANI CORPORATION • SYSTEM V{APP_VERSION}</div>
                {isWebMode && (
                    <div className="app-mode-banner">WEB MODE • ELECTRON FEATURES DISABLED</div>
                )}
                <div className="header-score">TODAY&apos;S SCORE: {todayScore} PTS</div>
                <div className="header-controls">
                    <button
                        className="panel-toggle"
                        onClick={() => setMobilePanel(current => current === 'tasks' ? 'calendar' : 'tasks')}
                        aria-label={mobilePanel === 'tasks' ? 'Show completion log' : 'Show task list'}
                    >
                        [{mobilePanel === 'tasks' ? 'CALENDAR' : 'TASKS'}]
                    </button>
                    <button
                        className="view-toggle"
                        onClick={() => setViewMode(current => current === 'active' ? 'backlog' : 'active')}
                        aria-label={viewMode === 'active' ? 'Show backlog' : 'Show active goals'}
                    >
                        [{viewMode === 'active' ? 'BACKLOG' : 'ACTIVE'}]
                    </button>
                    <button
                        className="fullscreen-toggle"
                        onClick={() => void onToggleFullscreen()}
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                        [{isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN'}]
                    </button>
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        [{theme === 'dark' ? 'LIGHT' : 'DARK'} MODE]
                    </button>
                </div>
            </div>

            <div className="screen-content">
                <div className={`tasks-panel ${mobilePanel === 'tasks' ? 'is-mobile-active' : ''}`}>
                    <TaskScreen
                        tasks={visibleTasks}
                        now={now}
                        mode={viewMode}
                        onToggleComplete={toggleComplete}
                        onDelete={handleRequestDelete}
                        onAddRootTask={handleAddRootTask}
                        onAddSubtask={handleAddSubtask}
                        onToggleExpand={toggleExpand}
                        onStartTimer={startTaskTimer}
                        onUpdateTask={updateTask}
                        onReorderTasks={reorderTasks}
                    />
                </div>
                <div className={`calendar-panel ${mobilePanel === 'calendar' ? 'is-mobile-active' : ''}`}>
                    <CalendarScreen tasks={tasks} />
                </div>
            </div>

            {pendingDelete && (
                <div
                    className="confirm-modal-backdrop"
                    role="presentation"
                    onClick={() => setPendingDelete(null)}
                >
                    <div
                        className="confirm-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-confirm-title"
                        aria-describedby="delete-confirm-description"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="confirm-modal-title" id="delete-confirm-title">
                            CONFIRM DELETE
                        </div>
                        <div className="confirm-modal-copy" id="delete-confirm-description">
                            Delete {pendingDelete.level === 0 ? 'goal' : 'task'} "{pendingDelete.title}"?
                        </div>
                        {pendingDelete.hasSubtasks && (
                            <div className="confirm-modal-warning">
                                This will also delete all nested subtasks.
                            </div>
                        )}
                        <div className="confirm-modal-actions">
                            <button
                                className="confirm-modal-btn"
                                onClick={() => setPendingDelete(null)}
                            >
                                [CANCEL]
                            </button>
                            <button
                                className="confirm-modal-btn is-danger"
                                onClick={handleConfirmDelete}
                            >
                                [DELETE]
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
