"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface TopbarProps {
    onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 flex items-center justify-between px-6 z-10 w-full">
            <div className="flex items-center gap-4">
                <button onClick={onOpenSidebar} className="md:hidden text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted">
                    <Menu size={20} />
                </button>
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="pl-9 pr-4 py-2 rounded-full bg-muted/50 border border-transparent focus:border-border focus:bg-background outline-none text-sm w-64 transition-all duration-200"
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
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm cursor-pointer border border-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:border-primary-800">
                    U
                </div>
            </div>
        </header>
    );
}
