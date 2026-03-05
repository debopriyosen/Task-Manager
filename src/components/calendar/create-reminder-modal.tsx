"use client";

import { useState, useEffect } from "react";
import { X, Palette, CalendarIcon, Clock } from "lucide-react";
import { useTasks, Reminder } from "@/contexts/TasksContext";

interface CreateReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate?: string; // Format: YYYY-MM-DD
    reminderToEdit?: Reminder | null;
}

export function CreateReminderModal({ isOpen, onClose, initialDate, reminderToEdit = null }: CreateReminderModalProps) {
    const { addReminder, updateReminder, deleteReminder } = useTasks();

    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [color, setColor] = useState("bg-amber-500");

    const colors = [
        { name: "Blue", class: "bg-blue-500" },
        { name: "Purple", class: "bg-purple-500" },
        { name: "Pink", class: "bg-pink-500" },
        { name: "Red", class: "bg-red-500" },
        { name: "Orange", class: "bg-orange-500" },
        { name: "Amber", class: "bg-amber-500" },
        { name: "Emerald", class: "bg-emerald-500" },
        { name: "Cyan", class: "bg-cyan-500" }
    ];

    useEffect(() => {
        if (isOpen) {
            if (reminderToEdit) {
                setTitle(reminderToEdit.title);
                setDate(reminderToEdit.date);
                setTime(reminderToEdit.time || "");
                setColor(reminderToEdit.color);
            } else {
                setTitle("");
                setDate(initialDate || new Date().toISOString().split("T")[0]);
                setTime("");
                setColor("bg-amber-500");
            }
        }
    }, [isOpen, reminderToEdit, initialDate]);

    if (!isOpen) return null;

    const handleCreateOrUpdate = () => {
        if (!title.trim() || !date) return;

        if (reminderToEdit) {
            updateReminder(reminderToEdit.id, {
                title,
                date,
                time: time || undefined,
                color,
            });
        } else {
            addReminder({
                title,
                date,
                time: time || undefined,
                color,
            });
        }
        onClose();
    };

    const handleDelete = () => {
        if (reminderToEdit) {
            deleteReminder(reminderToEdit.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/20 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/50 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-6 border-b border-indigo-50/80 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent pointer-events-none" />
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight relative z-10">
                        {reminderToEdit ? "Edit Reminder" : "New Reminder"}
                    </h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-indigo-50 rounded-full transition-all relative z-10 cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Reminder Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Dentist Appointment..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-indigo-100/50 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-slate-700 placeholder:text-slate-400 shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Date *</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 border border-indigo-100/50 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-sm text-slate-700 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Time */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Time (Optional)</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 border border-indigo-100/50 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-sm text-slate-700 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Palette size={16} className="text-muted-foreground" />
                            Color Label
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {colors.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setColor(c.class)}
                                    className={`w-7 h-7 rounded-full ${c.class} transition-transform ${color === c.class ? 'scale-125 ring-2 ring-offset-2 ring-offset-background ring-indigo-500' : 'hover:scale-110 cursor-pointer'}`}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 border-t border-indigo-50/80 bg-slate-50/50 flex flex-col-reverse sm:flex-row justify-between gap-3">
                    {reminderToEdit ? (
                        <button onClick={handleDelete} className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors text-center cursor-pointer">
                            Delete
                        </button>
                    ) : <div className="hidden sm:block" />}

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button onClick={onClose} className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl font-medium text-slate-500 hover:bg-slate-200/50 transition-colors text-center cursor-pointer">
                            Cancel
                        </button>
                        <button onClick={handleCreateOrUpdate} disabled={!title.trim() || !date} className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm shadow-indigo-600/20 text-center cursor-pointer">
                            {reminderToEdit ? "Save Changes" : "Add Reminder"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
