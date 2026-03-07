"use client";

import { Menu, Search, Folder, CheckCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useTasks } from "@/contexts/TasksContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, BellOff } from "lucide-react";
import { requestNotificationPermission, checkNotificationPermission } from "@/lib/notification";

interface TopbarProps {
    onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
    const [mounted, setMounted] = useState(false);
    const { userName, tasks, projects } = useTasks();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined") {
            setNotificationPermission(checkNotificationPermission());
        }
    }, []);

    const handleRequestPermission = async () => {
        const permission = await requestNotificationPermission();
        setNotificationPermission(permission);
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredTasks = tasks.filter(t =>
        t.status !== "completed" &&
        (t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5); // limit to 5

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3); // limit to 3

    const handleNavigate = (path: string) => {
        setIsSearchOpen(false);
        setSearchQuery("");
        router.push(path);
    };

    return (
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 flex items-center justify-between px-6 z-10 w-full transition-colors duration-300">
            <div className="flex items-center gap-4">
                <button onClick={onOpenSidebar} className="md:hidden text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted">
                    <Menu size={20} />
                </button>
                <div className="relative hidden sm:block" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Search tasks and projects..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        className="pl-9 pr-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm w-64 focus:w-72 transition-all duration-300 dark:text-slate-200 dark:placeholder-slate-400"
                    />

                    {/* Search Dropdown */}
                    {isSearchOpen && searchQuery.trim().length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="max-h-96 overflow-y-auto p-2">
                                {filteredProjects.length === 0 && filteredTasks.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                                        No results found for "{searchQuery}"
                                    </div>
                                ) : (
                                    <>
                                        {/* Projects Section */}
                                        {filteredProjects.length > 0 && (
                                            <div className="mb-2">
                                                <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Projects
                                                </div>
                                                {filteredProjects.map(project => (
                                                    <button
                                                        key={project.id}
                                                        onClick={() => handleNavigate(`/dashboard/projects/${project.id}`)}
                                                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                    >
                                                        <Folder size={16} className="text-indigo-500 flex-shrink-0" />
                                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{project.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Separator if both exist */}
                                        {filteredProjects.length > 0 && filteredTasks.length > 0 && (
                                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>
                                        )}

                                        {/* Tasks Section */}
                                        {filteredTasks.length > 0 && (
                                            <div>
                                                <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Tasks
                                                </div>
                                                {filteredTasks.map(task => (
                                                    <button
                                                        key={task.id}
                                                        onClick={() => handleNavigate(task.projectId ? `/dashboard/projects/${task.projectId}` : `/dashboard`)}
                                                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                    >
                                                        <CheckCircle size={16} className="text-slate-400 flex-shrink-0" />
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{task.title}</span>
                                                            {task.description && (
                                                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{task.description}</span>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {mounted && (
                    <button
                        onClick={handleRequestPermission}
                        className={`p-2 rounded-full transition-all duration-300 ${notificationPermission === "granted"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40"
                            }`}
                        title={notificationPermission === "granted" ? "Notifications Enabled" : "Enable Notifications"}
                    >
                        {notificationPermission === "granted" ? <Bell size={18} /> : <BellOff size={18} />}
                    </button>
                )}

                <Link href="/dashboard/settings">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm cursor-pointer border border-blue-200 hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 transition-all">
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </div>
                </Link>
            </div>
        </header>
    );
}
