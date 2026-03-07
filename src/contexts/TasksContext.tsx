"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import confetti from "canvas-confetti";
import { showNotification } from "@/lib/notification";

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
    reminder_sent?: boolean;
    isAlarm?: boolean;
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
    isAlarm: boolean;
    subtasks: Subtask[];
    created_at: string;
    completed_at?: string;
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
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void;
    alarmEnabled: boolean;
    setAlarmEnabled: (enabled: boolean) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [userEmail, setUserEmail] = useState<string>("user@example.com");
    const [userName, setUserName] = useState<string>("User");
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
    const [alarmEnabled, setAlarmEnabled] = useState<boolean>(true);
    const [isLoaded, setIsLoaded] = useState(false);

    // Refs to avoid stale closures in setInterval
    const tasksRef = React.useRef<Task[]>([]);
    const remindersRef = React.useRef<Reminder[]>([]);
    const notificationsEnabledRef = React.useRef<boolean>(true);
    const alarmEnabledRef = React.useRef<boolean>(true);

    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);

    useEffect(() => {
        remindersRef.current = reminders;
    }, [reminders]);

    useEffect(() => {
        notificationsEnabledRef.current = notificationsEnabled;
    }, [notificationsEnabled]);

    useEffect(() => {
        alarmEnabledRef.current = alarmEnabled;
    }, [alarmEnabled]);

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

        const savedNotifications = localStorage.getItem("taskflow_notifications");
        if (savedNotifications !== null) {
            setNotificationsEnabled(savedNotifications === "true");
        }

        const savedAlarm = localStorage.getItem("taskflow_alarm");
        if (savedAlarm !== null) {
            setAlarmEnabled(savedAlarm === "true");
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
            localStorage.setItem("taskflow_notifications", String(notificationsEnabled));
            localStorage.setItem("taskflow_alarm", String(alarmEnabled));
        }
    }, [projects, reminders, tasks, userEmail, userName, notificationsEnabled, alarmEnabled, isLoaded]);

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
            reminder_sent: false,
            isAlarm: reminderData.isAlarm || false,
            created_at: new Date().toISOString(),
        };
        setReminders((prev) => [...prev, newReminder]);
    };

    const updateReminder = (id: string, updates: Partial<Reminder>) => {
        setReminders((prev) =>
            prev.map((r) => {
                if (r.id === id) {
                    // Reset sent flag if date or time changes
                    const hasTimeChange = updates.date !== undefined || updates.time !== undefined;
                    return {
                        ...r,
                        ...updates,
                        reminder_sent: hasTimeChange ? false : (updates.reminder_sent ?? r.reminder_sent)
                    };
                }
                return r;
            })
        );
    };

    const deleteReminder = (id: string) => {
        setReminders((prev) => prev.filter((r) => r.id !== id));
    };

    const addTask = (taskData: Omit<Task, "id" | "status" | "reminder_sent" | "created_at" | "isAlarm"> & { status?: Status, isAlarm?: boolean }) => {
        const newTask: Task = {
            ...taskData,
            id: uuidv4(),
            status: taskData.status || "pending",
            reminder_sent: false,
            isAlarm: taskData.isAlarm || false,
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
                    let additionalUpdates: Partial<Task> = {};
                    if (updates.status === "completed" && t.status !== "completed") {
                        triggerConfetti();
                        additionalUpdates.completed_at = new Date().toISOString();
                    } else if (updates.status && updates.status !== "completed" && t.status === "completed") {
                        additionalUpdates.completed_at = undefined;
                    }
                    return { ...t, ...updates, ...additionalUpdates };
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
                let completedAt = t.completed_at;

                if (t.status === "pending") {
                    nextStatus = "on_track";
                } else if (t.status === "on_track") {
                    nextStatus = "completed";
                    completedAt = new Date().toISOString();
                    triggerConfetti();
                } else if (t.status === "completed") {
                    nextStatus = "pending";
                    completedAt = undefined;
                }
                return { ...t, status: nextStatus, completed_at: completedAt };
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

    // Reminder Checker (Client-Side Polling) - Refactored for stability
    useEffect(() => {
        if (!isLoaded) return;

        console.log("Starting active reminder polling...");
        const interval = setInterval(() => {
            const now = new Date();
            const currentTasks = tasksRef.current;
            const currentReminders = remindersRef.current;

            // 1. Check Tasks
            currentTasks.forEach(async (task) => {
                if (!task.reminder_sent && task.reminder_time && task.status !== "completed") {
                    const reminderDate = new Date(task.reminder_time);

                    // Logic: If current time is past or within 2 seconds of reminder time
                    if (now >= reminderDate) {
                        console.log(`Triggering reminder for task: ${task.title} (Scheduled: ${task.reminder_time})`);

                        // Mark as sent immediately in the state
                        updateTask(task.id, { reminder_sent: true });

                        if (notificationsEnabledRef.current) {
                            showNotification(`Reminder: ${task.title}`, {
                                body: task.description || (task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : "Task is due!"),
                                tag: task.id,
                                requireInteraction: true,
                                isAlarm: task.isAlarm && alarmEnabledRef.current
                            });
                        }

                        // Also send email
                        try {
                            fetch("/api/reminders/send", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    email: userEmail,
                                    taskTitle: task.title,
                                    dueTime: task.due_date,
                                    priority: task.priority,
                                }),
                            });
                        } catch (error) {
                            console.error("Failed to send email reminder", error);
                        }
                    }
                }
            });

            // 2. Check Calendar Reminders
            currentReminders.forEach(async (reminder) => {
                if (!reminder.reminder_sent && reminder.date) {
                    const reminderDateTime = reminder.time
                        ? new Date(`${reminder.date}T${reminder.time}`)
                        : new Date(`${reminder.date}T00:00:00`);

                    if (now >= reminderDateTime) {
                        console.log(`Triggering calendar reminder: ${reminder.title}`);
                        updateReminder(reminder.id, { reminder_sent: true });

                        if (notificationsEnabledRef.current) {
                            showNotification(`Upcoming: ${reminder.title}`, {
                                body: `Scheduled for ${reminder.date}${reminder.time ? ` at ${reminder.time}` : ""}`,
                                tag: reminder.id,
                                requireInteraction: true,
                                isAlarm: reminder.isAlarm && alarmEnabledRef.current
                            });
                        }
                    }
                }
            });
        }, 10000); // Check every 10 seconds for much better reliability

        return () => {
            console.log("Clearing reminder polling...");
            clearInterval(interval);
        };
    }, [isLoaded, userEmail]);

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
                notificationsEnabled,
                setNotificationsEnabled,
                alarmEnabled,
                setAlarmEnabled,
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
