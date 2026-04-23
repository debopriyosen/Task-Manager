"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Calculator, Landmark, Receipt, ArrowRight, 
    TrendingUp, ShieldCheck, Clock, Info, 
    ChevronDown, RefreshCcw, PieChart, Building2,
    Activity
} from "lucide-react";

// Latest 2026 FD Data (Approximate)
const BANK_RATES: Record<string, { general: number; senior: number; logo: string }> = {
    "SBI": { general: 6.45, senior: 7.05, logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/State_Bank_of_India_logo.svg" },
    "HDFC Bank": { general: 6.50, senior: 7.00, logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg" },
    "ICICI Bank": { general: 6.50, senior: 7.10, logo: "https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg" },
    "Axis Bank": { general: 6.45, senior: 7.20, logo: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Axis_Bank_logo.svg" },
    "Kotak Mahindra": { general: 6.80, senior: 7.20, logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Kotak_Mahindra_Bank_logo.svg" },
    "PNB": { general: 6.60, senior: 7.10, logo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Punjab_National_Bank_logo.svg" }
};

export default function FDCalculatorPage() {
    const [bank, setBank] = useState("SBI");
    const [amount, setAmount] = useState<number>(50000);
    const [tenureYears, setTenureYears] = useState<number>(1);
    const [tenureMonths, setTenureMonths] = useState<number>(0);
    const [isSenior, setIsSenior] = useState(false);
    const [compounding, setCompounding] = useState<"quarterly" | "monthly" | "yearly">("quarterly");

    // Calculation logic
    const results = useMemo(() => {
        const rate = isSenior ? BANK_RATES[bank].senior : BANK_RATES[bank].general;
        const r = rate / 100;
        const t = tenureYears + (tenureMonths / 12);
        
        let n = 4; // Default Quarterly
        if (compounding === "monthly") n = 12;
        if (compounding === "yearly") n = 1;

        // Formula: A = P(1 + r/n)^(nt)
        const maturityValue = amount * Math.pow(1 + (r / n), n * t);
        const totalInterest = maturityValue - amount;

        return {
            rate,
            maturityValue: Math.round(maturityValue),
            totalInterest: Math.round(totalInterest),
            tenureTotal: t.toFixed(2)
        };
    }, [bank, amount, tenureYears, tenureMonths, isSenior, compounding]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <Landmark className="text-indigo-600" /> Bank FD Calculator
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Calculate maturity returns across top Indian banks (2026 Rates)</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">
                    <ShieldCheck size={14} /> Bank Grade Secure
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Results Section - Comes first on Mobile */}
                <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />
                        
                        <div className="relative z-10 flex flex-col h-full justify-between gap-6 sm:gap-10">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <p className="text-indigo-100 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">Maturity Value</p>
                                    <h2 className="text-3xl sm:text-5xl font-black tabular-nums tracking-tighter">₹{results.maturityValue.toLocaleString()}</h2>
                                </div>
                                <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl w-full sm:w-auto">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-center sm:text-left mb-1 opacity-80">Total Returns</p>
                                    <p className="text-xl sm:text-2xl font-black text-center sm:text-left">₹{results.totalInterest.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-white/20 pt-6 sm:pt-8">
                                <div>
                                    <p className="text-indigo-200 text-[9px] sm:text-[10px] font-bold uppercase mb-1">Principal</p>
                                    <p className="font-bold text-xs sm:text-base">₹{(amount/1000).toFixed(0)}k</p>
                                </div>
                                <div>
                                    <p className="text-indigo-200 text-[9px] sm:text-[10px] font-bold uppercase mb-1">Rate</p>
                                    <p className="font-bold text-xs sm:text-base">{results.rate}%</p>
                                </div>
                                <div>
                                    <p className="text-indigo-200 text-[9px] sm:text-[10px] font-bold uppercase mb-1">Tenure</p>
                                    <p className="font-bold text-xs sm:text-base">{tenureYears}y {tenureMonths}m</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                <Activity className="text-emerald-500" size={18} /> Returns Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                    <span className="text-muted-foreground">Period</span>
                                    <span className="font-bold text-foreground">{results.tenureTotal} Years</span>
                                </div>
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                    <span className="text-muted-foreground">Compounding</span>
                                    <span className="font-bold text-foreground capitalize">{compounding}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                    <span className="text-muted-foreground">Net Profit</span>
                                    <span className="font-bold text-emerald-500">+₹{results.totalInterest.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                <TrendingUp className="text-indigo-500" size={18} /> Market Comparison
                            </h3>
                            <div className="space-y-2">
                                {Object.entries(BANK_RATES).slice(0, 3).map(([name, data]) => (
                                    <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                                        <span className="text-[10px] sm:text-xs font-medium text-foreground">{name}</span>
                                        <span className="text-[10px] sm:text-xs font-bold text-indigo-600">{isSenior ? data.senior : data.general}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-2xl p-4 flex gap-3">
                        <Info className="text-indigo-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                            <strong>Note:</strong> Fixed Deposit rates are updated for April 2026. The maturity amount is calculated based on compound interest. Final amount may vary slightly depending on the exact day of account opening and tax (TDS) implications.
                        </p>
                    </div>
                </div>

                {/* Inputs Section - Comes second on Mobile */}
                <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
                    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 sm:space-y-6">
                        {/* Bank Selection */}
                        <div>
                            <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2 sm:mb-3">Select Bank</label>
                            <div className="relative group">
                                <select 
                                    value={bank}
                                    onChange={(e) => setBank(e.target.value)}
                                    className="w-full bg-muted/50 border border-border rounded-xl p-3 sm:p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none cursor-pointer pr-10 text-sm sm:text-base"
                                >
                                    {Object.keys(BANK_RATES).map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-indigo-500 transition-colors" size={20} />
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div>
                            <div className="flex justify-between items-center mb-2 sm:mb-3">
                                <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Amount</label>
                                <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">₹{amount.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" 
                                min="50000" 
                                max="10000000" 
                                step="10000" 
                                value={amount} 
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        {/* Tenure Selection */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 sm:mb-2">Years</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="20" 
                                    value={tenureYears} 
                                    onChange={(e) => setTenureYears(Number(e.target.value))}
                                    className="w-full bg-muted/50 border border-border rounded-xl p-2.5 sm:p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 sm:mb-2">Months</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="11" 
                                    value={tenureMonths} 
                                    onChange={(e) => setTenureMonths(Number(e.target.value))}
                                    className="w-full bg-muted/50 border border-border rounded-xl p-2.5 sm:p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                                />
                            </div>
                        </div>

                        {/* Senior Citizen Toggle */}
                        <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isSenior ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                                    <Building2 size={16} />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-foreground">Senior Citizen</p>
                                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">+0.50% Extra</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsSenior(!isSenior)}
                                className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors relative ${isSenior ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}
                            >
                                <div className={`absolute top-0.5 sm:top-1 w-4 h-4 bg-white rounded-full transition-all ${isSenior ? "left-5 sm:left-7" : "left-1"}`} />
                            </button>
                        </div>

                        {/* Compounding */}
                        <div>
                            <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2 sm:mb-3">Compounding</label>
                            <div className="flex gap-1.5 sm:gap-2">
                                {["monthly", "quarterly", "yearly"].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCompounding(c as any)}
                                        className={`flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all ${
                                            compounding === c 
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" 
                                            : "border-border text-muted-foreground hover:bg-muted"
                                        }`}
                                    >
                                        {c.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
