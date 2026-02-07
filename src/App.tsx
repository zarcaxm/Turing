import { useState, useEffect } from 'react';
import { useTasks } from './hooks/useTasks';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import './styles/terminal.css';
import './styles/crt-effects.css';

type Theme = 'dark' | 'light';

function App() {
  const {
    tasks,
    addTask,
    deleteTask,
    toggleComplete,
    toggleExpand,
    updateTask,
  } = useTasks();

  // Theme state management
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('turing_theme');
    return (savedTheme as Theme) || 'dark';
  });

  // Apply theme to body element
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
    <div className="monitor-frame">
      <div className="monitor-bezel">
        <div className="screen-recess">
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
        </div>

        <div className="bezel-bottom">
          <div className="bezel-vent-group">
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
          </div>

          <div className="monitor-controls">
            <div className="power-led"></div>
            {/* <div className="monitor-btns">
              <div className="monitor-btn"></div>
              <div className="monitor-btn"></div>
              <div className="monitor-btn"></div>
            </div> */}
            <span className="monitor-label">WEYLAND-YUTANI</span>
          </div>

          <div className="bezel-vent-group">
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
