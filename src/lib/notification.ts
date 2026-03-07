/**
 * Utility for handling browser notifications
 */

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notification");
        return "denied";
    }

    if (Notification.permission === "granted") {
        return "granted";
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission;
    }

    return Notification.permission;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
    console.log("showNotification called with:", title, options);

    const isNotificationSupported = "Notification" in window;
    const isServiceWorkerSupported = "serviceWorker" in navigator;

    if (!isNotificationSupported && !isServiceWorkerSupported) {
        console.warn("Notifications not supported in this browser");
        return;
    }

    const permission = isNotificationSupported ? Notification.permission : "granted"; // Fallback for SW-only

    if (permission === "granted" || (isNotificationSupported && Notification.permission === "granted")) {
        const showLocal = () => {
            if (isNotificationSupported) {
                console.log("Showing local legacy notification");
                try {
                    new Notification(title, {
                        icon: "/icon-192x192.png",
                        ...options,
                    });
                } catch (e) {
                    console.error("Local notification failed:", e);
                }
            }
        };

        try {
            // Check if service worker is available to show notification (better for PWA)
            if (isServiceWorkerSupported && navigator.serviceWorker.controller) {
                console.log("Attempting service worker notification");
                navigator.serviceWorker.ready.then((registration) => {
                    console.log("Service worker ready, showing notification");
                    registration.showNotification(title, {
                        icon: "/icon-192x192.png",
                        badge: "/icon-192x192.png",
                        vibrate: [200, 100, 200],
                        ...options,
                    } as any).catch((err) => {
                        console.error("SW showNotification failed:", err);
                        showLocal();
                    });
                }).catch((err) => {
                    console.error("SW ready failed:", err);
                    showLocal();
                });
            } else {
                console.log("No service worker controller, using local fallback");
                showLocal();
            }
        } catch (error) {
            console.error("Error in showNotification try/catch:", error);
            showLocal();
        }
    } else {
        console.warn("Notification permission not granted:", permission);
    }
};

export const checkNotificationPermission = (): NotificationPermission => {
    if (!("Notification" in window)) return "denied";
    return Notification.permission;
};
