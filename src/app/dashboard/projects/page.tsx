"use client";

import { useState } from "react";
import { Folder, Plus } from "lucide-react";
import { useTasks, Project } from "@/contexts/TasksContext";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import Link from "next/link";

export default function ProjectsDashboardPage() {
    const { projects, tasks } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const renderProject = (project: Project) => {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        const completedTasks = projectTasks.filter(t => t.status === "completed").length;
        const totalTasks = projectTasks.length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return (
            <Link
                href={`/dashboard/projects/${project.id}`}
                key={project.id}
                className="group block bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-primary-500/30"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${project.color || 'bg-primary-500'}`}>
                            <Folder size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary-600 transition-colors">{project.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{totalTasks} total tasks</p>
                        </div>
                    </div>
                </div>

                {project.description && (
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-[40px]">
                        {project.description}
                    </p>
                )}

                <div className="space-y-1.5 mt-auto">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Projects & Subjects</h1>
                        <p className="text-muted-foreground mt-1.5 font-medium">Manage your MBA subjects and high-level goals.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-primary-600/20 active:scale-95"
                    >
                        <Plus size={18} />
                        New Project
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-20 px-4 bg-card border border-border border-dashed rounded-3xl">
                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Folder size={32} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Create subjects like "Marketing" or "Statistics" to organize your coursework.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm hover:underline"
                        >
                            + Create your first project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(renderProject)}
                    </div>
                )}
            </div>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
