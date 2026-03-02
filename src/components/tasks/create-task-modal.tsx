"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Loader2, CalendarIcon, Bell, Trash2, FolderOpen, Activity } from "lucide-react";
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
    const [isAiEnabled, setIsAiEnabled] = useState(false);
    const [subtasks, setSubtasks] = useState<{ id?: string; title: string; is_completed: boolean }[]>([]);
    const [status, setStatus] = useState<Status>("pending");
    const [isGenerating, setIsGenerating] = useState(false);

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
                setReminderOffset("none");
                setProjectId(taskToEdit.projectId || "none");
                setSubtasks(taskToEdit.subtasks);
                setStatus(taskToEdit.status);
                setIsAiEnabled(false);
            } else {
                setTitle("");
                setDescription("");
                setPriority("medium");
                setDueDate("");
                setReminderOffset("none");
                setProjectId(initialProjectId);
                setSubtasks([]);
                setStatus("pending");
                setIsAiEnabled(false);
            }
        }
    }, [isOpen, taskToEdit]);

    if (!isOpen) return null;

    const handleGenerateAI = async () => {
        if (!title) return;

        setIsGenerating(true);
        try {
            const projectContext = projectId !== "none" ? ` [Subject/Context: ${projects.find(p => p.id === projectId)?.name || ''}]` : '';
            const res = await fetch("/api/ai/breakdown", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title + projectContext, description }),
            });
            const data = await res.json();
            if (data.subtasks) {
                setSubtasks(data.subtasks.map((t: string) => ({ title: t, is_completed: false })));
            }
        } catch (error) {
            console.error("Failed to generate subtasks", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreate = () => {
        if (!title.trim()) return;

        let reminderTime: string | undefined = undefined;
        if (dueDate && reminderOffset !== "none") {
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
                reminder_time: reminderTime || taskToEdit.reminder_time,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-bold">{taskToEdit ? "Edit Task" : "Create New Task"}</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
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
                            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
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
                            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none transition-all"
                        />
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary-500 outline-none transition-all"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        {taskToEdit && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Status</label>
                                <div className="relative">
                                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as Status)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary-500 outline-none transition-all text-sm appearance-none"
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
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary-500 outline-none transition-all text-sm appearance-none"
                                >
                                    <option value="none">No Project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Due Date</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary-500 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Reminder</label>
                            <div className="relative">
                                <Bell className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <select
                                    value={reminderOffset}
                                    onChange={(e) => setReminderOffset(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary-500 outline-none transition-all text-sm appearance-none"
                                >
                                    <option value="none">None</option>
                                    <option value="10m">10 min before</option>
                                    <option value="1h">1 hour before</option>
                                    <option value="1d">1 day before</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* AI Toggle */}
                    <div className="p-4 rounded-xl border border-primary-200 bg-primary-50 dark:bg-primary-500/10 dark:border-primary-800">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsAiEnabled(!isAiEnabled)}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg text-primary-600 dark:text-primary-400">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-primary-900 dark:text-primary-100">AI Task Breakdown</p>
                                    <p className="text-xs text-primary-700/70 dark:text-primary-300/70 mt-0.5">Auto-generate actionable subtasks</p>
                                </div>
                            </div>
                            <div className={`w-11 h-6 rounded-full transition-colors relative ${isAiEnabled ? 'bg-primary-600' : 'bg-muted-foreground/30'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isAiEnabled ? 'left-6' : 'left-1'}`} />
                            </div>
                        </div>

                        {isAiEnabled && (
                            <div className="mt-4 pt-4 border-t border-primary-200/50 dark:border-primary-800/50">
                                {!subtasks.length ? (
                                    <button
                                        onClick={handleGenerateAI}
                                        disabled={!title || isGenerating}
                                        className="w-full py-2 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                        {isGenerating ? "Analyzing task..." : "Generate Subtasks"}
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-primary-800 dark:text-primary-300 uppercase tracking-wider mb-2">Steps</p>
                                        {subtasks.map((task, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm bg-background/50 p-2 rounded-lg">
                                                <div className="w-5 h-5 rounded-full border border-primary-300 dark:border-primary-700 flex-shrink-0 flex items-center justify-center text-[10px] text-primary-600 mt-0.5">{idx + 1}</div>
                                                <input
                                                    type="text"
                                                    value={task.title}
                                                    onChange={(e) => {
                                                        const newTasks = [...subtasks];
                                                        newTasks[idx] = { ...newTasks[idx], title: e.target.value };
                                                        setSubtasks(newTasks);
                                                    }}
                                                    className="bg-transparent border-none outline-none w-full text-foreground/90"
                                                />
                                                <button onClick={() => setSubtasks(subtasks.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-danger p-0.5">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={() => setSubtasks([...subtasks, { title: "", is_completed: false }])} className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline mt-2 inline-block">
                                            + Add another step
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0 p-6 border-t border-border bg-muted/30 flex justify-between gap-3">
                    {taskToEdit ? (
                        <button onClick={handleDelete} className="px-5 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2">
                            <Trash2 size={18} />
                            Delete
                        </button>
                    ) : <div />}
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleCreate} className="px-5 py-2.5 rounded-xl font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20">
                            {taskToEdit ? "Save Changes" : "Create Task"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
