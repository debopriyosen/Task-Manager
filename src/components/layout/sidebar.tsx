"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, CheckCircle2, ListTodo, Settings, Folder, Plus } from "lucide-react";
import { useTasks } from "@/contexts/TasksContext";
import { useState } from "react";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { projects } = useTasks();
    const [selectedProjectId, setSelectedProjectId] = useState<string>("none");

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Subjects", href: "/dashboard/projects", icon: Folder },
        { name: "Today", href: "/dashboard/today", icon: ListTodo },
        { name: "Upcoming", href: "/dashboard/upcoming", icon: CalendarDays },
        { name: "Completed", href: "/dashboard/completed", icon: CheckCircle2 },
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={onClose}
                />
            )}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 border-r border-border bg-card/95 backdrop-blur-xl h-screen flex flex-col transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-6">
                    <Link href="/dashboard" className="flex items-center gap-2 group w-fit" onClick={onClose}>
                        <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-md">
                            <CheckCircle2 size={20} className="transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400 transition-colors duration-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                            Planora
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Tasks
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
                                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-medium"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    }`}
                            >
                                <Icon size={18} />
                                {item.name}
                            </Link>
                        );
                    })}

                    {projects.length > 0 && (
                        <>
                            <p className="px-4 mt-8 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
                                            ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-medium"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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

                <div className="p-4 mt-auto border-t border-border">
                    <Link
                        href="/dashboard/settings"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    >
                        <Settings size={18} />
                        Settings
                    </Link>
                </div>
            </aside>
        </>
    );
}
