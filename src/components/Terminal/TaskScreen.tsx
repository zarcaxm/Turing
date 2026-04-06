import { Task } from "@/types/task";
import { TaskInput } from "../TaskManger/TaskInput";
import { TaskList } from "../TaskManger/TaskList";

interface TaskScreenProps {
    tasks: Task[];
    now: number;
    mode: 'active' | 'backlog';
    onAddRootTask: (title: string, context?: string) => void;
    onToggleComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onAddSubtask: (parentId: string, title: string, context?: string) => void;
    onToggleExpand: (taskId: string) => void;
    onStartTimer: (taskId: string, ancestorIds: string[]) => void;
    onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskScreen({
    tasks,
    now,
    mode,
    onAddRootTask,
    onToggleComplete,
    onDelete,
    onAddSubtask,
    onToggleExpand,
    onStartTimer,
    onUpdateTask,
}: TaskScreenProps) {
    const isBacklog = mode === 'backlog';
    const placeholder = isBacklog ? '> NEW BACKLOG GOAL' : '> NEW GOAL';

    return (
        <div className="task-screen">
            <TaskInput
                onAddTask={onAddRootTask}
                autoFocus={true}
                placeholder={placeholder}
            />

            <TaskList
                tasks={tasks}
                now={now}
                mode={mode}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onAddSubtask={onAddSubtask}
                onToggleExpand={onToggleExpand}
                onStartTimer={onStartTimer}
                onUpdateTask={onUpdateTask}
            />
        </div>
    );
}
