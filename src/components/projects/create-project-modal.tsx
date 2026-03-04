"use client";

import { useState } from "react";
import { X, Palette } from "lucide-react";
import { useTasks } from "@/contexts/TasksContext";

export function CreateProjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { addProject } = useTasks();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("bg-blue-500");

    const colors = [
        { name: "Blue", class: "bg-blue-500" },
        { name: "Indigo", class: "bg-indigo-500" },
        { name: "Purple", class: "bg-purple-500" },
        { name: "Pink", class: "bg-pink-500" },
        { name: "Red", class: "bg-red-500" },
        { name: "Orange", class: "bg-orange-500" },
        { name: "Amber", class: "bg-amber-500" },
        { name: "Green", class: "bg-green-500" },
        { name: "Emerald", class: "bg-emerald-500" },
        { name: "Cyan", class: "bg-cyan-500" },
        { name: "Slate", class: "bg-slate-500" }
    ];

    if (!isOpen) return null;

    const handleCreate = () => {
        if (!name.trim()) return;

        addProject({
            name,
            description,
            color,
        });

        // Reset and close
        setName("");
        setDescription("");
        setColor("bg-blue-500");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/20 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/50 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-6 border-b border-indigo-50/80 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent pointer-events-none" />
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight relative z-10">Create Subject / Project</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-indigo-50 rounded-full transition-all relative z-10">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Project Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Marketing, Statistics..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-indigo-100/50 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-slate-700 placeholder:text-slate-400 shadow-sm"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add syllabus or details..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-indigo-100/50 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none resize-none transition-all text-slate-700 placeholder:text-slate-400 shadow-sm"
                        />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Palette size={16} className="text-muted-foreground" />
                            Theme Color
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {colors.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setColor(c.class)}
                                    className={`w-8 h-8 rounded-full ${c.class} transition-transform ${color === c.class ? 'scale-125 ring-2 ring-offset-2 ring-offset-background ring-primary-500' : 'hover:scale-110'}`}
                                    title={c.name}
                                    aria-label={`Select ${c.name} color`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 border-t border-indigo-50/80 bg-slate-50/50 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button onClick={onClose} className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl font-medium text-slate-500 hover:bg-slate-200/50 transition-colors text-center cursor-pointer">
                        Cancel
                    </button>
                    <button onClick={handleCreate} className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 text-center cursor-pointer">
                        Create Project
                    </button>
                </div>
            </div>
        </div>
    );
}
