import { t } from "../utils/tr.js";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Droplets,
    KeyRound,
    Loader2,
    Mail,
} from "lucide-react";
import { apiFetch } from "../utils/api";

const identifierOk = (value) => {
    const v = value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || /^(?:\+?88)?01[3-9]\d{8}$/.test(v.replace(/[\s-]/g, ""));
};

const inputClass = "input-premium h-12 px-4";

const ForgotPassword = () => {
    const [step, setStep] = useState("request"); // request | reset | done
    const [identifier, setIdentifier] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [devCode, setDevCode] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const requestCode = async (event) => {
        event.preventDefault();
        setError("");
        if (!identifierOk(identifier)) {
            setError("Enter a valid mobile number or email address.");
            return;
        }

        setBusy(true);
        try {
            const result = await apiFetch("/auth/password/forgot", {
                method: "POST",
                body: { identifier },
            });
            setDevCode(result?.developmentCode || "");
            setStep("reset");
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const resetPassword = async (event) => {
        event.preventDefault();
        setError("");
        if (code.trim().length !== 6) {
            setError("Enter the 6-digit reset code.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setBusy(true);
        try {
            await apiFetch("/auth/password/reset", {
                method: "POST",
                body: { identifier, code: code.trim(), newPassword: password },
            });
            setStep("done");
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className="grid min-h-[100vh] place-items-center bg-surface-alt px-4 py-12">
            <div className="w-full max-w-[440px]">
                <Link to="/" className="mb-8 inline-flex items-center gap-2.5">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        <Droplets size={21} />
                    </span>
                    <span className="text-lg font-extrabold tracking-tight text-foreground">
                        Blood <span className="text-primary">{t("text.Connect")}</span>
                    </span>
                </Link>

                <div className="rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-9">
                    {step === "done" ? (
                        <>
                            <span className="grid size-14 place-items-center rounded-2xl border border-success/30 bg-success-soft text-success">
                                <CheckCircle2 size={26} />
                            </span>
                            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
                                Password reset
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                Your password has been updated. You can now sign in with the new one.
                            </p>
                            <Link
                                to="/login"
                                className="btn-premium mt-7 h-12 w-full px-5 text-sm"
                            >
                                Go to log in <ArrowRight size={16} />
                            </Link>
                        </>
                    ) : step === "request" ? (
                        <form onSubmit={requestCode}>
                            <span className="grid size-14 place-items-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
                                <Mail size={25} />
                            </span>
                            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
                                Forgot your password?
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                Enter the phone number or email on your account and we'll send you a
                                reset code.
                            </p>

                            {error && (
                                <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
                                </p>
                            )}

                            <label htmlFor="identifier" className="mt-6 mb-2 block text-sm font-semibold text-foreground">
                                Phone number or email
                            </label>
                            <input
                                id="identifier"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="01XXXXXXXXX or you@example.com"
                                autoComplete="username"
                                className={inputClass}
                            />

                            <button
                                type="submit"
                                disabled={busy}
                                className="btn-premium mt-6 h-12 w-full px-5 text-sm"
                            >
                                {busy ? <><Loader2 size={17} className="animate-spin" /> Sending…</> : "Send reset code"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={resetPassword}>
                            <span className="grid size-14 place-items-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
                                <KeyRound size={25} />
                            </span>
                            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
                                Set a new password
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                Enter the reset code sent to{" "}
                                <strong className="text-foreground">{identifier}</strong>.
                            </p>

                            {devCode && (
                                <p className="mt-4 rounded-xl bg-info/10 px-4 py-3 text-sm text-info ring-1 ring-info/15">
                                    Development code:{" "}
                                    <strong className="tracking-widest">{devCode}</strong>
                                </p>
                            )}

                            {error && (
                                <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
                                </p>
                            )}

                            <label htmlFor="code" className="mt-6 mb-2 block text-sm font-semibold text-foreground">
                                Reset code
                            </label>
                            <input
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="000000"
                                autoComplete="one-time-code"
                                className={`${inputClass} text-center text-lg tracking-[0.4em]`}
                            />

                            <label htmlFor="new-password" className="mt-5 mb-2 block text-sm font-semibold text-foreground">
                                New password
                            </label>
                            <input
                                id="new-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                placeholder="At least 8 characters"
                                className={inputClass}
                            />

                            <label htmlFor="confirm-password" className="mt-4 mb-2 block text-sm font-semibold text-foreground">
                                Confirm password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                autoComplete="new-password"
                                className={inputClass}
                            />

                            <button
                                type="submit"
                                disabled={busy}
                                className="btn-premium mt-6 h-12 w-full px-5 text-sm"
                            >
                                {busy ? <><Loader2 size={17} className="animate-spin" /> Resetting…</> : "Reset password"}
                            </button>
                        </form>
                    )}

                    <Link
                        to="/login"
                        className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
                    >
                        <ArrowLeft size={15} /> Back to log in
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default ForgotPassword;
