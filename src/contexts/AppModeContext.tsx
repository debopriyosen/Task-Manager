"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AppMode = "tasks" | "expenses";

interface AppModeContextType {
    mode: AppMode;
    setMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export function AppModeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<AppMode>("tasks");

    useEffect(() => {
        const saved = localStorage.getItem("planora_app_mode");
        if (saved === "tasks" || saved === "expenses") {
            setMode(saved);
        }
    }, []);

    const handleSetMode = (newMode: AppMode) => {
        setMode(newMode);
        localStorage.setItem("planora_app_mode", newMode);
    };

    return (
        <AppModeContext.Provider value={{ mode, setMode: handleSetMode }}>
            {children}
        </AppModeContext.Provider>
    );
}

export function useAppMode() {
    const context = useContext(AppModeContext);
    if (context === undefined) {
        throw new Error("useAppMode must be used within an AppModeProvider");
    }
    return context;
}
