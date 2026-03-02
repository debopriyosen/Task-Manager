"use client";

import { useTasks, Task } from "@/contexts/TasksContext";
import { format } from "date-fns";
import { CopyCheck, RotateCcw } from "lucide-react";
import { useState } from "react";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";

export default function CompletedPage() {
    const { tasks, toggleTaskStatus } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    const completedTasks = tasks.filter(t => t.status === "completed").sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const renderTask = (task: Task) => {
        return (
            <div
                key={task.id}
                className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors cursor-pointer"
                onClick={() => setTaskToEdit(task)}
            >
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-muted-foreground line-through truncate">{task.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 opacity-70">
                        <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded">
                            Completed
                        </span>
                        {task.due_date && (
                            <span className="text-xs text-muted-foreground">
                                Was due: {format(new Date(task.due_date), "PP")}
                            </span>
                        )}
                        {task.subtasks.length > 0 && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-primary-500">
                                AI Handled
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task.id);
                    }}
                    className="p-2 ml-4 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-2 text-sm font-medium"
                >
                    <RotateCcw size={16} />
                    Restore
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="border-b border-border pb-6">
                <h1 className="text-3xl font-bold tracking-tight">Completed History</h1>
                <p className="text-muted-foreground mt-1.5 font-medium">Review to see everything you've accomplished.</p>
            </div>

            {completedTasks.length === 0 ? (
                <div className="text-center py-20 px-4">
                    <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                        <CopyCheck size={32} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No completed tasks yet</h2>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Get to work! Once you finish tasks, they will appear here as a record of your productivity.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {completedTasks.map(renderTask)}
                </div>
            )}

            <CreateTaskModal
                isOpen={isModalOpen || !!taskToEdit}
                onClose={() => {
                    setIsModalOpen(false);
                    setTaskToEdit(null);
                }}
                taskToEdit={taskToEdit}
            />
        </div>
    );
}
