"use client";

import { useState } from "react";
import { useTasks, Task } from "@/contexts/TasksContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from "recharts";
import { format, subDays, eachDayOfInterval, startOfDay, endOfDay, isWithinInterval, getDay, parseISO, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Activity, TrendingUp, Calendar as CalendarIcon, Target } from "lucide-react";

export default function AnalyticsPage() {
    const { tasks, projects } = useTasks();
    const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

    // 1. Dynamic Trend Data based on timeRange
    const getTrendData = () => {
        if (timeRange === "year") {
            const last12Months = Array.from({ length: 12 }, (_, i) => subMonths(new Date(), 11 - i));
            return last12Months.map(month => {
                const start = startOfMonth(month);
                const end = endOfMonth(month);
                const count = tasks.filter(t =>
                    t.status === "completed" &&
                    t.completed_at &&
                    isWithinInterval(parseISO(t.completed_at), { start, end })
                ).length;
                return {
                    date: format(month, "MMM yy"),
                    completed: count
                };
            });
        }

        const days = timeRange === "week" ? 7 : 30;
        const lastNDays = eachDayOfInterval({
            start: subDays(new Date(), days - 1),
            end: new Date()
        });

        return lastNDays.map(day => {
            const start = startOfDay(day);
            const end = endOfDay(day);
            const count = tasks.filter(t =>
                t.status === "completed" &&
                t.completed_at &&
                isWithinInterval(parseISO(t.completed_at), { start, end })
            ).length;
            return {
                date: format(day, timeRange === "week" ? "EEE" : "MMM dd"),
                completed: count
            };
        });
    };

    const completionTrendData = getTrendData();

    // 2. Productivity by Day of Week (All Time)
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const productivityByDay = dayNames.map((name, index) => {
        const count = tasks.filter(t =>
            t.status === "completed" &&
            t.completed_at &&
            getDay(parseISO(t.completed_at)) === index
        ).length;

        return {
            day: name.substring(0, 3), // Mon, Tue, etc.
            fullName: name,
            tasks: count
        };
    });

    // Find most productive day
    let mostProductiveDay = { name: "N/A", count: 0 };
    productivityByDay.forEach(d => {
        if (d.tasks > mostProductiveDay.count) {
            mostProductiveDay = { name: d.fullName, count: d.tasks };
        }
    });

    // 3. Project Progress Data
    const projectProgressData = projects.map(p => {
        const projectTasks = tasks.filter(t => t.projectId === p.id);
        const completed = projectTasks.filter(t => t.status === "completed").length;
        const total = projectTasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        const colorVar = p.color.replace('bg-', 'text-').replace('-500', '-600');

        return {
            ...p,
            completed,
            total,
            percentage,
            colorVar
        };
    }).sort((a, b) => b.percentage - a.percentage); // Sort highest progress first

    // Overall stats
    const totalCompletedAllTime = tasks.filter(t => t.status === "completed").length;
    const completedInRange = completionTrendData.reduce((acc, curr) => acc + curr.completed, 0);

    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <Activity className="text-indigo-600" />
                        Productivity Analytics
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Insights into your work patterns and project progress</p>
                </div>

                {/* Filter Selector */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit self-start md:self-center">
                    {(["week", "month", "year"] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                }`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 capitalize">Completed ({timeRange === 'year' ? 'Last 12 Months' : `Last ${timeRange === 'week' ? '7' : '30'} Days`})</p>
                        <p className="text-2xl font-bold text-slate-800">{completedInRange} <span className="text-sm font-normal text-slate-400">tasks</span></p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Target size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">All Time Completed</p>
                        <p className="text-2xl font-bold text-slate-800">{totalCompletedAllTime} <span className="text-sm font-normal text-slate-400">tasks</span></p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Most Productive Day</p>
                        <p className="text-xl font-bold text-slate-800">{mostProductiveDay.count > 0 ? mostProductiveDay.name : "Need more data"}</p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Trend Chart */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6 drop-shadow-sm capitalize">
                        Completion Trend ({timeRange === 'year' ? 'Last 12 Months' : `Last ${timeRange === 'week' ? '7' : '30'} Days`})
                    </h2>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={completionTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`${value} tasks`, 'Completed']}
                                    labelStyle={{ color: '#475569', fontWeight: 500, marginBottom: '4px' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="#4F46E5"
                                    strokeWidth={3}
                                    dot={{ r: timeRange === "month" ? 2 : 4, fill: '#4F46E5', strokeWidth: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Day of Week Chart */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6 drop-shadow-sm">Tasks by Day of Week (All Time)</h2>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productivityByDay} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="day"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F1F5F9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`${value} tasks`, 'Completed']}
                                />
                                <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
                                    {productivityByDay.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fullName === mostProductiveDay.name && entry.tasks > 0 ? '#10B981' : '#94A3B8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Subject Progress */}
            {projectProgressData.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm mt-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6 drop-shadow-sm">Subject Progress Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projectProgressData.map(project => (
                            <div key={project.id} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${project.color}`} />
                                        <span className="font-medium text-slate-700">{project.name}</span>
                                    </div>
                                    <span className="text-sm text-slate-500 font-medium">
                                        {project.completed} / {project.total} ({project.percentage}%)
                                    </span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${project.color} transition-all duration-1000 ease-out`}
                                        style={{ width: `${project.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
