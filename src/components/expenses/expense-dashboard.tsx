"use client";

import { useState } from "react";
import { Plus, Filter, Navigation, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useExpenses, Expense, ExpenseCategory } from "@/contexts/ExpensesContext";
import { CreateExpenseModal, CATEGORY_COLORS } from "./create-expense-modal";
import { ExpenseAnalytics } from "./expense-analytics";
import { ExportReportButton } from "./export-report";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export function ExpenseDashboard() {
    const { expenses, deleteExpense } = useExpenses();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

    // Filters
    const [filterCategory, setFilterCategory] = useState<string>("All");
    const [filterMonth, setFilterMonth] = useState<string>(format(new Date(), "yyyy-MM"));

    const filteredExpenses = expenses.filter(expense => {
        const matchesCategory = filterCategory === "All" || expense.category === filterCategory;
        const matchesMonth = filterMonth === "All" || expense.date.startsWith(filterMonth);
        return matchesCategory && matchesMonth;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Compute available months for filter
    const availableMonths = Array.from(new Set(expenses.map(e => e.date.substring(0, 7)))).sort().reverse();
    if (!availableMonths.includes(format(new Date(), "yyyy-MM"))) {
        availableMonths.unshift(format(new Date(), "yyyy-MM"));
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="w-full sm:w-auto">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                        Expense Tracker
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">Monitor your spending and analyze your finances.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-emerald-600/20 active:scale-95 hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <Plus size={18} />
                        <span>Add Expense</span>
                    </button>
                </div>
            </div>

            {/* Analytics Section */}
            <ExpenseAnalytics />

            {/* Expenses List Section */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-semibold text-foreground">Recent Expenses</h2>
                    
                    {/* Filters & Export */}
                    <div className="flex flex-wrap items-center gap-2">
                        <ExportReportButton expenses={filteredExpenses} filterMonth={filterMonth} />
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1"></div>
                        <div className="relative">
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="pl-3 pr-8 py-2 rounded-lg bg-muted/50 border border-border hover:border-slate-300 outline-none text-sm text-foreground appearance-none cursor-pointer"
                            >
                                <option value="All">All Time</option>
                                {availableMonths.map(m => (
                                    <option key={m} value={m}>{format(parseISO(`${m}-01`), "MMMM yyyy")}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="pl-3 pr-8 py-2 rounded-lg bg-muted/50 border border-border hover:border-slate-300 outline-none text-sm text-foreground appearance-none cursor-pointer"
                            >
                                <option value="All">All Categories</option>
                                {Object.keys(CATEGORY_COLORS).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {filteredExpenses.length > 0 ? (
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {filteredExpenses.map(expense => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, height: 0, overflow: 'hidden' }}
                                    transition={{ duration: 0.2 }}
                                    key={expense.id} 
                                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all gap-4 sm:gap-0"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm ${CATEGORY_COLORS[expense.category]}`}>
                                            {expense.category}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{expense.notes || "No additional notes"}</p>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5">{format(parseISO(expense.date), "MMM d, yyyy")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                        <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        <div className="flex items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-1">
                                            <button 
                                                onClick={() => setExpenseToEdit(expense)}
                                                className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => deleteExpense(expense.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center text-center py-16 my-4 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-3xl border border-dashed border-emerald-200/50 dark:border-emerald-800/50"
                    >
                        <div className="w-20 h-20 bg-white dark:bg-card rounded-2xl flex items-center justify-center text-emerald-500 mb-5 shadow-sm border border-emerald-100 dark:border-emerald-800/50 rotate-3">
                            <span className="text-4xl">🧾</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No expenses found</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs">You haven't tracked any expenses that match these filters yet.</p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 text-emerald-600 hover:text-emerald-700 font-bold text-sm bg-emerald-50 hover:bg-emerald-100 px-6 py-2.5 rounded-xl transition-colors dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400"
                        >
                            Track an expense
                        </button>
                    </motion.div>
                )}
            </div>

            <CreateExpenseModal 
                isOpen={isModalOpen || !!expenseToEdit} 
                onClose={() => {
                    setIsModalOpen(false);
                    setExpenseToEdit(null);
                }} 
                expenseToEdit={expenseToEdit} 
            />
        </div>
    );
}
