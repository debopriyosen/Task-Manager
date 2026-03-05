"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import confetti from "canvas-confetti";

export type Priority = "low" | "medium" | "high";
export type Status = "pending" | "on_track" | "completed";

export interface Subtask {
    id: string;
    title: string;
    is_completed: boolean;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    color: string;
    created_at: string;
}

export interface Reminder {
    id: string;
    title: string;
    date: string; // ISO date format for the day it's scheduled
    time?: string; // Optional time of day 09:00
    color: string;
    created_at: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    projectId?: string;
    due_date?: string;
    priority: Priority;
    status: Status;
    reminder_time?: string;
    reminder_sent: boolean;
    subtasks: Subtask[];
    created_at: string;
}

interface TasksContextType {
    projects: Project[];
    addProject: (project: Omit<Project, "id" | "created_at">) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;

    reminders: Reminder[];
    addReminder: (reminder: Omit<Reminder, "id" | "created_at">) => void;
    updateReminder: (id: string, updates: Partial<Reminder>) => void;
    deleteReminder: (id: string) => void;

    tasks: Task[];
    addTask: (task: Omit<Task, "id" | "status" | "reminder_sent" | "created_at">) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleTaskStatus: (id: string) => void;
    toggleSubtaskStatus: (taskId: string, subtaskId: string) => void;
    userEmail: string;
    setUserEmail: (email: string) => void;
    userName: string;
    setUserName: (name: string) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [userEmail, setUserEmail] = useState<string>("user@example.com");
    const [userName, setUserName] = useState<string>("User");
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        const savedProjects = localStorage.getItem("taskflow_projects");
        if (savedProjects) {
            try {
                setProjects(JSON.parse(savedProjects));
            } catch (e) {
                console.error("Failed to parse projects");
            }
        }

        const savedReminders = localStorage.getItem("taskflow_reminders");
        if (savedReminders) {
            try {
                setReminders(JSON.parse(savedReminders));
            } catch (e) {
                console.error("Failed to parse reminders");
            }
        }

        const saved = localStorage.getItem("taskflow_tasks");
        if (saved) {
            try {
                setTasks(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse tasks");
            }
        }

        const savedEmail = localStorage.getItem("taskflow_email");
        if (savedEmail) {
            setUserEmail(savedEmail);
        }

        const savedName = localStorage.getItem("taskflow_name");
        if (savedName) {
            setUserName(savedName);
        }

        setIsLoaded(true);
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("taskflow_projects", JSON.stringify(projects));
            localStorage.setItem("taskflow_reminders", JSON.stringify(reminders));
            localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
            localStorage.setItem("taskflow_email", userEmail);
            localStorage.setItem("taskflow_name", userName);
        }
    }, [projects, reminders, tasks, userEmail, userName, isLoaded]);

    const addProject = (projectData: Omit<Project, "id" | "created_at">) => {
        const newProject: Project = {
            ...projectData,
            id: uuidv4(),
            created_at: new Date().toISOString(),
        };
        setProjects((prev) => [...prev, newProject]);
    };

    const updateProject = (id: string, updates: Partial<Project>) => {
        setProjects((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
    };

    const deleteProject = (id: string) => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        // Detach tasks belonging to this project instead of deleting them
        setTasks((prev) => prev.map(t => t.projectId === id ? { ...t, projectId: undefined } : t));
    };

    const addReminder = (reminderData: Omit<Reminder, "id" | "created_at">) => {
        const newReminder: Reminder = {
            ...reminderData,
            id: uuidv4(),
            created_at: new Date().toISOString(),
        };
        setReminders((prev) => [...prev, newReminder]);
    };

    const updateReminder = (id: string, updates: Partial<Reminder>) => {
        setReminders((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
        );
    };

    const deleteReminder = (id: string) => {
        setReminders((prev) => prev.filter((r) => r.id !== id));
    };

    const addTask = (taskData: Omit<Task, "id" | "status" | "reminder_sent" | "created_at"> & { status?: Status }) => {
        const newTask: Task = {
            ...taskData,
            id: uuidv4(),
            status: taskData.status || "pending",
            reminder_sent: false,
            created_at: new Date().toISOString(),
        };
        setTasks((prev) => [...prev, newTask]);
    };

    const triggerConfetti = () => {
        if (typeof window !== 'undefined') {
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                zIndex: 9999,
                colors: ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'], // match app primary colors
            });
        }
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id === id) {
                    if (updates.status === "completed" && t.status !== "completed") {
                        triggerConfetti();
                    }
                    return { ...t, ...updates };
                }
                return t;
            })
        );
    };

    const deleteTask = (id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    const toggleTaskStatus = (id: string) => {
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id !== id) return t;
                let nextStatus: Status = "pending";
                if (t.status === "pending") nextStatus = "on_track";
                else if (t.status === "on_track") {
                    nextStatus = "completed";
                    triggerConfetti();
                }
                else if (t.status === "completed") nextStatus = "pending";
                return { ...t, status: nextStatus };
            })
        );
    };

    const toggleSubtaskStatus = (taskId: string, subtaskId: string) => {
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id !== taskId) return t;
                const newSubtasks = t.subtasks.map((st) =>
                    st.id === subtaskId ? { ...st, is_completed: !st.is_completed } : st
                );
                return { ...t, subtasks: newSubtasks };
            })
        );
    };

    // Reminder Checker (Client-Side Polling)
    useEffect(() => {
        if (!isLoaded || tasks.length === 0) return;

        const interval = setInterval(() => {
            const now = new Date();

            tasks.forEach(async (task) => {
                if (!task.reminder_sent && task.reminder_time && task.status !== "completed") {
                    const reminderTime = new Date(task.reminder_time);
                    if (now >= reminderTime) {
                        // Mark as sent immediately to prevent duplicates
                        updateTask(task.id, { reminder_sent: true });

                        try {
                            // Send the email
                            await fetch("/api/reminders/send", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    email: userEmail,
                                    taskTitle: task.title,
                                    dueTime: task.due_date,
                                    priority: task.priority,
                                }),
                            });
                            console.log(`Reminder sent for task: ${task.title}`);
                        } catch (error) {
                            console.error("Failed to send reminder via API", error);
                            // Revert if API failed so we try again? For now just log.
                        }
                    }
                }
            });
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [tasks, isLoaded, userEmail]);

    return (
        <TasksContext.Provider
            value={{
                projects,
                addProject,
                updateProject,
                deleteProject,
                reminders,
                addReminder,
                updateReminder,
                deleteReminder,
                tasks,
                addTask,
                updateTask,
                deleteTask,
                toggleTaskStatus,
                toggleSubtaskStatus,
                userEmail,
                setUserEmail,
                userName,
                setUserName,
            }}
        >
            {children}
        </TasksContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TasksContext);
    if (context === undefined) {
        throw new Error("useTasks must be used within a TasksProvider");
    }
    return context;
}
