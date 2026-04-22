"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, CheckCircle2, ListTodo, Settings, Folder, Activity, PieChart, TrendingUp, Receipt, Target, Wallet } from "lucide-react";
import { useTasks } from "@/contexts/TasksContext";
import { useAppMode } from "@/contexts/AppModeContext";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { projects } = useTasks();
    const { mode } = useAppMode();

    const taskNavItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Analytics", href: "/dashboard/analytics", icon: Activity },
        { name: "Subjects", href: "/dashboard/projects", icon: Folder },
        { name: "Today", href: "/dashboard/today", icon: ListTodo },
        { name: "Upcoming", href: "/dashboard/upcoming", icon: CalendarDays },
        { name: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
        { name: "Completed", href: "/dashboard/completed", icon: CheckCircle2 },
    ];

    const expenseNavItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Analytics", href: "/dashboard/analytics", icon: PieChart },
        { name: "Savings Goals", href: "/dashboard/savings", icon: Target },
    ];

    const navItems = mode === "tasks" ? taskNavItems : expenseNavItems;
    const accentColor = mode === "expenses" ? "emerald" : "indigo";

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={onClose}
                />
            )}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 ${
                mode === "expenses" 
                    ? "bg-emerald-950 dark:bg-emerald-950 border-emerald-800" 
                    : "bg-slate-900 dark:bg-slate-950 border-slate-800"
            } border-r text-slate-200 h-screen flex flex-col transition-all duration-300 md:sticky md:top-0 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className={`h-16 px-6 border-b ${
                    mode === "expenses" ? "border-emerald-800" : "border-slate-800"
                } flex items-center shrink-0`}>
                    <Link href="/dashboard" className="flex items-center gap-2 group w-fit" onClick={onClose}>
                        <div className={`w-8 h-8 rounded-xl ${
                            mode === "expenses" ? "bg-emerald-600" : "bg-indigo-600"
                        } flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
                            {mode === "expenses" ? <Wallet size={20} /> : <CheckCircle2 size={20} />}
                        </div>
                        <span className="text-xl font-bold text-white transition-opacity duration-300 group-hover:opacity-80">
                            Planora
                        </span>
                    </Link>
                </div>

                <div className={`flex-1 flex flex-col ${
                    mode === "expenses" ? "bg-emerald-950 dark:bg-emerald-950" : "bg-slate-900 dark:bg-slate-950"
                } overflow-hidden`}>

                    <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                        <p className={`px-4 text-xs font-semibold uppercase tracking-wider mb-2 ${
                            mode === "expenses" ? "text-emerald-500" : "text-slate-500"
                        }`}>
                            {mode === "expenses" ? "Finance" : "Tasks"}
                        </p>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                        ? `${mode === "expenses" ? "bg-emerald-600" : "bg-indigo-600"} text-white font-medium shadow-sm`
                                        : `${mode === "expenses" ? "text-emerald-300/70 hover:bg-emerald-900 hover:text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
                                        }`}
                                >
                                    <Icon size={18} />
                                    {item.name}
                                </Link>
                            );
                        })}

                        {/* Projects - only in tasks mode */}
                        {mode === "tasks" && projects.length > 0 && (
                            <>
                                <p className="px-4 mt-8 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Subjects
                                </p>
                                {projects.map((project) => {
                                    const isActive = pathname === `/dashboard/projects/${project.id}`;
                                    return (
                                        <Link
                                            key={project.id}
                                            href={`/dashboard/projects/${project.id}`}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                                ? "bg-indigo-600 text-white font-medium shadow-sm"
                                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                                }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${project.color || 'bg-primary-500'}`} />
                                            <span className="truncate">{project.name}</span>
                                        </Link>
                                    );
                                })}
                            </>
                        )}
                    </nav>

                    <div className={`p-4 mt-auto border-t ${
                        mode === "expenses" ? "border-emerald-800" : "border-slate-800"
                    } shrink-0`}>
                        <Link
                            href="/dashboard/settings"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                                mode === "expenses" 
                                    ? "text-emerald-300/70 hover:bg-emerald-900 hover:text-white" 
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                        >
                            <Settings size={18} />
                            Settings
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}
