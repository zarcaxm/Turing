import { useTasks } from "@/hooks/useTasks";
import { useEffect, useMemo, useState } from "react";
import { calculateCompletedScoreForRange } from "@/utils/scoring";
import { TaskScreen } from "./TaskScreen";
import { CalendarScreen } from "./CalendarScreen";

interface ScreenProps {
    isFullscreen: boolean;
    onToggleFullscreen: () => void | Promise<void>;
}

export function Screen({ isFullscreen, onToggleFullscreen }: ScreenProps) {
    const isWebMode = typeof window !== 'undefined' && !window.electron;
    type ViewMode = 'active' | 'backlog';

    const {
        tasks,
        now,
        addTask,
        deleteTask,
        toggleComplete,
        toggleExpand,
        startTaskTimer,
        updateTask,
    } = useTasks();

    type Theme = 'dark' | 'light';

    const [viewMode, setViewMode] = useState<ViewMode>('active');
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('turing_theme');
        return (savedTheme as Theme) || 'dark';
    });

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


    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    const handleAddRootTask = (title: string, context?: string) => {
        addTask(title, null, context, viewMode);
    };

    const handleAddSubtask = (parentId: string, title: string, context?: string) => {
        addTask(title, parentId, context);
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
                <div className="tasks-panel">
                    <TaskScreen
                        tasks={visibleTasks}
                        now={now}
                        mode={viewMode}
                        onToggleComplete={toggleComplete}
                        onDelete={deleteTask}
                        onAddRootTask={handleAddRootTask}
                        onAddSubtask={handleAddSubtask}
                        onToggleExpand={toggleExpand}
                        onStartTimer={startTaskTimer}
                        onUpdateTask={updateTask}
                    />
                </div>
                <CalendarScreen tasks={tasks} />
            </div>
        </div>
    );
}
