"use client";

import { useEffect, useState } from "react";
import { useExpenses } from "@/contexts/ExpensesContext";
import { useTasks } from "@/contexts/TasksContext";
import { showNotification } from "@/lib/notification";
import { subDays, isWithinInterval, startOfDay, endOfDay, format, startOfMonth, endOfMonth, getDaysInMonth, getDate } from "date-fns";
import { WeeklyReviewModal } from "./weekly-review-modal";

export function WeeklyExpenseReminder() {
    const { expenses, monthlyBudget } = useExpenses();
    const { notificationsEnabled } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const checkExpensesLogic = async () => {
            const now = new Date();
            const today = format(now, "yyyy-MM-DD");

            // --- 1. DAILY SPENDING NUDGE (Suggestion 5) ---
            const lastDailyNudge = localStorage.getItem("planora_last_daily_nudge");
            if (lastDailyNudge !== today) {
                // If it's evening (e.g., after 8 PM) and no expenses today
                if (now.getHours() >= 20) {
                    const todayExpenses = expenses.filter(e => e.date === today);
                    if (todayExpenses.length === 0 && notificationsEnabled) {
                        showNotification("Daily Spending Nudge", {
                            body: "You haven't logged any expenses today. Keep your tracker updated!",
                            icon: "/icon-192x192.png",
                            tag: "daily-nudge"
                        });
                    }
                    localStorage.setItem("planora_last_daily_nudge", today);
                }
            }

            // --- 2. BUDGET THRESHOLD ALERTS (Suggestion 2 & 6) ---
            const monthStart = startOfMonth(now);
            const monthEnd = endOfMonth(now);
            const monthlyExpenses = expenses.filter(e => {
                const d = new Date(e.date);
                return isWithinInterval(d, { start: monthStart, end: monthEnd });
            });
            const totalMonthly = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);

            if (monthlyBudget > 0 && notificationsEnabled) {
                const lastBudgetAlert = localStorage.getItem("planora_last_budget_alert_threshold");
                const currentThreshold = totalMonthly / monthlyBudget;

                if (currentThreshold >= 1 && lastBudgetAlert !== "100") {
                    showNotification("Budget Alert: 100%", {
                        body: `Warning! You have reached your monthly budget of ₹${monthlyBudget}.`,
                        icon: "/icon-192x192.png",
                        tag: "budget-100"
                    });
                    localStorage.setItem("planora_last_budget_alert_threshold", "100");
                } else if (currentThreshold >= 0.8 && lastBudgetAlert !== "80" && lastBudgetAlert !== "100") {
                    showNotification("Budget Alert: 80%", {
                        body: `You've used 80% of your monthly budget (₹${totalMonthly} of ₹${monthlyBudget}).`,
                        icon: "/icon-192x192.png",
                        tag: "budget-80"
                    });
                    localStorage.setItem("planora_last_budget_alert_threshold", "80");
                }
            }

            // --- 3. WEEKLY REPORT & MODAL (Suggestion 1 & 3) ---
            const lastReportDate = localStorage.getItem("planora_last_weekly_report");
            if (!lastReportDate || (now.getTime() - new Date(lastReportDate).getTime()) > 7 * 24 * 60 * 60 * 1000) {
                
                const thisWeekStart = startOfDay(subDays(now, 7));
                const thisWeekEnd = endOfDay(now);
                const lastWeekStart = startOfDay(subDays(now, 14));
                const lastWeekEnd = endOfDay(subDays(now, 8));

                const thisWeekExpenses = expenses.filter(e => {
                    const d = new Date(e.date);
                    return isWithinInterval(d, { start: thisWeekStart, end: thisWeekEnd });
                });

                const lastWeekExpenses = expenses.filter(e => {
                    const d = new Date(e.date);
                    return isWithinInterval(d, { start: lastWeekStart, end: lastWeekEnd });
                });

                const totalThisWeek = thisWeekExpenses.reduce((acc, curr) => acc + curr.amount, 0);
                const totalLastWeek = lastWeekExpenses.reduce((acc, curr) => acc + curr.amount, 0);

                if (totalThisWeek > 0 || totalLastWeek > 0) {
                    const percentageChange = totalLastWeek === 0 ? 100 : ((totalThisWeek - totalLastWeek) / totalLastWeek) * 100;
                    
                    // Smart Category Insight
                    const categoryMap: Record<string, number> = {};
                    thisWeekExpenses.forEach(e => {
                        categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
                    });
                    const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
                    const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : "None";
                    const topCategoryAmount = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;

                    // Forecast
                    const daysInMonth = getDaysInMonth(now);
                    const currentDay = getDate(now);
                    const forecast = (totalMonthly / currentDay) * daysInMonth;

                    const data = {
                        totalThisWeek,
                        totalLastWeek,
                        percentageChange,
                        topCategory,
                        topCategoryAmount,
                        forecast,
                        budget: monthlyBudget
                    };

                    setModalData(data);
                    setIsModalOpen(true);

                    if (notificationsEnabled) {
                        showNotification("Weekly Expense Review", {
                            body: `Spent ₹${totalThisWeek.toLocaleString()} this week. Top category: ${topCategory}.`,
                            icon: "/icon-192x192.png",
                            tag: "weekly-review"
                        });
                    }

                    localStorage.setItem("planora_last_weekly_report", now.toISOString());
                }
            }
        };

        const timer = setTimeout(checkExpensesLogic, 3000);
        return () => clearTimeout(timer);
    }, [expenses, monthlyBudget, notificationsEnabled]);

    return (
        <WeeklyReviewModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            data={modalData} 
        />
    );
}
