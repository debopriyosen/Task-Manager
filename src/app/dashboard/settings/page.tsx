"use client";

import { useTasks } from "@/contexts/TasksContext";
import { Mail, Save, User, Bell, BellOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { requestNotificationPermission, checkNotificationPermission, showNotification } from "@/lib/notification";

export default function SettingsPage() {
    const { userEmail, setUserEmail, userName, setUserName, notificationsEnabled, setNotificationsEnabled } = useTasks();
    const [emailInput, setEmailInput] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [saved, setSaved] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
    const [isStandalone, setIsStandalone] = useState(true);
    const [hasSW, setHasSW] = useState(false);
    const [swStatus, setSwStatus] = useState<"ready" | "waiting" | "none">("none");
    const [testState, setTestState] = useState<"idle" | "sending" | "sent">("idle");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setNotificationPermission(checkNotificationPermission());
            setIsStandalone(
                window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true
            );

            const checkSW = async () => {
                if ('serviceWorker' in navigator) {
                    const reg = await navigator.serviceWorker.getRegistration();
                    if (reg) {
                        setHasSW(true);
                        if (reg.waiting) setSwStatus("waiting");
                        else if (reg.active) setSwStatus("ready");
                        else setSwStatus("none");
                    } else {
                        setHasSW(false);
                        setSwStatus("none");
                    }
                }
            };

            checkSW();

            // Listen for changes
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.addEventListener('controllerchange', checkSW);
            }
        }
    }, []);

    const handleActivateSW = async () => {
        if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg?.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
            }
        }
    };

    const handleToggleNotifications = async () => {
        if (!notificationsEnabled) {
            const permission = await requestNotificationPermission();
            setNotificationPermission(permission);
            if (permission === "granted") {
                setNotificationsEnabled(true);
                showNotification("Notifications Enabled", {
                    body: "You will now receive smart reminders for your tasks.",
                    icon: "/icon-192x192.png"
                });
            }
        } else {
            setNotificationsEnabled(false);
        }
    };

    const handleTestNotification = () => {
        setTestState("sending");
        try {
            showNotification("Test Notification", {
                body: "This is a test notification from Planora. If you see this, your permissions are set up correctly!",
                icon: "/icon-192x192.png",
            });
            setTimeout(() => setTestState("sent"), 500);
            setTimeout(() => setTestState("idle"), 3000);
        } catch (e) {
            console.error(e);
            setTestState("idle");
        }
    };

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
                    <Bell size={20} className="text-primary-500" />
                    Browser Notifications
                </h2>

                {!isStandalone && (
                    <div className="mb-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 flex items-start gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-lg text-primary-600 dark:text-primary-400">
                            <Bell size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-primary-900 dark:text-primary-100">Better Notifications on Mobile</p>
                            <p className="text-xs text-primary-700 dark:text-primary-300 mt-1">
                                For reliable reminders on your phone, tap <strong>"Add to Home Screen"</strong> in your browser menu.
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border shadow-sm">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">Push Notifications</p>
                            <p className="text-xs text-muted-foreground">Receive real-time alerts for your tasks and reminders.</p>
                        </div>
                        <button
                            onClick={handleToggleNotifications}
                            disabled={notificationPermission === "denied"}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${notificationsEnabled && notificationPermission === "granted" ? "bg-primary-600" : "bg-slate-200 dark:bg-slate-700"
                                } ${notificationPermission === "denied" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled && notificationPermission === "granted" ? "translate-x-6" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleTestNotification}
                            disabled={notificationPermission !== "granted" || !notificationsEnabled || testState !== "idle"}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {testState === "sending" && <Loader2 size={12} className="animate-spin" />}
                            {testState === "sent" ? "Sent!" : "Send Test Notification"}
                        </button>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                Permission: {notificationPermission}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                App Mode: {isStandalone ? "Installed" : "Browser"} | SW: {swStatus}
                            </span>
                            {swStatus === "waiting" && (
                                <button
                                    onClick={handleActivateSW}
                                    className="mt-2 w-fit text-[10px] font-bold bg-indigo-600 text-white px-3 py-1 rounded-full animate-pulse uppercase tracking-wider shadow-sm shadow-indigo-500/20"
                                >
                                    New Version Ready - Tap to Activate
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                        <h3 className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-2">Mobile Troubleshooting</h3>
                        <ul className="text-xs text-amber-700 dark:text-amber-500 space-y-2 list-disc pl-4">
                            <li><strong>iOS Users:</strong> You MUST tap <strong>"Add to Home Screen"</strong> in Safari for notifications to work.</li>
                            <li><strong>Backgrounding:</strong> On mobile, notifications work best when the app is active or "pinned" to your home screen.</li>
                            <li><strong>Permissions:</strong> Ensure "Notifications" are enabled for this app in your phone's system settings.</li>
                        </ul>
                    </div>

                    {notificationPermission === "denied" && (
                        <p className="text-xs text-red-500 font-medium">
                            Notifications are blocked by your browser. Please enable them in your browser settings.
                        </p>
                    )}
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
