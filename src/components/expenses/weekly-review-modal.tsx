"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Target, PieChart, Sparkles } from "lucide-react";

interface WeeklyReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        totalThisWeek: number;
        totalLastWeek: number;
        percentageChange: number;
        topCategory: string;
        topCategoryAmount: number;
        forecast: number;
        budget: number;
    };
}

export function WeeklyReviewModal({ isOpen, onClose, data }: WeeklyReviewModalProps) {
    if (!isOpen) return null;

    const trend = data.totalThisWeek >= data.totalLastWeek ? "up" : "down";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative">
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="text-yellow-300 fill-yellow-300" size={24} />
                            <h2 className="text-2xl font-bold">Weekly Review</h2>
                        </div>
                        <p className="text-indigo-100 opacity-90">Great job tracking your finances this week!</p>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Weekly Comparison */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/50 p-4 rounded-2xl border border-border">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">This Week</p>
                                <p className="text-2xl font-bold mt-1">₹{data.totalThisWeek.toLocaleString('en-IN')}</p>
                                <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {Math.abs(data.percentageChange).toFixed(1)}% {trend === 'up' ? 'inc' : 'dec'}
                                </div>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-2xl border border-border">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Category</p>
                                <p className="text-xl font-bold mt-1 truncate">{data.topCategory}</p>
                                <p className="text-sm text-muted-foreground mt-2">₹{data.topCategoryAmount.toLocaleString('en-IN')}</p>
                            </div>
                        </div>

                        {/* Forecast & Budget */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Target className="text-indigo-500" size={20} />
                                    <h3 className="font-semibold text-foreground">Monthly Forecast</h3>
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">Budget: ₹{data.budget.toLocaleString('en-IN')}</p>
                            </div>
                            
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                            Forecasted: ₹{data.forecast.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold inline-block text-indigo-600">
                                            {((data.forecast / (data.budget || 1)) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((data.forecast / (data.budget || 1)) * 100, 100)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${data.forecast > data.budget ? 'bg-red-500' : 'bg-indigo-500'}`}
                                    ></motion.div>
                                </div>
                                {data.forecast > data.budget && data.budget > 0 && (
                                    <p className="text-xs text-red-500 font-medium">Careful! You're projected to exceed your budget.</p>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={onClose}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Got it, keep tracking!
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
