"use client";

import { useState, useEffect } from "react";
import { X, Palette, CalendarIcon, Clock, Bell } from "lucide-react";
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
    const [isAlarm, setIsAlarm] = useState(false);

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
                setIsAlarm(reminderToEdit.isAlarm || false);
            } else {
                setTitle("");
                setDate(initialDate || new Date().toISOString().split("T")[0]);
                setTime("");
                setColor("bg-amber-500");
                setIsAlarm(false);
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
                isAlarm,
            });
        } else {
            addReminder({
                title,
                date,
                time: time || undefined,
                color,
                isAlarm,
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

                    {/* Schedule Section */}
                    <div className="p-5 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <CalendarIcon size={18} className="text-indigo-600" />
                            <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Schedule</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Date *</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-indigo-100/50 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm text-slate-700 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-indigo-100/50 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm text-slate-700 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {date && (
                            <p className="text-[11px] text-indigo-600 font-medium pl-1 flex items-center gap-1.5">
                                <Bell size={12} />
                                Alert scheduled for: {new Date(date + (time ? `T${time}` : 'T00:00:00')).toLocaleString()}
                            </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-indigo-100/50">
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-indigo-400" />
                                <span className="text-xs font-medium text-slate-600">Audible Alarm</span>
                            </div>
                            <button
                                onClick={() => setIsAlarm(!isAlarm)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isAlarm ? "bg-amber-500" : "bg-slate-200"
                                    } cursor-pointer`}
                            >
                                <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isAlarm ? "translate-x-5" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-3">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Palette size={14} className="text-slate-400" />
                            Color Accent
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {colors.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setColor(c.class)}
                                    className={`w-8 h-8 rounded-full ${c.class} transition-all duration-300 ${color === c.class
                                        ? 'scale-125 ring-2 ring-indigo-500 ring-offset-4 ring-offset-white shadow-lg'
                                        : 'hover:scale-110 opacity-70 hover:opacity-100'
                                        }`}
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
