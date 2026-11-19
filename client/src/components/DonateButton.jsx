import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { apiFetch } from "../utils/api";

/**
 * One-click "I can donate" action for a public blood request.
 * Records a DonorResponse for that exact request. Guests are sent to login
 * and returned here with the response automatically completed.
 */
const DonateButton = ({
    requestId,
    hasResponded = false,
    className = "",
    compact = false,
}) => {
    const { t } = useTranslation();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [localDone, setLocalDone] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const done = localDone || Boolean(hasResponded);

    const returnTo = `/dashboard/matching?request=${requestId}&respond=1`;

    const respond = async () => {
        if (!requestId || busy || done || authLoading) return;
        setError("");

        if (!isAuthenticated) {
            navigate("/login", { state: { from: returnTo } });
            return;
        }
        if (user?.role !== "user") {
            setError("A donor profile is required to respond to requests.");
            return;
        }

        setBusy(true);
        try {
            await apiFetch(`/blood-requests/${requestId}/responses`, {
                method: "POST",
                body: { response: "interested" },
            });
            setLocalDone(true);
        } catch (err) {
            if (err.status === 401) {
                navigate("/login", { state: { from: returnTo } });
            } else {
                setError(err.message);
            }
        } finally {
            setBusy(false);
        }
    };

    const label = busy
        ? t("text.Sending_DOT__DOT__DOT_", "Sending...")
        : done
            ? t("text.Responded", "Responded")
            : t("text.I can donate", "I can donate");

    return (
        <div className="flex min-w-0 flex-1 flex-col">
            <button
                type="button"
                onClick={respond}
                disabled={busy || done}
                className={[
                    "inline-flex w-full items-center justify-center gap-1.5 font-bold disabled:cursor-default",
                    compact ? "h-10 px-4 text-xs" : "h-11 px-4 text-sm",
                    done
                        ? "rounded-xl bg-success/15 text-success-deep ring-1 ring-success/30"
                        : "btn-premium",
                    className,
                ].join(" ")}
            >
                {done ? (
                    <CheckCircle2 size={compact ? 14 : 16} />
                ) : busy ? (
                    <Loader2 size={compact ? 14 : 16} className="animate-spin" />
                ) : (
                    <Send size={compact ? 14 : 16} />
                )}
                {label}
            </button>
            {error && (
                <p role="alert" className="mt-1.5 text-[11px] leading-4 text-destructive">
                    {error}{" "}
                    {/profile|available/i.test(error) && (
                        <Link to="/dashboard/profile" className="font-bold underline">
                            {t("text.Update profile", "Update profile")}
                        </Link>
                    )}
                </p>
            )}
        </div>
    );
};

export default DonateButton;
