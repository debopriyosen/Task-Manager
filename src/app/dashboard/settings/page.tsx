"use client";

import { useTasks } from "@/contexts/TasksContext";
import { Mail, Save, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
    const { userEmail, setUserEmail, userName, setUserName } = useTasks();
    const [emailInput, setEmailInput] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setEmailInput(userEmail);
        setNameInput(userName);
    }, [userEmail, userName]);

    const handleSave = () => {
        setUserEmail(emailInput);
        setUserName(nameInput);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1 text-sm">Configure your application preferences.</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm max-w-2xl">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <User size={20} className="text-primary-500" />
                    Profile
                </h2>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Your Name</label>
                        <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="w-full max-w-md px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                            placeholder="e.g., Jane Doe"
                        />
                    </div>
                </div>

                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 pt-6 border-t border-border">
                    <Mail size={20} className="text-primary-500" />
                    Email Reminders
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Notification Email Address</label>
                        <p className="text-xs text-muted-foreground mb-3 max-w-md">
                            Task reminders will be sent to this email address when due. Make sure your SendGrid API key is configured in the environment variables.
                        </p>
                        <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="w-full max-w-md px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-primary-600/20 active:scale-95"
                        >
                            <Save size={18} />
                            {saved ? "Saved!" : "Save Settings"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
