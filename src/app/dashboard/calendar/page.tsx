"use client";

import { useState } from "react";
import { useTasks, Task, Reminder } from "@/contexts/TasksContext";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from "date-fns";
import { CreateReminderModal } from "@/components/calendar/create-reminder-modal";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";

export default function CalendarPage() {
    const { tasks, reminders, updateTask, updateReminder } = useTasks();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal states
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [selectedDateForReminder, setSelectedDateForReminder] = useState<string | undefined>(undefined);
    const [reminderToEdit, setReminderToEdit] = useState<Reminder | null>(null);

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    // Calendar Grid Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, id: string, type: 'task' | 'reminder') => {
        e.dataTransfer.setData("itemId", id);
        e.dataTransfer.setData("itemType", type);
        // Add a slight transparency to the dragged item
        if (e.target instanceof HTMLElement) {
            e.target.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        if (e.target instanceof HTMLElement) {
            e.target.style.opacity = '1';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetDate: Date) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData("itemId");
        const itemType = e.dataTransfer.getData("itemType");

        if (!itemId || !itemType) return;

        const dateString = format(targetDate, "yyyy-MM-dd");

        if (itemType === 'task') {
            // Update task due_date. We keep the time if it existed, just change the day.
            const task = tasks.find(t => t.id === itemId);
            if (task) {
                let newDateStr = dateString;
                if (task.due_date) {
                    const originalDate = new Date(task.due_date);
                    // Retain hours/minutes
                    targetDate.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);
                    newDateStr = targetDate.toISOString();
                } else {
                    // Start of day ISO if no previous time
                    newDateStr = new Date(`${dateString}T00:00:00`).toISOString();
                }
                updateTask(itemId, { due_date: newDateStr });
            }
        } else if (itemType === 'reminder') {
            updateReminder(itemId, { date: dateString });
        }
    };

    // Click Handlers
    const handleDayClick = (day: Date) => {
        setSelectedDateForReminder(format(day, "yyyy-MM-dd"));
        setReminderToEdit(null);
        setIsReminderModalOpen(true);
    };

    const handleReminderClick = (e: React.MouseEvent, reminder: Reminder) => {
        e.stopPropagation();
        setReminderToEdit(reminder);
        setIsReminderModalOpen(true);
    };

    const handleTaskClick = (e: React.MouseEvent, task: Task) => {
        e.stopPropagation();
        setTaskToEdit(task);
        setIsTaskModalOpen(true);
    };

    // Filter items for a specific day
    const getItemsForDay = (day: Date) => {
        const dayTasks = tasks.filter(t => {
            if (!t.due_date || t.status === "completed") return false;
            return isSameDay(new Date(t.due_date), day);
        });

        const dayReminders = reminders.filter(r => {
            return r.date === format(day, "yyyy-MM-dd");
        });

        return { dayTasks, dayReminders };
    };

    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <CalendarIcon className="text-indigo-600" />
                        Calendar & Reminders
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Organize your schedule and drag to reschedule</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white rounded-xl shadow-sm border border-slate-200/60 p-1">
                        <button
                            onClick={prevMonth}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={goToToday}
                            className="px-4 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                            {format(currentDate, "MMMM yyyy")}
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedDateForReminder(format(new Date(), "yyyy-MM-dd"));
                            setReminderToEdit(null);
                            setIsReminderModalOpen(true);
                        }}
                        className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Reminder</span>
                    </button>
                </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col min-h-[600px]">
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-3 text-center text-xs font-semibold tracking-wider text-slate-500 uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-auto">
                    {days.map((day, idx) => {
                        const { dayTasks, dayReminders } = getItemsForDay(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isTodayDate = isToday(day);

                        return (
                            <div
                                key={day.toString()}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, day)}
                                onClick={() => handleDayClick(day)}
                                className={`
                                    min-h-[120px] p-2 border-b border-r border-slate-100 relative group cursor-pointer transition-colors
                                    ${!isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white text-slate-800'}
                                    ${idx % 7 === 6 ? 'border-r-0' : ''}
                                    hover:bg-slate-50
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`
                                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                        ${isTodayDate ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' : ''}
                                    `}>
                                        {format(day, dateFormat)}
                                    </span>
                                </div>

                                {/* Items Container */}
                                <div className="space-y-1.5 overflow-y-auto max-h-[100px] no-scrollbar pb-1">

                                    {/* Reminders */}
                                    {dayReminders.map(reminder => (
                                        <div
                                            key={`rem-${reminder.id}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, reminder.id, 'reminder')}
                                            onDragEnd={handleDragEnd}
                                            onClick={(e) => handleReminderClick(e, reminder)}
                                            className={`${reminder.color} bg-opacity-10 border border-current border-opacity-20 text-slate-700 px-2 py-1.5 rounded-lg text-xs font-medium truncate cursor-grab active:cursor-grabbing hover:brightness-95 transition-all shadow-sm flex items-center gap-1.5`}
                                            title={reminder.title}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${reminder.color}`} />
                                            <span className="truncate flex-1">{reminder.title}</span>
                                            {reminder.time && <span className="text-[10px] opacity-70 ml-1 flex-shrink-0">{reminder.time}</span>}
                                        </div>
                                    ))}

                                    {/* Tasks */}
                                    {dayTasks.map(task => (
                                        <div
                                            key={`task-${task.id}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.id, 'task')}
                                            onDragEnd={handleDragEnd}
                                            onClick={(e) => handleTaskClick(e, task)}
                                            className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1.5 rounded-lg text-xs font-medium truncate cursor-grab active:cursor-grabbing hover:bg-slate-200 transition-colors shadow-sm flex items-center gap-1.5"
                                            title={task.title}
                                        >
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500' :
                                                    task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                                }`} />
                                            <span className="truncate flex-1">{task.title}</span>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <CreateReminderModal
                isOpen={isReminderModalOpen}
                onClose={() => setIsReminderModalOpen(false)}
                initialDate={selectedDateForReminder}
                reminderToEdit={reminderToEdit}
            />

            <CreateTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                taskToEdit={taskToEdit}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    );
}
