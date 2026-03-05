"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
                <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto w-full p-4 md:p-8">
                    <div className="mx-auto max-w-5xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
