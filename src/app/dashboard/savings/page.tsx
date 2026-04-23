"use client";

import { useState, useMemo } from "react";
import { useExpenses, SavingsGoal } from "@/contexts/ExpensesContext";
import { format, differenceInMonths, differenceInDays, parseISO, subMonths } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Trash2, PiggyBank, TrendingUp, Sparkles, X, Calendar, IndianRupee } from "lucide-react";

const GOAL_COLORS = [
    { name: "emerald", bg: "bg-emerald-500", light: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", gradient: "from-emerald-500 to-teal-500" },
    { name: "violet", bg: "bg-violet-500", light: "bg-violet-100 dark:bg-violet-500/20", text: "text-violet-600 dark:text-violet-400", gradient: "from-violet-500 to-purple-500" },
    { name: "rose", bg: "bg-rose-500", light: "bg-rose-100 dark:bg-rose-500/20", text: "text-rose-600 dark:text-rose-400", gradient: "from-rose-500 to-pink-500" },
    { name: "amber", bg: "bg-amber-500", light: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", gradient: "from-amber-500 to-orange-500" },
    { name: "sky", bg: "bg-sky-500", light: "bg-sky-100 dark:bg-sky-500/20", text: "text-sky-600 dark:text-sky-400", gradient: "from-sky-500 to-blue-500" },
];

const EMOJIS = ["🎯", "💻", "🏠", "🚗", "✈️", "📱", "🎓", "💍", "🏖️", "🎸", "📸", "🎮"];

export default function SavingsPage() {
    const { savingsGoals, expenses, addSavingsGoal, addToSavings, deleteSavingsGoal, monthlyBudget, monthlyIncome } = useExpenses();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
    const [showDepositModal, setShowDepositModal] = useState<string | null>(null);
    const [depositAmount, setDepositAmount] = useState("");

    const now = new Date();

    // Smart savings recommendation
    const recommendation = useMemo(() => {
        const currentMonth = format(now, "yyyy-MM");
        const monthSpent = expenses.filter(e => e.date.startsWith(currentMonth)).reduce((a, c) => a + c.amount, 0);
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dailyAvg = monthSpent / Math.max(dayOfMonth, 1);
        const forecastedSpend = dailyAvg * daysInMonth;

        // Avg monthly spend over last 3 months
        let totalLast3 = 0;
        for (let i = 1; i <= 3; i++) {
            const m = format(subMonths(now, i), "yyyy-MM");
            totalLast3 += expenses.filter(e => e.date.startsWith(m)).reduce((a, c) => a + c.amount, 0);
        }
        const avgMonthlySpend = totalLast3 / 3;

        const income = monthlyIncome > 0 ? monthlyIncome : (monthlyBudget > 0 ? monthlyBudget : avgMonthlySpend * 1.3);
        const saveable = Math.max(income - forecastedSpend, 0);

        return { forecastedSpend, avgMonthlySpend, saveable, income };
    }, [expenses, monthlyBudget, now]);

    const handleDeposit = (goalId: string) => {
        const amount = Number(depositAmount);
        if (amount > 0) {
            addToSavings(goalId, amount);
            setDepositAmount("");
            setShowDepositModal(null);
        }
    };

    const getColorConfig = (colorName: string) => GOAL_COLORS.find(c => c.name === colorName) || GOAL_COLORS[0];

    const totalSaved = savingsGoals.reduce((a, g) => a + g.savedAmount, 0);
    const totalTarget = savingsGoals.reduce((a, g) => a + g.targetAmount, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <PiggyBank className="text-emerald-600" /> Savings Goals
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Track your financial targets and see how much you can save</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={18} /> New Goal
                </button>
            </div>

            {/* Smart Recommendation Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-teal-400/20 rounded-full blur-xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="text-yellow-300" size={20} />
                        <h2 className="font-bold text-lg">Smart Savings Insight</h2>
                    </div>
                    <p className="text-emerald-50 text-sm mb-4 max-w-xl">
                        Based on your spending patterns, here&apos;s what your finances look like this month:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <p className="text-[11px] text-emerald-200 font-medium uppercase tracking-wider">Forecasted Spend</p>
                            <p className="text-xl font-bold mt-1">₹{recommendation.forecastedSpend.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <p className="text-[11px] text-emerald-200 font-medium uppercase tracking-wider">
                                {monthlyBudget > 0 ? "Your Budget" : "Avg Monthly"}
                            </p>
                            <p className="text-xl font-bold mt-1">₹{recommendation.income.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20 col-span-2 sm:col-span-1">
                            <p className="text-[11px] text-yellow-200 font-bold uppercase tracking-wider">You Can Save</p>
                            <p className="text-xl font-bold mt-1 text-yellow-200">₹{recommendation.saveable.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Strip */}
            {savingsGoals.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Goals</p>
                        <p className="text-2xl font-bold mt-1">{savingsGoals.filter(g => g.savedAmount < g.targetAmount).length}</p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Saved</p>
                        <p className="text-2xl font-bold mt-1 text-emerald-600">₹{totalSaved.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm col-span-2 sm:col-span-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Target</p>
                        <p className="text-2xl font-bold mt-1">₹{totalTarget.toLocaleString("en-IN")}</p>
                    </div>
                </div>
            )}

            {/* Goals Grid */}
            {savingsGoals.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 shadow-sm flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 text-4xl">🎯</div>
                    <h3 className="text-lg font-bold text-foreground">No Savings Goals Yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">Set a target and let us help you figure out how to get there based on your actual spending habits.</p>
                    <button onClick={() => setShowCreateModal(true)} className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all">
                        Create Your First Goal
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {savingsGoals.map((goal) => {
                        const color = getColorConfig(goal.color);
                        const progress = (goal.savedAmount / goal.targetAmount) * 100;
                        const isComplete = goal.savedAmount >= goal.targetAmount;
                        const monthsLeft = differenceInMonths(parseISO(goal.deadline), now);
                        const daysLeft = differenceInDays(parseISO(goal.deadline), now);
                        const remaining = goal.targetAmount - goal.savedAmount;
                        const monthlyNeeded = monthsLeft > 0 ? remaining / monthsLeft : remaining;
                        const canAfford = recommendation.saveable >= monthlyNeeded;

                        return (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group ${isComplete ? "ring-2 ring-emerald-500/50" : ""}`}
                            >
                                {isComplete && (
                                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                        ✅ Complete
                                    </div>
                                )}

                                <div className="flex items-start gap-4 mb-5">
                                    <div className={`w-12 h-12 ${color.light} rounded-2xl flex items-center justify-center text-2xl shrink-0`}>
                                        {goal.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-foreground text-lg truncate">{goal.name}</h3>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <Calendar size={11} /> {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                                            <span className="mx-1">·</span>
                                            {format(parseISO(goal.deadline), "MMM dd, yyyy")}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className={`font-bold ${color.text}`}>₹{goal.savedAmount.toLocaleString("en-IN")}</span>
                                        <span className="text-muted-foreground">₹{goal.targetAmount.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(progress, 100)}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full bg-gradient-to-r ${color.gradient}`}
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground text-right font-medium">{progress.toFixed(1)}% saved</p>
                                </div>

                                {/* Smart Recommendation */}
                                {!isComplete && monthsLeft > 0 && (
                                    <div className={`${color.light} rounded-xl p-3 mb-4`}>
                                        <p className="text-xs font-semibold text-foreground">
                                            Save <span className={color.text}>₹{monthlyNeeded.toLocaleString("en-IN", { maximumFractionDigits: 0 })}/mo</span> to reach your goal
                                        </p>
                                        <p className={`text-[11px] mt-1 font-medium ${canAfford ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                            {canAfford ? "✅ This fits within your estimated savings capacity" : "⚠️ This exceeds your current estimated savings — consider adjusting"}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {!isComplete && (
                                        <button
                                            onClick={() => { setShowDepositModal(goal.id); setDepositAmount(""); }}
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold bg-gradient-to-r ${color.gradient} hover:opacity-90 transition-all shadow-sm`}
                                        >
                                            <IndianRupee size={14} /> Add Savings
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setEditingGoal(goal)}
                                        className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                                        title="Edit Goal"
                                    >
                                        <Plus size={16} className="rotate-45" />
                                    </button>
                                    <button
                                        onClick={() => deleteSavingsGoal(goal.id)}
                                        className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                        title="Delete Goal"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Deposit Modal */}
            <AnimatePresence>
                {showDepositModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Add to Savings</h3>
                                <button onClick={() => setShowDepositModal(null)} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Amount (₹)</label>
                                    <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full mt-1 bg-muted border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg" placeholder="e.g. 5000" autoFocus />
                                </div>
                                {/* Quick amounts */}
                                <div className="flex gap-2 flex-wrap">
                                    {[500, 1000, 2000, 5000].map(amt => (
                                        <button key={amt} onClick={() => setDepositAmount(String(amt))} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 transition-colors">
                                            ₹{amt.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => handleDeposit(showDepositModal)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-200 dark:shadow-none">
                                    Save Money 🎉
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create / Edit Goal Modals */}
            <AnimatePresence>
                {showCreateModal && <CreateGoalModal onClose={() => setShowCreateModal(false)} />}
                {editingGoal && <EditGoalModal goal={editingGoal} onClose={() => setEditingGoal(null)} />}
            </AnimatePresence>
        </div>
    );
}

function EditGoalModal({ goal, onClose }: { goal: SavingsGoal, onClose: () => void }) {
    const { updateSavingsGoal } = useExpenses();
    const [name, setName] = useState(goal.name);
    const [emoji, setEmoji] = useState(goal.emoji);
    const [target, setTarget] = useState(goal.targetAmount.toString());
    const [deadline, setDeadline] = useState(goal.deadline);
    const [color, setColor] = useState(goal.color);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !target || !deadline) return;
        updateSavingsGoal(goal.id, { name, emoji, targetAmount: Number(target), deadline, color });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Target size={22} /> Edit Savings Goal</h2>
                        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg"><X size={20} /></button>
                    </div>
                    <p className="text-indigo-100 text-sm mt-1">Update your target details</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-2">Pick an Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {EMOJIS.map(e => (
                                <button type="button" key={e} onClick={() => setEmoji(e)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${emoji === e ? "bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500 scale-110" : "bg-muted hover:bg-indigo-50 dark:hover:bg-indigo-500/10"}`}>
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Goal Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 bg-muted border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder='e.g. "New MacBook Pro"' required />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Target Amount (₹)</label>
                        <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full mt-1 bg-muted border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg" placeholder="e.g. 60000" required />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Target Date</label>
                        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full mt-1 bg-muted border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium" required />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-2">Theme Color</label>
                        <div className="flex gap-3">
                            {GOAL_COLORS.map(c => (
                                <button type="button" key={c.name} onClick={() => setColor(c.name)} className={`w-8 h-8 rounded-full ${c.bg} transition-all ${color === c.name ? "ring-2 ring-offset-2 ring-offset-card ring-indigo-500 scale-110" : "opacity-60 hover:opacity-100"}`} />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-border font-medium hover:bg-muted transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">Update Goal</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function CreateGoalModal({ onClose }: { onClose: () => void }) {
    const { addSavingsGoal } = useExpenses();
    const [name, setName] = useState("");
    const [emoji, setEmoji] = useState("🎯");
    const [target, setTarget] = useState("");
    const [deadline, setDeadline] = useState("");
    const [color, setColor] = useState("emerald");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !target || !deadline) return;
        addSavingsGoal({ name, emoji, targetAmount: Number(target), savedAmount: 0, deadline, color });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Target size={22} /> New Savings Goal</h2>
                        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg"><X size={20} /></button>
                    </div>
                    <p className="text-emerald-100 text-sm mt-1">Define your target and we&apos;ll help you plan</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Emoji Picker */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-2">Pick an Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {EMOJIS.map(e => (
                                <button type="button" key={e} onClick={() => setEmoji(e)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${emoji === e ? "bg-emerald-100 dark:bg-emerald-500/20 ring-2 ring-emerald-500 scale-110" : "bg-muted hover:bg-emerald-50 dark:hover:bg-emerald-500/10"}`}>
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Goal Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 bg-muted border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 font-medium" placeholder='e.g. "New MacBook Pro"' required />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Target Amount (₹)</label>
                        <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full mt-1 bg-muted border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg" placeholder="e.g. 60000" required />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Target Date</label>
                        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full mt-1 bg-muted border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 font-medium" required />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-2">Theme Color</label>
                        <div className="flex gap-3">
                            {GOAL_COLORS.map(c => (
                                <button type="button" key={c.name} onClick={() => setColor(c.name)} className={`w-8 h-8 rounded-full ${c.bg} transition-all ${color === c.name ? "ring-2 ring-offset-2 ring-offset-card ring-emerald-500 scale-110" : "opacity-60 hover:opacity-100"}`} />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-border font-medium hover:bg-muted transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none">Create Goal</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
