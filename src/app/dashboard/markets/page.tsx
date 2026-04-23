"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Globe, Zap, Clock, Info, ChevronUp, ChevronDown } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from "recharts";

// Simulated live data structure
interface MarketItem {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    history: { time: string; value: number }[];
    type: "index" | "commodity";
}

const INITIAL_MARKETS: MarketItem[] = [
    {
        id: "sensex",
        name: "BSE SENSEX",
        symbol: "^BSESN",
        price: 77664.00,
        change: -850.50,
        changePercent: -1.09,
        type: "index",
        history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}`, value: 77000 + Math.random() * 1000 }))
    },
    {
        id: "nifty",
        name: "NIFTY 50",
        symbol: "^NSEI",
        price: 24173.05,
        change: -205.20,
        changePercent: -0.84,
        type: "index",
        history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}`, value: 24000 + Math.random() * 400 }))
    },
    {
        id: "gold",
        name: "Gold (24K)",
        symbol: "XAU/INR",
        price: 154750.00,
        change: 1250.00,
        changePercent: 0.81,
        type: "commodity",
        history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}`, value: 153000 + Math.random() * 2000 }))
    },
    {
        id: "silver",
        name: "Silver",
        symbol: "XAG/INR",
        price: 260000.00,
        change: 4500.00,
        changePercent: 1.76,
        type: "commodity",
        history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}`, value: 255000 + Math.random() * 10000 }))
    }
];

export default function MarketsPage() {
    const [markets, setMarkets] = useState<MarketItem[]>(INITIAL_MARKETS);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [activeTicks, setActiveTicks] = useState<{ id: string; type: "up" | "down" }[]>([]);

    // Simulated live tick update
    useEffect(() => {
        const interval = setInterval(() => {
            const indexToUpdate = Math.floor(Math.random() * markets.length);
            const market = markets[indexToUpdate];
            
            // Random movement between -0.05% and +0.05%
            const movePercent = (Math.random() - 0.5) * 0.1;
            const priceMove = market.price * (movePercent / 100);
            const newPrice = market.price + priceMove;
            const newChange = market.change + priceMove;
            const newChangePercent = (newChange / (newPrice - newChange)) * 100;

            const newHistory = [...market.history.slice(1), { time: new Date().toLocaleTimeString(), value: newPrice }];

            const updatedMarkets = [...markets];
            updatedMarkets[indexToUpdate] = {
                ...market,
                price: newPrice,
                change: newChange,
                changePercent: newChangePercent,
                history: newHistory
            };

            setMarkets(updatedMarkets);
            setLastUpdated(new Date());

            // Trigger animation
            const tickType = priceMove > 0 ? "up" : "down";
            setActiveTicks(prev => [...prev, { id: market.id, type: tickType as "up" | "down" }]);
            setTimeout(() => {
                setActiveTicks(prev => prev.filter(t => t.id !== market.id));
            }, 1000);

        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, [markets]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <Activity className="text-indigo-600" /> Market Watch
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                        Live simulated market rates for India
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-full animate-pulse">
                            <Zap size={10} /> LIVE
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground bg-card border border-border px-3 py-2 rounded-xl shadow-sm">
                    <Clock size={14} />
                    <span>Last Update: {lastUpdated.toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Market Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {markets.map((market) => {
                    const isUp = market.change >= 0;
                    const tick = activeTicks.find(t => t.id === market.id);
                    
                    return (
                        <motion.div
                            key={market.id}
                            layout
                            className={`bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all relative group ${
                                tick ? (tick.type === "up" ? "ring-1 ring-emerald-500/50" : "ring-1 ring-red-500/50") : ""
                            }`}
                        >
                            {/* Card Content */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{market.type}</p>
                                        <h3 className="text-xl font-black text-foreground mt-0.5">{market.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-mono mt-1">{market.symbol}</p>
                                    </div>
                                    <div className={`p-2.5 rounded-xl ${isUp ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "bg-red-50 dark:bg-red-500/10 text-red-600"}`}>
                                        {isUp ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-3 mb-6">
                                    <span className={`text-3xl font-black tabular-nums tracking-tighter transition-colors duration-300 ${
                                        tick ? (tick.type === "up" ? "text-emerald-500" : "text-red-500") : "text-foreground"
                                    }`}>
                                        ₹{market.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? "text-emerald-500" : "text-red-500"}`}>
                                        {isUp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        {Math.abs(market.changePercent).toFixed(2)}%
                                    </div>
                                </div>

                                {/* Mini Chart */}
                                <div className="h-24 w-full -mx-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={market.history}>
                                            <defs>
                                                <linearGradient id={`gradient-${market.id}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke={isUp ? "#10b981" : "#ef4444"}
                                                strokeWidth={2.5}
                                                fillOpacity={1}
                                                fill={`url(#gradient-${market.id})`}
                                                isAnimationActive={false}
                                            />
                                            <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold">
                                                                ₹{payload[0].value.toLocaleString()}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Footer Info */}
                            <div className="bg-muted/30 px-6 py-3 border-t border-border flex justify-between items-center text-[10px] font-medium text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Globe size={10} /> NSE / BSE India
                                </span>
                                <div className="flex gap-4">
                                    <span>High: ₹{(market.price * 1.02).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                                    <span>Low: ₹{(market.price * 0.98).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Trading News / Tips (Simulated) */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="text-yellow-500" size={20} /> Market Insights
                </h2>
                <div className="space-y-4">
                    <div className="flex gap-4 p-4 bg-muted/50 rounded-xl border border-border/50">
                        <div className="w-1 bg-indigo-500 rounded-full shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Analysis</p>
                            <p className="text-sm text-foreground mt-1 font-medium">Sensex shows strong support at 74,000 levels amid positive global cues and domestic institutional buying.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-muted/50 rounded-xl border border-border/50">
                        <div className="w-1 bg-yellow-500 rounded-full shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Commodities</p>
                            <p className="text-sm text-foreground mt-1 font-medium">Gold prices consolidate as investors weigh geopolitical risks against high interest rate environment.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notice */}
            <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                <Info className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                    <strong>Disclaimer:</strong> These prices are simulated for demonstration purposes and updated in real-time to reflect a live trading environment. Please do not use these rates for actual financial decisions.
                </p>
            </div>
        </div>
    );
}
