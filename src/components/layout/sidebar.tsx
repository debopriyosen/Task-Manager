"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, CheckCircle2, ListTodo, Settings, Folder, Plus } from "lucide-react";
import { useTasks } from "@/contexts/TasksContext";
import { useState } from "react";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";

export function Sidebar() {
    const pathname = usePathname();
    const { projects } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("none");

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Subjects", href: "/dashboard/projects", icon: Folder },
        { name: "Today", href: "/dashboard/today", icon: ListTodo },
        { name: "Upcoming", href: "/dashboard/upcoming", icon: CalendarDays },
        { name: "Completed", href: "/dashboard/completed", icon: CheckCircle2 },
    ];

    return (
        <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl h-screen flex flex-col hidden md:flex sticky top-0">
            <div className="p-6">
                <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                        <CheckCircle2 size={20} />
                    </div>
                    TaskFlow AI
                </h1>
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
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                >
                    <Settings size={18} />
                    Settings
                </Link>
            </div>
        </aside>
    );
}
