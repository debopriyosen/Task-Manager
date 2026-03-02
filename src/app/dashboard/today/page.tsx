"use client";

import { useTasks, Task } from "@/contexts/TasksContext";
import { format } from "date-fns";
import { CheckCircle2, Plus, Activity } from "lucide-react";
import { useState } from "react";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";

export default function TodayPage() {
    const { tasks, toggleTaskStatus } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    // Filter for today's tasks
    const todayTasks = tasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString());

    // Split into pending and completed
    const pendingTasks = todayTasks.filter(t => t.status === "pending" || t.status === "on_track").sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
    const completedTasks = todayTasks.filter(t => t.status === "completed");

    const renderTask = (task: Task) => {
        const isCompleted = task.status === "completed";
        const isOnTrack = task.status === "on_track";
        const completedSubtasks = task.subtasks.filter(st => st.is_completed).length;
        const progress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;

        return (
            <div
                key={task.id}
                className="group flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all cursor-pointer"
                onClick={() => setTaskToEdit(task)}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task.id);
                    }}
                    className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-success border-success text-white' :
                            isOnTrack ? 'bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' :
                                'border-border text-transparent hover:border-success hover:text-success'
                        }`}
                >
                    {isOnTrack ? <Activity size={14} /> : <CheckCircle2 size={16} />}
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 truncate">
                            <h3 className={`font-semibold truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h3>
                            {isOnTrack && <span className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">On Track</span>}
                        </div>
                        <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                            task.priority === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                    </div>

                    {task.description && (
                        <p className={`text-sm mt-1 truncate ${isCompleted ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                            {task.description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                        <div className="text-xs font-medium text-muted-foreground bg-muted hover:bg-muted/80 px-2 py-1 rounded-md transition-colors">
                            {format(new Date(task.due_date!), "h:mm a")}
                        </div>

                        {task.reminder_time && !isCompleted && (
                            <div className="text-xs text-muted-foreground/80 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                                Reminder set
                            </div>
                        )}
                    </div>

                    {task.subtasks.length > 0 && !isCompleted && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
                                <span>Progress: {completedSubtasks}/{task.subtasks.length}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Today</h1>
                        <p className="text-muted-foreground mt-1.5 font-medium">{format(new Date(), "EEEE, MMMM do")}</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-primary-600/20 active:scale-95"
                    >
                        <Plus size={18} />
                        Add Task
                    </button>
                </div>

                {todayTasks.length === 0 ? (
                    <div className="text-center py-20 px-4 bg-card border border-border border-dashed rounded-3xl">
                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No tasks due today</h2>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Take a break or plan ahead by adding some new tasks for today.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm hover:underline"
                        >
                            + Create your first task
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {pendingTasks.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-1">Remaining ({pendingTasks.length})</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pendingTasks.map(renderTask)}
                                </div>
                            </div>
                        )}

                        {completedTasks.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-semibold text-success uppercase tracking-wider pl-1">Completed ({completedTasks.length})</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
                                    {completedTasks.map(renderTask)}
                                </div>
                            </div>
                        )}

                        {pendingTasks.length === 0 && completedTasks.length > 0 && (
                            <div className="text-center py-12 px-4">
                                <p className="text-success font-medium">All caught up for today! 🎉</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CreateTaskModal
                isOpen={isModalOpen || !!taskToEdit}
                onClose={() => {
                    setIsModalOpen(false);
                    setTaskToEdit(null);
                }}
                taskToEdit={taskToEdit}
            />
        </>
    );
}
