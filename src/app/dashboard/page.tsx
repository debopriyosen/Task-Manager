"use client";

import { useState } from "react";
import { Clock, CheckCircle2, AlertCircle, Plus, FolderPlus, Activity } from "lucide-react";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { useTasks, Task } from "@/contexts/TasksContext";
import { format } from "date-fns";

export default function DashboardPage() {
    const { tasks, toggleTaskStatus, projects, userName } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    // Computed Stats
    const todayTasks = tasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString());
    const completedTasks = tasks.filter(t => t.status === "completed");
    const overdueTasks = tasks.filter(t => t.status === "pending" && t.due_date && new Date(t.due_date) < new Date());

    const stats = [
        { title: "Today's Tasks", value: todayTasks.length.toString(), icon: Clock, color: "text-primary-500", bg: "bg-primary-50 dark:bg-primary-500/10" },
        { title: "Completed", value: completedTasks.length.toString(), icon: CheckCircle2, color: "text-success", bg: "bg-green-50 dark:bg-green-500/10" },
        { title: "Overdue", value: overdueTasks.length.toString(), icon: AlertCircle, color: "text-danger", bg: "bg-red-50 dark:bg-red-500/10" },
    ];

    const renderTask = (task: Task) => {
        const isCompleted = task.status === "completed";
        const isOnTrack = task.status === "on_track";
        const completedSubtasks = task.subtasks.filter(st => st.is_completed).length;
        const progress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;

        return (
            <div
                key={task.id}
                className="group flex items-start gap-3 p-3 -mx-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setTaskToEdit(task)}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task.id);
                    }}
                    className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-success border-success text-white' :
                        isOnTrack ? 'bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' :
                            'border-border text-transparent hover:border-success hover:text-success'
                        }`}
                >
                    {isOnTrack ? <Activity size={12} /> : <CheckCircle2 size={14} />}
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className={`font-medium text-sm break-words ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                            {isOnTrack && <span className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">On Track</span>}
                        </div>
                        <span className={`flex-shrink-0 w-fit text-xs font-medium px-2 py-0.5 rounded-full ${task.priority === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                            task.priority === 'medium' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                'bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400'
                            }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                        {task.due_date && (
                            <p className="text-xs text-muted-foreground">Due {format(new Date(task.due_date), "PP p")}</p>
                        )}
                        {task.projectId && projects.find(p => p.id === task.projectId) && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md text-white shadow-sm ${projects.find(p => p.id === task.projectId)?.color || 'bg-primary-500'}`}>
                                {projects.find(p => p.id === task.projectId)?.name}
                            </span>
                        )}
                    </div>

                    {task.subtasks.length > 0 && !isCompleted && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                <span>{completedSubtasks} of {task.subtasks.length} subtasks completed</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const pendingPriorityTasks = tasks.filter(t => (t.status === "pending" || t.status === "on_track") && t.priority === "high").slice(0, 5);
    const upcomingTasks = tasks.filter(t => (t.status === "pending" || t.status === "on_track") && t.due_date && new Date(t.due_date) >= new Date()).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()).slice(0, 4);

    return (
        <>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Good Morning, {userName}</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Here's your productivity overview for today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsProjectModalOpen(true)}
                            className="flex items-center gap-2 bg-card border border-border hover:bg-muted/50 transition-colors text-foreground px-5 py-2.5 rounded-xl font-medium shadow-sm active:scale-95"
                        >
                            <FolderPlus size={18} />
                            Create Project
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-primary-600/20 active:scale-95"
                        >
                            <Plus size={18} />
                            Create Task
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-all duration-200 hover:shadow-md">
                                <div className={`p-4 rounded-xl ${stat.bg}`}>
                                    <Icon className={stat.color} size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Main Tasks List */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">High Priority Tasks</h2>
                            <div className="space-y-3">
                                {pendingPriorityTasks.length > 0 ? (
                                    pendingPriorityTasks.map(renderTask)
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No high priority tasks right now. Great job!</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Upcoming Mini List */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
                            <div className="space-y-4">
                                {upcomingTasks.length > 0 ? upcomingTasks.map(t => (
                                    <div
                                        key={t.id}
                                        className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                                        onClick={() => setTaskToEdit(t)}
                                    >
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{t.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{t.due_date ? format(new Date(t.due_date), "EEEE, p") : ''}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">Nothing upcoming soon.</p>
                                )}
                            </div>
                            <button className="w-full mt-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
                                View All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <CreateTaskModal
                isOpen={isModalOpen || !!taskToEdit}
                onClose={() => {
                    setIsModalOpen(false);
                    setTaskToEdit(null);
                }}
                taskToEdit={taskToEdit}
            />

            <CreateProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
            />
        </>
    );
}
