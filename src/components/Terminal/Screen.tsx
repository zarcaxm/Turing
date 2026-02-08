import { useTasks } from "@/hooks/useTasks";
import { useEffect, useState } from "react";
import { TaskInput } from "../TaskManger/TaskInput";
import { TaskList } from "../TaskManger/TaskList";

export function Screen() {
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
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    [{theme === 'dark' ? 'LIGHT' : 'DARK'} MODE]
                </button>
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