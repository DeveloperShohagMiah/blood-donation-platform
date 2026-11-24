import { useEffect, useState } from "react";
import { BellOff, BellRing, Loader2 } from "lucide-react";
import { apiFetch } from "../utils/api";
import Button from "../ui/Button";

const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from(raw, (character) => character.charCodeAt(0));
};

const PushNotifications = () => {
    const supported =
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

    const [config, setConfig] = useState(null);
    const [enabled, setEnabled] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!supported) return;

        apiFetch("/notifications/push/key")
            .then(setConfig)
            .catch(() => setConfig(null));

        navigator.serviceWorker.ready
            .then((registration) => registration.pushManager.getSubscription())
            .then((subscription) => setEnabled(Boolean(subscription)))
            .catch(() => {});
    }, [supported]);

    const enable = async () => {
        setBusy(true);
        setError("");
        try {
            if (!config?.enabled || !config.publicKey)
                throw new Error("Push notifications are not configured on the server.");

            const permission = await Notification.requestPermission();
            if (permission !== "granted")
                throw new Error("Notification permission was not granted.");

            await navigator.serviceWorker.register("/sw.js");
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(config.publicKey),
            });
            const keys = subscription.toJSON()?.keys;

            await apiFetch("/notifications/push/subscribe", {
                method: "POST",
                body: {
                    endpoint: subscription.endpoint,
                    keys: { p256dh: keys?.p256dh, auth: keys?.auth },
                },
            });
            setEnabled(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const disable = async () => {
        setBusy(true);
        setError("");
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) await subscription.unsubscribe();
            await apiFetch("/notifications/push/subscribe", { method: "DELETE" });
            setEnabled(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    if (!supported) {
        return (
            <p className="mt-3 text-xs text-muted-foreground">
                Browser notifications aren't supported in this browser.
            </p>
        );
    }

    return (
        <div className="mt-6 border-t border-border pt-6">
            <h3 className="text-sm font-bold text-foreground">Browser notifications</h3>
            <p className="mt-1 text-xs text-muted-foreground">
                Get notified even when you're not on the site — for matching requests,
                donor selection, reminders and donation updates.
            </p>

            <div className="mt-4">
                <Button
                    variant={enabled ? "outline" : "primary"}
                    size="md"
                    onClick={enabled ? disable : enable}
                    disabled={busy || (enabled ? false : config === null)}
                >
                    {busy ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : enabled ? (
                        <BellOff size={16} />
                    ) : (
                        <BellRing size={16} />
                    )}
                    {busy
                        ? "Working…"
                        : enabled
                            ? "Disable notifications"
                            : config === null
                                ? "Checking support…"
                                : config.enabled
                                    ? "Enable notifications"
                                    : "Notifications unavailable"}
                </Button>
            </div>

            {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
        </div>
    );
};

export default PushNotifications;
