"use client";

import { useState } from "react";
import { Clock, CheckCircle2, AlertCircle, Plus, FolderPlus, Activity, Bell } from "lucide-react";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { useTasks, Task } from "@/contexts/TasksContext";
import { format } from "date-fns";

export default function DashboardPage() {
    const { tasks, reminders, toggleTaskStatus, projects, userName } = useTasks();
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
                className="group flex items-start gap-3 p-4 -mx-4 sm:p-4 sm:mx-0 rounded-2xl border border-transparent hover:border-border/50 hover:bg-card/50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                onClick={() => setTaskToEdit(task)}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task.id);
                    }}
                    className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-success border-success text-white' :
                        isOnTrack ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                            'border-slate-300 dark:border-slate-600 text-transparent hover:border-success hover:text-success'
                        }`}
                >
                    {isOnTrack ? <Activity size={12} /> : <CheckCircle2 size={14} />}
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className={`font-medium text-sm break-words text-slate-900 dark:text-slate-100 ${isCompleted ? 'line-through text-slate-500' : ''}`}>{task.title}</p>
                            {isOnTrack && <span className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">On Track</span>}
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
                            <div className="flex items-center gap-1.5">
                                <p className="text-xs text-muted-foreground">Due {format(new Date(task.due_date), "PP p")}</p>
                                {task.reminder_time && !task.reminder_sent && (
                                    <div className="flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                                        <Bell size={10} />
                                        Reminder Set
                                    </div>
                                )}
                            </div>
                        )}
                        {task.projectId && projects.find(p => p.id === task.projectId) && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md text-white shadow-sm ${projects.find(p => p.id === task.projectId)?.color || 'bg-primary-500'}`}>
                                {projects.find(p => p.id === task.projectId)?.name}
                            </span>
                        )}
                    </div>

                    {task.subtasks.length > 0 && !isCompleted && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                                <span>{completedSubtasks} of {task.subtasks.length} subtasks</span>
                                <span className={progress === 100 ? "text-emerald-600 dark:text-emerald-400" : ""}>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden relative">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out relative ${progress === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                                        progress > 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.3)]' :
                                            'bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]'
                                        }`}
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-progress-shine" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const pendingPriorityTasks = tasks.filter(t => (t.status === "pending" || t.status === "on_track") && t.priority === "high").slice(0, 5);
    const upcomingTasks = tasks.filter(t => (t.status === "pending" || t.status === "on_track") && t.due_date && new Date(t.due_date) >= new Date()).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()).slice(0, 4);

    const todayString = format(new Date(), "yyyy-MM-dd");
    const todayReminders = reminders.filter(r => r.date === todayString);
    const upcomingReminders = reminders.filter(r => r.date > todayString).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 4);

    return (
        <>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="w-full sm:w-auto">
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>Good Morning,</span> <span className="text-blue-600 dark:text-blue-400 font-extrabold break-all">{userName}</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Here's your productivity overview for today.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        <button
                            onClick={() => setIsProjectModalOpen(true)}
                            className="flex items-center justify-center gap-1 sm:gap-2 bg-card border border-border hover:bg-muted/50 transition-colors text-foreground px-2 sm:px-5 py-2.5 rounded-xl font-medium shadow-sm active:scale-95 text-sm sm:text-base whitespace-nowrap"
                        >
                            <FolderPlus size={18} className="shrink-0" />
                            <span className="truncate">Create Project</span>
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-1 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-2 sm:px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-600/20 active:scale-95 hover:shadow-md hover:-translate-y-0.5 text-sm sm:text-base whitespace-nowrap"
                        >
                            <Plus size={18} className="shrink-0" />
                            <span className="truncate">Create Task</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="bg-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-default">
                                <div className={`p-4 rounded-xl ${stat.bg}`}>
                                    <Icon className={stat.color} size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Main Tasks List */}
                        <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">High Priority Tasks</h2>
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
                        <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Upcoming</h2>
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

                        {/* Today's Reminders */}
                        {(todayReminders.length > 0) && (
                            <div className="bg-card border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                                    <Clock size={18} /> Today's Reminders
                                </h2>
                                <div className="space-y-3">
                                    {todayReminders.map(r => (
                                        <div key={r.id} className="flex items-center gap-3 bg-white/60 dark:bg-slate-900/50 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${r.color}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{r.title}</p>
                                                {r.time && <p className="text-xs text-indigo-600/80 dark:text-indigo-400 font-medium">{r.time}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Reminders */}
                        <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Upcoming Reminders</h2>
                            <div className="space-y-4">
                                {upcomingReminders.length > 0 ? upcomingReminders.map(r => (
                                    <div key={r.id} className="flex items-center gap-3 p-2 -mx-2 rounded-lg transition-colors">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.color}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{r.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{format(new Date(r.date + "T00:00:00"), "MMM d, yyyy")} {r.time ? `at ${r.time}` : ''}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No upcoming reminders.</p>
                                )}
                            </div>
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
