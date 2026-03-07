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

export const playAlarmSound = () => {
    if (typeof window === 'undefined') return;

    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);

        // Secondary boop for more "alarm" feel
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1100, audioContext.currentTime);
            gain2.gain.setValueAtTime(0, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.start();
            osc2.stop(audioContext.currentTime + 1);
        }, 300);

    } catch (e) {
        console.error("Failed to play alarm sound:", e);
    }
};

export const showNotification = (title: string, options?: NotificationOptions & { isAlarm?: boolean }) => {
    console.log("showNotification called with:", title, options);

    if (options?.isAlarm) {
        playAlarmSound();
    }

    const isNotificationSupported = typeof window !== 'undefined' && "Notification" in window;
    const isServiceWorkerSupported = typeof window !== 'undefined' && "serviceWorker" in navigator;

    if (!isNotificationSupported && !isServiceWorkerSupported) {
        console.warn("Notifications not supported in this browser");
        return;
    }

    // On iOS Safari, window.Notification exists but new Notification() is not supported.
    // It ONLY works via ServiceWorkerRegistration.showNotification()
    const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

    const showLocal = () => {
        if (isNotificationSupported && !isIOS) {
            console.log("Showing local legacy notification");
            try {
                new Notification(title, {
                    icon: "/icon-192x192.png",
                    ...options,
                });
            } catch (e) {
                console.error("Local notification failed:", e);
            }
        } else {
            console.log("Local legacy notification not supported or is iOS, skipping local fallback");
        }
    };

    const attemptSWNotification = async () => {
        if (isServiceWorkerSupported) {
            console.log("Attempting service worker notification via .ready");
            try {
                const registration = await navigator.serviceWorker.ready;
                if (registration && registration.showNotification) {
                    console.log("Showing notification via Service Worker");
                    await registration.showNotification(title, {
                        icon: "/icon-192x192.png",
                        badge: "/icon-192x192.png",
                        vibrate: [200, 100, 200],
                        ...options,
                    } as any);
                    console.log("registration.showNotification executed");
                    return;
                }
                // Fallback if service worker registration or showNotification is not available
                console.log("Service worker not ready or showNotification not available. Falling back to local Notification constructor.");
                showLocal();
            } catch (err) {
                console.error("SW notification failed:", err);
                showLocal();
            }
        } else {
            console.log("Service workers not supported, falling back to local");
            showLocal();
        }
    };

    const permission = isNotificationSupported ? Notification.permission : "granted";

    if (permission === "granted") {
        attemptSWNotification();
    } else {
        console.warn("Notification permission not granted:", permission);
    }
};

export const checkNotificationPermission = (): NotificationPermission => {
    if (!("Notification" in window)) return "denied";
    return Notification.permission;
};
