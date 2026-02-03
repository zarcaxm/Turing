import { useTasks } from './hooks/useTasks';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import './styles/terminal.css';
import './styles/crt-effects.css';

function App() {
  const {
    tasks,
    addTask,
    deleteTask,
    toggleComplete,
    toggleExpand,
  } = useTasks();

  const handleAddRootTask = (title: string) => {
    addTask(title, null);
  };

  const handleAddSubtask = (parentId: string, title: string) => {
    addTask(title, parentId);
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="app-header">
        <h1 className="app-title">USCSS TURING </h1>
        <div className="app-subtitle">WEYLAND-YUTANI CORPORATION • SYSTEM V4.2.1</div>
      </div>

      {/* Task Input */}
      <TaskInput onAddTask={handleAddRootTask} autoFocus={true} />

      {/* Task List */}
      <TaskList
        tasks={tasks}
        onToggleComplete={toggleComplete}
        onDelete={deleteTask}
        onAddSubtask={handleAddSubtask}
        onToggleExpand={toggleExpand}
      />
    </div>
  );
}

export default App;
