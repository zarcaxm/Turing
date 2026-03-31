import { Task } from "@/types/task";
import { TaskInput } from "../TaskManger/TaskInput";
import { TaskList } from "../TaskManger/TaskList";

interface TaskScreenProps {
    tasks: Task[];
    now: number;
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
    onAddRootTask,
    onToggleComplete,
    onDelete,
    onAddSubtask,
    onToggleExpand,
    onStartTimer,
    onUpdateTask,
}: TaskScreenProps) {

    return (
        <div className="task-screen">
            <TaskInput onAddTask={onAddRootTask} autoFocus={true} />

            <TaskList
                tasks={tasks}
                now={now}
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
