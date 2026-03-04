"use client";

import { useTasks } from "@/contexts/TasksContext";
import { Mail, Save, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
    const { userEmail, setUserEmail, userName, setUserName, geminiApiKey, setGeminiApiKey } = useTasks();
    const [emailInput, setEmailInput] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [apiKeyInput, setApiKeyInput] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setEmailInput(userEmail);
        setNameInput(userName);
        setApiKeyInput(geminiApiKey);
    }, [userEmail, userName, geminiApiKey]);

    const handleSave = () => {
        setUserEmail(emailInput);
        setUserName(nameInput);
        setGeminiApiKey(apiKeyInput.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleRemoveKey = () => {
        setApiKeyInput("");
        setGeminiApiKey("");
        localStorage.removeItem("taskflow_gemini_key");
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-500">
                        <path d="M16 2.00003L16.9011 5.60447L20.5056 6.50558L16.9011 7.40669L16 11.0111L15.0989 7.40669L11.4944 6.50558L15.0989 5.60447L16 2.00003ZM6.50558 5.49447L7.69666 10.2584L12.4606 11.4495L7.69666 12.6405L6.50558 17.4045L5.3145 12.6405L0.550537 11.4495L5.3145 10.2584L6.50558 5.49447ZM17.4944 14.4945L18.236 17.4606L21.2022 18.2022L18.236 18.9438L17.4944 21.9101L16.7528 18.9438L13.7865 18.2022L16.7528 17.4606L17.4944 14.4945Z" fill="currentColor" />
                    </svg>
                    AI Integrations
                </h2>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 flex items-center justify-between max-w-md">
                            <span>Google Gemini API Key</span>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">BYOK</span>
                        </label>
                        <p className="text-xs text-muted-foreground mb-3 max-w-md">
                            Provide your own Google Gemini API key to enable AI task breakdown abilities. Keys are stored locally inside your browser and are never sent to our servers.
                        </p>
                        <div className="flex items-center gap-3">
                            <input
                                type="password"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                className="w-full max-w-md px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder:text-muted-foreground/50"
                                placeholder="AIzaSy..."
                            />
                            {geminiApiKey && (
                                <button
                                    onClick={handleRemoveKey}
                                    className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors whitespace-nowrap"
                                >
                                    Remove Key
                                </button>
                            )}
                        </div>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="block text-xs text-primary-600 hover:underline mt-2">
                            Get a free Gemini API key &rarr;
                        </a>
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
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-primary-600/20 active:scale-95"
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
