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
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
        const showLocal = () => {
            new Notification(title, {
                icon: "/icon-192x192.png",
                ...options,
            });
        };

        try {
            // Check if service worker is available to show notification (better for PWA)
            if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(title, {
                        icon: "/icon-192x192.png",
                        badge: "/icon-192x192.png",
                        vibrate: [200, 100, 200],
                        ...options,
                    } as any).catch(() => {
                        // Fallback if SW showNotification fails
                        showLocal();
                    });
                }).catch(() => {
                    // Fallback if SW ready fails
                    showLocal();
                });
            } else {
                showLocal();
            }
        } catch (error) {
            console.error("Error showing notification:", error);
            showLocal();
        }
    }
};

export const checkNotificationPermission = (): NotificationPermission => {
    if (!("Notification" in window)) return "denied";
    return Notification.permission;
};
