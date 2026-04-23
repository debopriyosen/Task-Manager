"use client";

import { useState, useMemo } from "react";
import { useExpenses, SIP } from "@/contexts/ExpensesContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Repeat, Plus, Trash2, TrendingUp, TrendingDown, 
    ArrowUpRight, Target, Calendar, Edit3, X, 
    Info, DollarSign, Calculator, LineChart
} from "lucide-react";
import { format, differenceInMonths, parseISO, addMonths } from "date-fns";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Legend 
} from "recharts";

export default function SIPPage() {
    const { sips, addSIP, updateSIP, deleteSIP } = useExpenses();
    const [showModal, setShowModal] = useState(false);
    const [sipToEdit, setSipToEdit] = useState<SIP | null>(null);

    // Calculations
    const sipStats = useMemo(() => {
        let totalMonthly = 0;
        let totalInvestedSoFar = 0;
        let totalCurrentValue = 0;

        const processedSips = sips.map(sip => {
            const startDate = parseISO(sip.startDate);
            const monthsPassed = Math.max(0, differenceInMonths(new Date(), startDate));
            
            totalMonthly += sip.amount;
            
            // FV = P × ((1 + i)^n - 1) / i × (1 + i)
            const monthlyRate = (sip.expectedReturn / 100) / 12;
            const invested = sip.amount * monthsPassed;
            const value = monthsPassed > 0 
                ? sip.amount * ((Math.pow(1 + monthlyRate, monthsPassed) - 1) / monthlyRate) * (1 + monthlyRate)
                : 0;

            totalInvestedSoFar += invested;
            totalCurrentValue += value;

            return {
                ...sip,
                invested,
                currentValue: value,
                returns: value - invested,
                returnsPct: invested > 0 ? ((value - invested) / invested) * 100 : 0,
                monthsPassed
            };
        });

        return { totalMonthly, totalInvestedSoFar, totalCurrentValue, processedSips };
    }, [sips]);

    // Projection Data (Next 10 years)
    const projectionData = useMemo(() => {
        if (sips.length === 0) return [];
        
        const data = [];
        for (let year = 0; year <= 10; year++) {
            let yearValue = 0;
            let yearInvested = 0;
            const months = year * 12;

            sips.forEach(sip => {
                const startDate = parseISO(sip.startDate);
                const currentMonths = Math.max(0, differenceInMonths(new Date(), startDate));
                const totalMonths = currentMonths + months;
                const monthlyRate = (sip.expectedReturn / 100) / 12;

                const value = totalMonths > 0 
                    ? sip.amount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
                    : 0;
                
                yearValue += value;
                yearInvested += sip.amount * totalMonths;
            });

            data.push({
                name: `Year ${year}`,
                Value: Math.round(yearValue),
                Invested: Math.round(yearInvested)
            });
        }
        return data;
    }, [sips]);

    const handleEdit = (sip: SIP) => {
        setSipToEdit(sip);
        setShowModal(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <Repeat className="text-indigo-600" /> SIP Manager
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Track your recurring investments and future wealth</p>
                </div>
                <button
                    onClick={() => {
                        setSipToEdit(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    <Plus size={18} /> New SIP
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Monthly SIP</p>
                    <h2 className="text-3xl font-black text-foreground tabular-nums">₹{sipStats.totalMonthly.toLocaleString("en-IN")}</h2>
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium">Auto-deducted from your monthly income</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total SIP Value</p>
                    <h2 className="text-2xl font-bold text-foreground tabular-nums">₹{sipStats.totalCurrentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</h2>
                    <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${sipStats.totalCurrentValue >= sipStats.totalInvestedSoFar ? "text-emerald-500" : "text-red-500"}`}>
                        {sipStats.totalCurrentValue >= sipStats.totalInvestedSoFar ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        Gains: ₹{Math.abs(sipStats.totalCurrentValue - sipStats.totalInvestedSoFar).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">10-Year Forecast</p>
                        <div className="flex items-center gap-2">
                            <Target className="text-indigo-500" size={20} />
                            <span className="text-lg font-bold text-foreground">
                                ₹{projectionData.length > 0 ? projectionData[10].Value.toLocaleString("en-IN") : "₹0"}
                            </span>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium">Based on current SIPs and expected returns</p>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <LineChart size={20} className="text-indigo-500" /> 10-Year Growth Projection
                </h2>
                <div className="h-72 w-full">
                    {projectionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={projectionData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                                <Tooltip 
                                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                                    formatter={(v: any) => [`₹${v.toLocaleString()}`, ""]}
                                />
                                <Area type="monotone" dataKey="Value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                <Area type="monotone" dataKey="Invested" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorInvested)" />
                                <Legend verticalAlign="top" height={36}/>
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                            Add a SIP to see your wealth projection
                        </div>
                    )}
                </div>
            </div>

            {/* SIP List */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-bold text-foreground">Active SIPs</h2>
                    <span className="text-xs text-muted-foreground">{sips.length} Plans</span>
                </div>
                
                {sipStats.processedSips.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <Calculator size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No active SIPs found. Start planning your future today!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border">
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Plan Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Monthly Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Returns (%)</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Current Value</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sipStats.processedSips.map((sip) => (
                                    <tr key={sip.id} className="border-b border-border hover:bg-muted/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-foreground">{sip.name}</p>
                                            <p className="text-[10px] text-muted-foreground">Started: {format(parseISO(sip.startDate), "MMM yyyy")}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-foreground">₹{sip.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${sip.returns >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                                                {sip.expectedReturn}% p.a.
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="font-black text-indigo-600 dark:text-indigo-400">₹{sip.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                            <p className="text-[9px] text-muted-foreground font-medium">Invested: ₹{sip.invested.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => handleEdit(sip)} className="p-2 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button onClick={() => deleteSIP(sip.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Notice */}
            <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                <Info className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                    <strong>Note:</strong> SIP values are calculated using the standard future value formula based on your expected return rate. Actual market returns will vary. Total invested is calculated from the start date to today.
                </p>
            </div>

            {/* SIP Modal */}
            <AnimatePresence>
                {showModal && (
                    <SIPModal 
                        onClose={() => {
                            setShowModal(false);
                            setSipToEdit(null);
                        }}
                        sipToEdit={sipToEdit}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function SIPModal({ onClose, sipToEdit }: { onClose: () => void; sipToEdit: SIP | null }) {
    const { addSIP, updateSIP } = useExpenses();
    const [name, setName] = useState(sipToEdit?.name || "");
    const [amount, setAmount] = useState(sipToEdit?.amount.toString() || "");
    const [expectedReturn, setExpectedReturn] = useState(sipToEdit?.expectedReturn.toString() || "12");
    const [startDate, setStartDate] = useState(sipToEdit?.startDate || format(new Date(), "yyyy-MM-dd"));
    const [category, setCategory] = useState(sipToEdit?.category || "Mutual Fund");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount || !expectedReturn) return;

        const data = {
            name,
            amount: Number(amount),
            expectedReturn: Number(expectedReturn),
            startDate,
            category,
            frequency: "monthly" as const
        };

        if (sipToEdit) {
            updateSIP(sipToEdit.id, data);
        } else {
            addSIP(data);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
                <div className="bg-indigo-600 p-6 text-white relative">
                    <div className="flex justify-between items-center relative z-10">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            {sipToEdit ? <Edit3 size={22} /> : <Plus size={22} />} 
                            {sipToEdit ? "Edit SIP" : "Add New SIP"}
                        </h2>
                        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"><X size={20} /></button>
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Plan Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full bg-muted/50 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                            placeholder="e.g. Parag Parikh Flexi Cap"
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Amount (₹)</label>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                className="w-full bg-muted/50 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                                placeholder="5000"
                                required 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Exp. Return (% p.a.)</label>
                            <input 
                                type="number" 
                                value={expectedReturn} 
                                onChange={(e) => setExpectedReturn(e.target.value)} 
                                className="w-full bg-muted/50 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                                placeholder="12"
                                required 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Start Date</label>
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)} 
                                className="w-full bg-muted/50 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                                required 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-muted/50 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            >
                                <option>Mutual Fund</option>
                                <option>Stocks</option>
                                <option>Gold</option>
                                <option>PPF</option>
                                <option>NPS</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98] uppercase tracking-widest text-xs">
                            {sipToEdit ? "Update SIP Plan" : "Create SIP Plan"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
