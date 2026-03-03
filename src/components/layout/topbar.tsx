"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTasks } from "@/contexts/TasksContext";
import Link from "next/link";

interface TopbarProps {
    onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { userName } = useTasks();

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 flex items-center justify-between px-6 z-10 w-full transition-colors duration-300">
            <div className="flex items-center gap-4">
                <button onClick={onOpenSidebar} className="md:hidden text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted">
                    <Menu size={20} />
                </button>
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="pl-9 pr-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm w-64 focus:w-72 transition-all duration-300"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                )}
                <Link href="/dashboard/settings">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm cursor-pointer border border-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-800 hover:ring-2 hover:ring-offset-2 hover:ring-indigo-500 transition-all dark:hover:ring-offset-background">
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </div>
                </Link>
            </div>
        </header>
    );
}
