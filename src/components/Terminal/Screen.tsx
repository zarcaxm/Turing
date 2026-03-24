import { useTasks } from "@/hooks/useTasks";
import { useEffect, useMemo, useState } from "react";
import { TaskInput } from "../TaskManger/TaskInput";
import { TaskList } from "../TaskManger/TaskList";
import { calculateCompletedScoreForRange } from "@/utils/scoring";

interface ScreenProps {
    isFullscreen: boolean;
    onToggleFullscreen: () => void | Promise<void>;
}

export function Screen({ isFullscreen, onToggleFullscreen }: ScreenProps) {
    const {
        tasks,
        addTask,
        deleteTask,
        toggleComplete,
        toggleExpand,
        updateTask,
    } = useTasks();

    type Theme = 'dark' | 'light';

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
        addTask(title, null, context);
    };

    const handleAddSubtask = (parentId: string, title: string, context?: string) => {
        addTask(title, parentId, context);
    };

    return (
        <div className="app">
            <div className="app-header">
                <h1 className="app-title">USCSS TURING </h1>
                <div className="app-subtitle">WEYLAND-YUTANI CORPORATION • SYSTEM V{APP_VERSION}</div>
                <div className="header-score">TODAY&apos;S SCORE: {todayScore} PTS</div>
                <div className="header-controls">
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

            <TaskInput onAddTask={handleAddRootTask} autoFocus={true} />

            <TaskList
                tasks={tasks}
                onToggleComplete={toggleComplete}
                onDelete={deleteTask}
                onAddSubtask={handleAddSubtask}
                onToggleExpand={toggleExpand}
                onUpdateTask={updateTask}
            />
        </div>
    );
}
