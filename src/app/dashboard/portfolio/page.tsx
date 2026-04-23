"use client";

import { useState, useEffect, useMemo } from "react";
import { useExpenses, InvestmentHolding } from "@/contexts/ExpensesContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Wallet, Plus, Trash2, TrendingUp, TrendingDown, 
    ArrowUpRight, ArrowDownRight, Briefcase, 
    ChevronRight, X, Clock, PieChart, Activity
} from "lucide-react";
import { format } from "date-fns";

// Base prices to match Market Watch page
const BASE_PRICES: Record<string, number> = {
    sensex: 77664.00,
    nifty: 24173.05,
    gold: 154750.00,
    silver: 260000.00
};

const ASSET_NAMES: Record<string, string> = {
    sensex: "BSE SENSEX",
    nifty: "NIFTY 50",
    gold: "Gold (24K)",
    silver: "Silver"
};

export default function PortfolioPage() {
    const { holdings, addHolding, deleteHolding } = useExpenses();
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Live price simulation
    const [livePrices, setLivePrices] = useState(BASE_PRICES);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setLivePrices(prev => {
                const newPrices = { ...prev };
                Object.keys(newPrices).forEach(key => {
                    const move = (Math.random() - 0.5) * 0.0005; // Tiny fluctuations
                    newPrices[key] = prev[key] * (1 + move);
                });
                return newPrices;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Calculations
    const portfolioStats = useMemo(() => {
        let totalInvested = 0;
        let currentValue = 0;
        
        const assetBreakdown = holdings.reduce((acc, h) => {
            const currentPrice = livePrices[h.assetId] || h.buyPrice;
            const invested = h.quantity * h.buyPrice;
            const value = h.quantity * currentPrice;
            
            totalInvested += invested;
            currentValue += value;
            
            if (!acc[h.assetId]) {
                acc[h.assetId] = { invested: 0, current: 0, quantity: 0 };
            }
            acc[h.assetId].invested += invested;
            acc[h.assetId].current += value;
            acc[h.assetId].quantity += h.quantity;
            
            return acc;
        }, {} as Record<string, { invested: number; current: number; quantity: number }>);

        const profitLoss = currentValue - totalInvested;
        const profitLossPct = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

        return { totalInvested, currentValue, profitLoss, profitLossPct, assetBreakdown };
    }, [holdings, livePrices]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <Briefcase className="text-indigo-600" /> Investment Portfolio
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your holdings and track live performance</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    <Plus size={18} /> Add Holding
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Value</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-3xl font-black text-foreground tabular-nums">₹{portfolioStats.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</h2>
                    </div>
                    <div className={`flex items-center gap-1 mt-2 text-sm font-bold ${portfolioStats.profitLoss >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {portfolioStats.profitLoss >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        ₹{Math.abs(portfolioStats.profitLoss).toLocaleString("en-IN", { maximumFractionDigits: 0 })} ({Math.abs(portfolioStats.profitLossPct).toFixed(2)}%)
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Invested</p>
                    <h2 className="text-2xl font-bold text-foreground tabular-nums">₹{portfolioStats.totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</h2>
                    <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-full" />
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Portfolio Health</p>
                        <div className="flex items-center gap-2">
                            <Activity className={portfolioStats.profitLossPct > 0 ? "text-emerald-500" : "text-indigo-500"} size={20} />
                            <span className="text-lg font-bold text-foreground">
                                {portfolioStats.profitLossPct > 10 ? "Excellent" : portfolioStats.profitLossPct > 0 ? "Healthy" : holdings.length === 0 ? "Ready to Start" : "Needs Review"}
                            </span>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Live performance updated every 3 seconds</p>
                </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-bold text-foreground flex items-center gap-2">
                        <PieChart size={18} className="text-indigo-500" /> My Holdings
                    </h2>
                    <span className="text-xs text-muted-foreground">{holdings.length} Assets</span>
                </div>
                
                {holdings.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="text-muted-foreground" size={24} />
                        </div>
                        <h3 className="font-bold text-foreground">No holdings found</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">Start tracking your investments by adding your first holding.</p>
                        <button onClick={() => setShowAddModal(true)} className="text-indigo-600 font-bold text-sm hover:underline">Add Asset Now</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30">
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asset</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Quantity</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Avg. Price</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Live Price</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Value / P&L</th>
                                    <th className="px-6 py-4 text-center"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {holdings.map((h) => {
                                    const currentPrice = livePrices[h.assetId] || h.buyPrice;
                                    const value = h.quantity * currentPrice;
                                    const pl = value - (h.quantity * h.buyPrice);
                                    const plPct = ((currentPrice - h.buyPrice) / h.buyPrice) * 100;
                                    
                                    return (
                                        <motion.tr 
                                            key={h.id} 
                                            layout
                                            className="border-b border-border hover:bg-muted/20 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-foreground">{h.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-mono">{h.assetId.toUpperCase()}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">{h.quantity.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-medium text-muted-foreground">₹{h.buyPrice.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right tabular-nums font-bold">₹{currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="font-black text-foreground">₹{value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                                <p className={`text-[10px] font-bold ${pl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                    {pl >= 0 ? "+" : "-"}₹{Math.abs(pl).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({plPct.toFixed(2)}%)
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => deleteHolding(h.id)}
                                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all lg:opacity-0 lg:group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Holding Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddHoldingModal onClose={() => setShowAddModal(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}

function AddHoldingModal({ onClose }: { onClose: () => void }) {
    const { addHolding } = useExpenses();
    const [assetId, setAssetId] = useState("nifty");
    const [quantity, setQuantity] = useState("");
    const [buyPrice, setBuyPrice] = useState("");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quantity || !buyPrice) return;
        
        addHolding({
            assetId,
            name: ASSET_NAMES[assetId],
            quantity: Number(quantity),
            buyPrice: Number(buyPrice),
            date
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
                <div className="bg-indigo-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Plus size={22} /> Add Asset</h2>
                        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"><X size={20} /></button>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-2">Select Asset</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(ASSET_NAMES).map(([id, name]) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => {
                                        setAssetId(id);
                                        setBuyPrice(BASE_PRICES[id].toString());
                                    }}
                                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                        assetId === id 
                                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/30" 
                                        : "border-border hover:bg-muted"
                                    }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                            <input 
                                type="number" 
                                step="any"
                                value={quantity} 
                                onChange={(e) => setQuantity(e.target.value)} 
                                className="w-full mt-1 bg-muted border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                                placeholder="0.00"
                                required 
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Buy Price (₹)</label>
                            <input 
                                type="number" 
                                step="any"
                                value={buyPrice} 
                                onChange={(e) => setBuyPrice(e.target.value)} 
                                className="w-full mt-1 bg-muted border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                                placeholder="₹0.00"
                                required 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            className="w-full mt-1 bg-muted border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium" 
                            required 
                        />
                    </div>

                    <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-[0.98]">
                        Save Asset
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
