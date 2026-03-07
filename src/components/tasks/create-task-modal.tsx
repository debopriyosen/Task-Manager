"use client";

import { useState, useEffect } from "react";
import { X, Loader2, CalendarIcon, Bell, Trash2, FolderOpen, Activity, Clock } from "lucide-react";
import { useTasks, Subtask, Task, Project, Status } from "@/contexts/TasksContext";
import { v4 as uuidv4 } from "uuid";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskToEdit?: Task | null;
    initialProjectId?: string;
}

export function CreateTaskModal({ isOpen, onClose, taskToEdit = null, initialProjectId = "none" }: CreateTaskModalProps) {
    const { addTask, updateTask, deleteTask, projects } = useTasks();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
    const [dueDate, setDueDate] = useState("");
    const [reminderOffset, setReminderOffset] = useState("none");
    const [projectId, setProjectId] = useState<string>("none");
    const [subtasks, setSubtasks] = useState<{ id?: string; title: string; is_completed: boolean }[]>([]);
    const [status, setStatus] = useState<Status>("pending");
    const [showCustomReminder, setShowCustomReminder] = useState(false);
    const [customReminderTime, setCustomReminderTime] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                setTitle(taskToEdit.title);
                setDescription(taskToEdit.description || "");
                setPriority(taskToEdit.priority);
                if (taskToEdit.due_date) {
                    const d = new Date(taskToEdit.due_date);
                    const offset = d.getTimezoneOffset() * 60000;
                    const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
                    setDueDate(localISOTime);
                } else {
                    setDueDate("");
                }
                // Initialize reminder offset based on time difference
                if (taskToEdit.due_date && taskToEdit.reminder_time) {
                    const due = new Date(taskToEdit.due_date).getTime();
                    const rem = new Date(taskToEdit.reminder_time).getTime();
                    const diffMin = Math.round((due - rem) / 60000);

                    if (diffMin === 10) setReminderOffset("10m");
                    else if (diffMin === 60) setReminderOffset("1h");
                    else if (diffMin === 1440) setReminderOffset("1d");
                    else setReminderOffset("none");
                } else {
                    setReminderOffset("none");
                }

                setProjectId(taskToEdit.projectId || "none");
                setSubtasks(taskToEdit.subtasks);
                setStatus(taskToEdit.status);
            } else {
                setTitle("");
                setDescription("");
                setPriority("medium");
                setDueDate("");
                setReminderOffset("none");
                setProjectId(initialProjectId);
                setSubtasks([]);
                setStatus("pending");
            }
        }
    }, [isOpen, taskToEdit]);

    if (!isOpen) return null;



    const handleCreate = () => {
        if (!title.trim()) return;

        let reminderTime: string | undefined = undefined;
        if (showCustomReminder && customReminderTime) {
            reminderTime = new Date(customReminderTime).toISOString();
        } else if (dueDate && reminderOffset !== "none") {
            const due = new Date(dueDate);
            if (reminderOffset === "10m") due.setMinutes(due.getMinutes() - 10);
            else if (reminderOffset === "1h") due.setHours(due.getHours() - 1);
            else if (reminderOffset === "1d") due.setDate(due.getDate() - 1);
            reminderTime = due.toISOString();
        }

        const formattedSubtasks = subtasks.filter(t => t.title.trim()).map(t => ({
            id: t.id || uuidv4(),
            title: t.title,
            is_completed: t.is_completed || false
        }));

        const finalProjectId = projectId === "none" ? undefined : projectId;

        if (taskToEdit) {
            updateTask(taskToEdit.id, {
                title,
                description,
                priority,
                projectId: finalProjectId,
                due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
                reminder_time: reminderTime || (reminderOffset === "none" ? undefined : taskToEdit.reminder_time),
                reminder_sent: (reminderTime !== undefined && reminderTime !== taskToEdit.reminder_time) ? false : taskToEdit.reminder_sent,
                subtasks: formattedSubtasks,
                status,
            });
        } else {
            addTask({
                title,
                description,
                priority,
                projectId: finalProjectId,
                due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
                reminder_time: reminderTime,
                subtasks: formattedSubtasks,
            });
        }

        onClose();
    };

    const handleDelete = () => {
        if (taskToEdit) {
            deleteTask(taskToEdit.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/20 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/50 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-indigo-50/80 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent pointer-events-none" />
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight relative z-10">{taskToEdit ? "Edit Task" : "Create New Task"}</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-indigo-50 rounded-full transition-all relative z-10">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Task Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Launch new website"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-indigo-100/50 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-slate-700 placeholder:text-slate-400 shadow-sm"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add more details..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-indigo-100/50 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none resize-none transition-all text-slate-700 placeholder:text-slate-400 shadow-sm"
                        />
                    </div>

                    {/* Schedule Section */}
                    <div className="p-5 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <CalendarIcon size={18} className="text-indigo-600" />
                            <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Schedule & Reminders</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Due Date</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="datetime-local"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-indigo-100/50 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm text-slate-700 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Reminder</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: "None", value: "none" },
                                        { label: "10m", value: "10m" },
                                        { label: "1h", value: "1h" },
                                        { label: "1d", value: "1d" }
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                setReminderOffset(opt.value);
                                                setShowCustomReminder(false);
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${reminderOffset === opt.value && !showCustomReminder
                                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                                : "bg-white text-slate-600 border border-indigo-100/50 hover:border-indigo-300"
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setShowCustomReminder(!showCustomReminder)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showCustomReminder
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                            : "bg-white text-slate-600 border border-indigo-100/50 hover:border-indigo-300"
                                            }`}
                                    >
                                        Custom
                                    </button>
                                </div>
                            </div>
                        </div>

                        {showCustomReminder && (
                            <div className="animate-in slide-in-from-top-2 duration-200">
                                <label className="block text-[10px] font-bold text-indigo-600 mb-1.5 uppercase tracking-widest pl-1">Custom Reminder Time</label>
                                <div className="relative">
                                    <Bell className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={16} />
                                    <input
                                        type="datetime-local"
                                        value={customReminderTime}
                                        onChange={(e) => setCustomReminderTime(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm text-slate-700 shadow-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {dueDate && (reminderOffset !== "none" || showCustomReminder) && (
                            <p className="text-[11px] text-indigo-600 font-medium pl-1 flex items-center gap-1.5">
                                <Bell size={12} />
                                Alert will fire at: {(() => {
                                    if (showCustomReminder && customReminderTime) return new Date(customReminderTime).toLocaleString();
                                    const due = new Date(dueDate);
                                    if (reminderOffset === "10m") due.setMinutes(due.getMinutes() - 10);
                                    else if (reminderOffset === "1h") due.setHours(due.getHours() - 1);
                                    else if (reminderOffset === "1d") due.setDate(due.getDate() - 1);
                                    return due.toLocaleString();
                                })()}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Priority</label>
                            <div className="flex gap-2">
                                {["low", "medium", "high"].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(p as any)}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all border ${priority === p
                                            ? p === "high" ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20" :
                                                p === "medium" ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20" :
                                                    "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {taskToEdit && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Status</label>
                                <div className="relative">
                                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as Status)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 border border-indigo-100/50 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-sm appearance-none text-slate-700 shadow-sm cursor-pointer"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="on_track">On Track</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Project / Subject</label>
                            <div className="relative">
                                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <select
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 border border-indigo-100/50 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-sm appearance-none text-slate-700 shadow-sm cursor-pointer"
                                >
                                    <option value="none">No Project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Manual Subtasks Section */}
                    <div className="p-4 rounded-xl border border-slate-100/50 bg-slate-50/30">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subtasks</p>
                            {subtasks.map((task, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm bg-white/50 p-2 rounded-lg border border-slate-200/50 shadow-sm">
                                    <div className="w-5 h-5 rounded-full border border-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] text-slate-500 mt-0.5 bg-slate-50/50">{idx + 1}</div>
                                    <input
                                        type="text"
                                        value={task.title}
                                        onChange={(e) => {
                                            const newTasks = [...subtasks];
                                            newTasks[idx] = { ...newTasks[idx], title: e.target.value };
                                            setSubtasks(newTasks);
                                        }}
                                        className="bg-transparent border-none outline-none w-full text-slate-800"
                                    />
                                    <button onClick={() => setSubtasks(subtasks.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition-colors p-0.5">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => setSubtasks([...subtasks, { title: "", is_completed: false }])} className="text-xs text-indigo-600 font-medium hover:underline mt-2 inline-block">
                                + Add subtask
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 p-4 sm:p-6 border-t border-indigo-50/80 bg-slate-50/50 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
                    {taskToEdit ? (
                        <button onClick={handleDelete} className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                            <Trash2 size={18} />
                            Delete
                        </button>
                    ) : <div className="hidden sm:block" />}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button onClick={onClose} className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl font-medium text-slate-500 hover:bg-slate-200/50 transition-colors text-center">
                            Cancel
                        </button>
                        <button onClick={handleCreate} className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 text-center">
                            {taskToEdit ? "Save Changes" : "Create Task"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
