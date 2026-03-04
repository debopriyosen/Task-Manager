"use client";

import { useTasks, Task } from "@/contexts/TasksContext";
import { format } from "date-fns";
import { CheckCircle2, Clock, Plus, ArrowLeft, Folder, Activity, Download } from "lucide-react";
import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";

import { use } from "react";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { tasks, projects, toggleTaskStatus, deleteProject } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const router = useRouter();

    const project = useMemo(() => projects.find((p) => p.id === id), [projects, id]);

    if (!project) {
        // Just return a fallback or 404
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                <Folder size={48} className="text-muted-foreground mb-4 opacity-50" />
                <h1 className="text-2xl font-bold mb-2">Project not found</h1>
                <p className="text-muted-foreground mb-6">This subject might have been deleted or doesn't exist.</p>
                <Link href="/dashboard/projects" className="text-primary-600 hover:underline">
                    &larr; Back to Projects
                </Link>
            </div>
        );
    }

    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    const pendingTasks = projectTasks.filter((t) => t.status === "pending" || t.status === "on_track").sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
    const completedTasks = projectTasks.filter((t) => t.status === "completed").sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const completedCount = completedTasks.length;
    const progress = projectTasks.length > 0 ? (completedCount / projectTasks.length) * 100 : 0;

    const handleDeleteProject = () => {
        if (window.confirm("Are you sure you want to delete this subject? All associated tasks will be detached.")) {
            deleteProject(project.id);
            router.push("/dashboard/projects");
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // --- Branding ---
        // Header background banner
        doc.setFillColor(79, 70, 229); // Indigo 600
        doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');

        // Logo / App Name
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Planora", 14, 16);

        // Document type & date (right aligned)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const dateStr = format(new Date(), "MMM d, yyyy");
        const rightX = doc.internal.pageSize.width - 14;
        doc.text(`Project Report • ${dateStr}`, rightX, 16, { align: "right" });

        // --- Project Details ---
        doc.setTextColor(15, 23, 42); // slate-900
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text(project.name, 14, 45);

        let currentY = 45;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139); // slate-500
        if (project.description) {
            currentY += 8;
            doc.text(project.description, 14, currentY);
        }

        // --- Stats ---
        currentY += 15;
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.text(`Progress: ${Math.round(progress)}%`, 14, currentY);
        doc.text(`Completed: ${completedCount}`, 70, currentY);
        doc.text(`Remaining: ${pendingTasks.length}`, 120, currentY);

        // --- Tasks Table ---
        const tableData = projectTasks.map(t => [
            t.title,
            t.status === "completed" ? "Completed" : t.status === "on_track" ? "On Track" : "Pending",
            t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
            t.due_date ? format(new Date(t.due_date), "MMM d, yyyy h:mm a") : "-"
        ]);

        autoTable(doc, {
            startY: currentY + 10,
            head: [['Task', 'Status', 'Priority', 'Due Date']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [79, 70, 229], // indigo-600
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252] // slate-50
            },
            styles: {
                font: 'helvetica',
                textColor: [51, 65, 85] // slate-700
            }
        });

        // --- Task Notes ---
        const notesData = projectTasks
            .filter(t => t.description && t.description.trim() !== "")
            .map(t => [t.title, t.description!]);

        if (notesData.length > 0) {
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 15,
                head: [['Task', 'Notes']],
                body: notesData,
                theme: 'grid',
                headStyles: {
                    fillColor: [241, 245, 249], // slate-100
                    textColor: [15, 23, 42], // slate-900
                    fontStyle: 'bold'
                },
                styles: {
                    font: 'helvetica',
                    textColor: [51, 65, 85], // slate-700
                    valign: 'top'
                },
                columnStyles: {
                    0: { cellWidth: 50, fontStyle: 'bold' },
                    1: { cellWidth: 'auto' }
                }
            });
        }
        const pageCount = (doc.internal as any).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(148, 163, 184); // slate-400
            doc.text(
                "Generated by Planora | © 2026",
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: "center" }
            );
        }

        doc.save(`${project.name.replace(/\s+/g, '_')}_Summary.pdf`);
    };

    const renderTask = (task: Task) => {
        const isCompleted = task.status === "completed";
        const isOnTrack = task.status === "on_track";
        const completedSubtasks = task.subtasks.filter(st => st.is_completed).length;
        const taskProgress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;

        return (
            <div
                key={task.id}
                className="group flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all cursor-pointer"
                onClick={() => setTaskToEdit(task)}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task.id);
                    }}
                    className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-success border-success text-white' :
                        isOnTrack ? 'bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' :
                            'border-border text-transparent hover:border-success hover:text-success'
                        }`}
                >
                    {isOnTrack ? <Activity size={14} /> : <CheckCircle2 size={16} />}
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className={`font-semibold break-words ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h3>
                            {isOnTrack && <span className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">On Track</span>}
                        </div>
                        <span className={`flex-shrink-0 w-fit text-xs font-medium px-2.5 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                            task.priority === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                    </div>

                    {task.description && (
                        <p className={`text-sm mt-1 truncate ${isCompleted ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                            {task.description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                        {task.due_date && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted hover:bg-muted/80 px-2 py-1 rounded-md transition-colors">
                                <Clock size={12} />
                                {format(new Date(task.due_date), "MMM d, h:mm a")}
                            </div>
                        )}
                        {task.reminder_time && !isCompleted && (
                            <div className="text-xs text-muted-foreground/80 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                                Reminder set
                            </div>
                        )}
                    </div>

                    {task.subtasks.length > 0 && !isCompleted && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
                                <span>Progress</span>
                                <span>{Math.round(taskProgress)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${taskProgress}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
                <div className="border-b border-border pb-6">
                    <Link href="/dashboard/projects" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
                        <ArrowLeft size={16} />
                        All Subjects
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm ${project.color || 'bg-primary-500'}`}>
                                <Folder size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                                {project.description && (
                                    <p className="text-muted-foreground mt-1.5 max-w-xl">{project.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:gap-3">
                                <button
                                    onClick={generatePDF}
                                    className="flex items-center justify-center gap-2 bg-card border border-border hover:bg-muted/50 text-foreground px-2 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
                                >
                                    <Download size={18} />
                                    <span className="hidden sm:inline">Export</span> <span className="sm:hidden">PDF</span>
                                </button>
                                <button
                                    onClick={handleDeleteProject}
                                    className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 px-2 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-primary-600/20 active:scale-95"
                            >
                                <Plus size={18} />
                                Add Task
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex justify-between text-sm font-medium mb-2">
                                <span>Course Progress</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: project.color ? 'var(--tw-gradient-from)' : undefined }} />
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground hidden sm:flex">
                            <div className="text-center">
                                <p className="text-xl font-bold text-foreground">{completedCount}</p>
                                <p>Completed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-foreground">{pendingTasks.length}</p>
                                <p>Remaining</p>
                            </div>
                        </div>
                    </div>
                </div>

                {projectTasks.length === 0 ? (
                    <div className="text-center py-20 px-4 bg-card border border-border border-dashed rounded-3xl">
                        <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No tasks in this subject</h2>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Break down your coursework into actionable tasks and assignments.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm hover:underline"
                        >
                            + Add your first task
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {pendingTasks.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-1">To Do</h2>
                                <div className="grid grid-cols-1 gap-3">
                                    {pendingTasks.map(renderTask)}
                                </div>
                            </div>
                        )}

                        {completedTasks.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-semibold text-success uppercase tracking-wider pl-1">Completed History</h2>
                                <div className="grid grid-cols-1 gap-3 opacity-75">
                                    {completedTasks.map(renderTask)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CreateTaskModal
                isOpen={isModalOpen || !!taskToEdit}
                onClose={() => {
                    setIsModalOpen(false);
                    setTaskToEdit(null);
                }}
                taskToEdit={taskToEdit}
                initialProjectId={project.id}
            />
        </>
    );
}
