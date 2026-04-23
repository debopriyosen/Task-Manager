"use client";

import { useState, useEffect } from "react";
import { X, IndianRupee, CalendarIcon, AlignLeft, Tag, Trash2, Mic, Loader2 } from "lucide-react";
import { useExpenses, Expense, ExpenseCategory } from "@/contexts/ExpensesContext";
import { format } from "date-fns";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { parseExpenseVoiceInput } from "@/lib/expense-parser";

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
    Groceries: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
    Food: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
    Entertainment: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
    Travel: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    Investment: "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
    Bills: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    Shopping: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20",
    Others: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
};

interface CreateExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    expenseToEdit?: Expense | null;
}

export function CreateExpenseModal({ isOpen, onClose, expenseToEdit = null }: CreateExpenseModalProps) {
    const { addExpense, updateExpense, deleteExpense } = useExpenses();

    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<ExpenseCategory>("Food");
    const [date, setDate] = useState("");
    const [notes, setNotes] = useState("");

    const { isListening, transcript, startListening, stopListening, hasSupport, resetTranscript } = useSpeechRecognition();
    const [voiceError, setVoiceError] = useState("");

    // Effect to handle parsing when speech finishes
    useEffect(() => {
        if (!isListening && transcript) {
            const parsed = parseExpenseVoiceInput(transcript);
            
            let success = false;
            if (parsed.amount) {
                setAmount(parsed.amount.toString());
                success = true;
            }
            if (parsed.category) {
                setCategory(parsed.category);
                success = true;
            }
            if (parsed.date) setDate(parsed.date);
            if (parsed.notes) setNotes(parsed.notes);

            if (!success && !parsed.notes) {
                setVoiceError("Couldn't understand the amount or category. Please try again.");
            } else {
                setVoiceError("");
            }
            // Clear transcript after parsing so next click is fresh
            resetTranscript();
        }
    }, [isListening, transcript, resetTranscript]);

    useEffect(() => {
        if (isOpen) {
            if (expenseToEdit) {
                setAmount(expenseToEdit.amount.toString());
                setCategory(expenseToEdit.category);
                setDate(expenseToEdit.date);
                setNotes(expenseToEdit.notes || "");
            } else {
                setAmount("");
                setCategory("Food");
                setDate(format(new Date(), "yyyy-MM-dd"));
                setNotes("");
            }
        }
    }, [isOpen, expenseToEdit]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!amount || isNaN(Number(amount))) return;
        if (!date) return;

        const expenseData = {
            amount: parseFloat(amount),
            category,
            date,
            notes: notes.trim() || undefined,
        };

        if (expenseToEdit) {
            updateExpense(expenseToEdit.id, expenseData);
        } else {
            addExpense(expenseData);
        }

        onClose();
    };

    const handleDelete = () => {
        if (expenseToEdit) {
            deleteExpense(expenseToEdit.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 flex items-center justify-between p-5 sm:p-7 border-b border-border relative overflow-hidden">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight relative z-10 w-full flex items-center justify-between mr-4 sm:mr-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 sm:p-2.5 bg-emerald-100/50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-200/50 dark:border-emerald-500/20">
                                <IndianRupee size={22} strokeWidth={2.5}/>
                            </div>
                            {expenseToEdit ? "Edit Expense" : "New Expense"}
                        </div>
                        
                        {hasSupport && !expenseToEdit && (
                            <button
                                onClick={isListening ? stopListening : startListening}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-sm font-semibold transition-all shadow-sm border ${
                                    isListening 
                                    ? "bg-red-50 dark:bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20 hover:bg-red-100 animate-pulse"
                                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                                }`}
                                title="Add by Voice"
                            >
                                {isListening ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
                                <span className="hidden sm:inline">{isListening ? "Listening..." : "Voice Input"}</span>
                            </button>
                        )}
                    </h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all relative z-10">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 sm:p-8 space-y-6 overflow-y-auto">
                    {/* Voice Overlay / Transcript Preview */}
                    {isListening && (
                        <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-top-4 shadow-inner">
                            <div className="w-14 h-14 bg-card rounded-full flex items-center justify-center shadow-sm mb-4 relative">
                                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                                <Mic size={24} className="text-emerald-600 relative z-10 animate-pulse" />
                            </div>
                            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-1">Listening to your expense...</p>
                            <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80 italic min-h-5 bg-card px-4 py-2 rounded-lg mt-2 w-full border border-emerald-100 dark:border-emerald-500/20">
                                {transcript || `"Spent 500 on groceries today"`}
                            </p>
                            <button onClick={stopListening} className="mt-4 text-xs font-semibold text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-400 underline">
                                Stop & Parse
                            </button>
                        </div>
                    )}
                    
                    {voiceError && !isListening && (
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <span className="font-medium">{voiceError}</span>
                            <button onClick={() => setVoiceError("")} className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"><X size={14}/></button>
                        </div>
                    )}

                    {/* Amount */}
                    <div className="p-1">
                        <label className="block text-sm font-medium mb-1.5 text-foreground">Amount *</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xl transition-colors group-focus-within:text-emerald-600">₹</div>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-4 rounded-xl bg-muted/30 border border-border hover:border-emerald-200 dark:hover:border-emerald-500/40 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-foreground placeholder:text-muted-foreground shadow-sm text-2xl font-bold tracking-tight"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-foreground">Category</label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted/30 border border-border hover:border-emerald-200 dark:hover:border-emerald-500/40 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium appearance-none text-foreground shadow-sm cursor-pointer"
                                >
                                    {Object.keys(CATEGORY_COLORS).map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-foreground">Date</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-muted/30 border border-border hover:border-emerald-200 dark:hover:border-emerald-500/40 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium text-foreground shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="p-1">
                        <label className="block text-sm font-medium mb-1.5 text-foreground flex items-center gap-2">
                            <AlignLeft size={16} className="text-muted-foreground" />
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="What was this for?"
                            rows={3}
                            className="w-full px-4 py-3.5 rounded-xl bg-muted/30 border border-border hover:border-emerald-200 dark:hover:border-emerald-500/40 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none transition-all text-sm text-foreground placeholder:text-muted-foreground shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-shrink-0 p-5 sm:p-7 border-t border-border bg-muted/20 flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
                    {expenseToEdit ? (
                        <button onClick={handleDelete} className="w-full sm:w-auto px-5 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 text-sm border border-transparent hover:border-red-200 dark:hover:border-red-500/20">
                            <Trash2 size={18} />
                            Delete
                        </button>
                    ) : <div className="hidden sm:block" />}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button onClick={onClose} className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-center text-sm">
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave} 
                            disabled={!amount || isNaN(Number(amount)) || !date}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-600/20 active:scale-95 text-center text-sm"
                        >
                            {expenseToEdit ? "Save Changes" : "Save Expense"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
