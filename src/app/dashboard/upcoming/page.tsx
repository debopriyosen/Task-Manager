"use client";

import { useTasks, Task } from "@/contexts/TasksContext";
import { format, isAfter, isToday, startOfDay } from "date-fns";
import { CalendarDays, CheckCircle2, Clock, Activity } from "lucide-react";
import { useState } from "react";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";

export default function UpcomingPage() {
    const { tasks, toggleTaskStatus } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    // Filter tasks due strictly after today, pending ones
    const upcomingTasks = tasks.filter(t => {
        if (!t.due_date) return false;
        const due = new Date(t.due_date);
        return isAfter(startOfDay(due), startOfDay(new Date())) && !isToday(due) && (t.status === "pending" || t.status === "on_track");
    }).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

    // Group by date string (e.g. "Tomorrow")
    const groupedTasks = upcomingTasks.reduce((acc, task) => {
        const due = new Date(task.due_date!);
        const dueStr = format(due, "EEEE, MMMM do");
        if (!acc[dueStr]) acc[dueStr] = [];
        acc[dueStr].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    const renderTask = (task: Task) => {
        const isCompleted = task.status === "completed";
        const isOnTrack = task.status === "on_track";
        return (
            <div
                key={task.id}
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setTaskToEdit(task)}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskStatus(task.id);
                        }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${isCompleted ? 'bg-success border-success text-white' :
                                isOnTrack ? 'bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' :
                                    'border-border text-transparent hover:border-success hover:text-success'
                            }`}
                    >
                        {isOnTrack ? <Activity size={14} /> : <CheckCircle2 size={16} />}
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{task.title}</p>
                            {isOnTrack && <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">On Track</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${task.priority === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                                task.priority === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                }`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock size={12} />
                                {format(new Date(task.due_date!), "h:mm a")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
                <div className="border-b border-border pb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Upcoming</h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Your scheduled tasks beyond today.</p>
                </div>

                {Object.keys(groupedTasks).length === 0 ? (
                    <div className="text-center py-20 px-4">
                        <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarDays size={32} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Your schedule is clear</h2>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">No upcoming tasks found. Enjoy your free time or start planning.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedTasks).map(([dateLabel, tasks], groupIndex) => (
                            <div key={dateLabel} className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${groupIndex * 75}ms` }}>
                                <div className="bg-muted/50 px-5 py-3 border-b border-border">
                                    <h2 className="font-semibold text-sm">{dateLabel}</h2>
                                </div>
                                <div className="p-2 space-y-1">
                                    {tasks.map(renderTask)}
                                </div>
                            </div>
                        ))}
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
