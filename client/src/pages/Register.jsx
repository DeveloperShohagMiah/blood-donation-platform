import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { t } from "../utils/tr";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    ShieldCheck,
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { apiFetch, toInternationalPhone } from "../utils/api";

const initialForm = {
    fullName: "",
    phone: "",
    email: "",
    password: "",
    agreeTerms: false,
};

/* Bangladesh mobile: 01XXXXXXXXX, +8801XXXXXXXXX or 8801XXXXXXXXX */
const phoneOk = (v) => /^(?:\+?88)?01[3-9]\d{8}$/.test(v.replace(/[\s-]/g, ""));

const inputClass = (error, extra = "") =>
    [
        "h-12 w-full rounded-xl border bg-surface-soft px-4 text-[15px] font-medium text-foreground outline-none transition",
        "placeholder:font-normal placeholder:text-muted-foreground focus:bg-card focus:ring-4",
        error
            ? "border-destructive focus:border-destructive focus:ring-primary/10"
            : "border-border focus:border-primary focus:ring-primary/10",
        extra,
    ].join(" ");

const Field = ({ id, label, required, hint, error, children, className = "" }) => (
    <div className={className}>
        <label htmlFor={id} className="mb-2 block text-sm font-bold text-foreground">
            {label}
            {required ? (
                <span className="text-primary" aria-hidden="true"> *</span>
            ) : (
                <span className="ml-1.5 text-xs font-medium text-muted-foreground">{t("text.(optional)")}</span>
            )}
        </label>
        {children}
        {error ? (
            <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-destructive">
                <AlertCircle size={14} /> {error}
            </p>
        ) : (
            hint && <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-muted-foreground">{hint}</p>
        )}
    </div>
);

const describedBy = (id, error, hint) =>
    error ? `${id}-error` : hint ? `${id}-hint` : undefined;

const BecomeDonor = () => {
    const { t } = useTranslation();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    /* Account creation -> phone verification -> pending admin approval. */
    const [step, setStep] = useState("form"); // "form" | "verify" | "pending"
    const [identifier, setIdentifier] = useState("");
    const [devCode, setDevCode] = useState("");
    const [code, setCode] = useState("");
    const [verifyError, setVerifyError] = useState("");
    const [verifying, setVerifying] = useState(false);

    const update = (key, value) => {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
    };

    const onText = (key) => (event) => update(key, event.target.value);

    const validate = () => {
        const e = {};
        if (form.fullName.trim().length < 3)
            e.fullName = t("register.err.name", "Enter your full name.");
        if (!phoneOk(form.phone))
            e.phone = t("register.err.phone", "Enter a valid mobile number, e.g. 01712345678.");
        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
            e.email = t("register.err.email", "Enter a valid email address.");
        if (form.password.length < 8)
            e.password = t("register.err.password", "Use at least 8 characters.");
        if (!form.agreeTerms)
            e.agreeTerms = t("register.err.terms", "Please confirm to continue.");
        return e;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const found = validate();
        setErrors(found);

        const firstKey = Object.keys(found)[0];
        if (firstKey) {
            document.getElementById(firstKey)?.focus();
            return;
        }

        setSubmitting(true);
        try {
            const phone = toInternationalPhone(form.phone);

            await apiFetch("/auth/register", {
                method: "POST",
                body: {
                    fullName: form.fullName.trim(),
                    phone,
                    email: form.email.trim() || undefined,
                    password: form.password,
                },
            });

            setIdentifier(phone);

            const verification = await apiFetch("/auth/verification/request", {
                method: "POST",
                body: { identifier: phone, channel: "phone" },
            });

            setDevCode(verification?.developmentCode || "");
            setStep("verify");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            setErrors({
                form: error.message || t("register.err.submit", "Something went wrong. Please try again."),
            });
        } finally {
            setSubmitting(false);
        }
    };

    const confirmVerification = async (event) => {
        event.preventDefault();
        if (code.trim().length !== 6) return;

        setVerifying(true);
        setVerifyError("");
        try {
            await apiFetch("/auth/verification/confirm", {
                method: "POST",
                body: { identifier, channel: "phone", code: code.trim() },
            });
            setStep("pending");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            setVerifyError(error.message || "Invalid or expired verification code.");
        } finally {
            setVerifying(false);
        }
    };

    /* ---------- Verification / success states ---------- */
    if (step !== "form") {
        const pending = step === "pending";

        return (
            <div className="grid min-h-[70vh] place-items-center bg-surface-alt px-4 py-10">
                <div className="w-full max-w-[520px] rounded-3xl bg-card p-8 text-center shadow-lg sm:p-12">
                    <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success">
                        {pending ? <CheckCircle2 size={34} /> : <ShieldCheck size={34} />}
                    </span>

                    <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
                        {pending ? "Registration complete" : "Verify your phone"}
                    </h1>

                    {pending ? (
                        <>
                            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                                Thanks, {form.fullName.split(" ")[0]}. Your number{" "}
                                <strong className="text-foreground">{identifier}</strong> has been
                                verified.
                            </p>
                            <p className="mt-5 rounded-xl bg-warning/10 p-4 text-sm leading-relaxed text-warning ring-1 ring-warning/15">
                                Your account is waiting for admin approval. Once it is active,
                                log in and complete your donor profile from the dashboard so
                                people nearby can find you.
                            </p>
                            <div className="mt-8 flex justify-center">
                                <Link to="/" className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary">
                                    {t("register.goHome", "Back to home")}
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                                We sent a 6-digit code to{" "}
                                <strong className="text-foreground">{identifier}</strong>. Enter it
                                below to verify your number.
                            </p>

                            {devCode && (
                                <p className="mt-4 rounded-xl bg-info/10 p-3 text-sm text-info ring-1 ring-info/15">
                                    Development code:{" "}
                                    <strong className="tracking-widest">{devCode}</strong>
                                </p>
                            )}

                            <form onSubmit={confirmVerification} className="mt-6 space-y-3">
                                <input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    placeholder="000000"
                                    aria-label="Verification code"
                                    className={inputClass(!!verifyError, "text-center text-xl tracking-[0.5em]")}
                                />
                                {verifyError && (
                                    <p role="alert" className="text-[13px] font-medium text-destructive">
                                        {verifyError}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={verifying || code.trim().length !== 6}
                                    className="btn-premium h-12 w-full text-[15px] font-extrabold"
                                >
                                    {verifying ? (
                                        <><Loader2 size={18} className="animate-spin" /> Verifying…</>
                                    ) : (
                                        "Verify phone"
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        );
    }

    /* ---------- Account form ---------- */
    return (
        <div>
            <div className="bg-linear-to-br from-primary/10 via-card/80 to-primary/10 pt-14 pb-30 sm:pt-28">
                <div className="mx-auto w-[calc(100%-2rem)] max-w-[1280px] md:w-[calc(100%-4rem)]">
                    <SectionHeader
                        tone="dark"
                        title={t("register.title", "Create your account")}
                        subtitle={t(
                            "register.subtitle",
                            "Join Blood Connect in under a minute. After your number is verified and an admin approves your account, you can set up your donor profile from your dashboard."
                        )}
                    />
                </div>
            </div>

            <div className="mx-auto -mt-16 grid w-[calc(100%-2rem)] max-w-[1280px] items-start gap-8 md:w-[calc(100%-4rem)] lg:grid-cols-[1fr_340px]">
                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="rounded-[28px] bg-card p-6 shadow-lg sm:p-9"
                >
                    <h2 className="mb-6 text-lg font-extrabold text-foreground">
                        Your details
                    </h2>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field id="fullName" label={t("register.fullName", "Full name")} required error={errors.fullName} className="sm:col-span-2">
                            <input
                                id="fullName"
                                type="text"
                                autoComplete="name"
                                value={form.fullName}
                                onChange={onText("fullName")}
                                aria-invalid={!!errors.fullName}
                                aria-describedby={describedBy("fullName", errors.fullName)}
                                placeholder="e.g. Rafi Ahmed"
                                className={inputClass(errors.fullName)}
                            />
                        </Field>

                        <Field
                            id="phone"
                            label={t("register.phone", "Mobile number")}
                            required
                            error={errors.phone}
                            hint={t("register.phoneHint", "We'll send a verification code to this number.")}
                        >
                            <input
                                id="phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                value={form.phone}
                                onChange={onText("phone")}
                                aria-invalid={!!errors.phone}
                                aria-describedby={describedBy("phone", errors.phone, true)}
                                placeholder="01XXXXXXXXX"
                                className={inputClass(errors.phone)}
                            />
                        </Field>

                        <Field id="email" label={t("register.email", "Email")} error={errors.email}>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={form.email}
                                onChange={onText("email")}
                                aria-invalid={!!errors.email}
                                aria-describedby={describedBy("email", errors.email)}
                                placeholder="you@example.com"
                                className={inputClass(errors.email)}
                            />
                        </Field>

                        <Field
                            id="password"
                            label={t("register.password", "Password")}
                            required
                            error={errors.password}
                            hint={t("register.passwordHint", "At least 8 characters.")}
                            className="sm:col-span-2"
                        >
                            <span className="relative block">
                                <Lock size={17} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={onText("password")}
                                    aria-invalid={!!errors.password}
                                    aria-describedby={describedBy("password", errors.password, true)}
                                    className={inputClass(errors.password, "pr-12 pl-11")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    aria-label={showPassword ? t("register.hide", "Hide password") : t("register.show", "Show password")}
                                    className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-border"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </span>
                        </Field>
                    </div>

                    <div className="mt-6">
                        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground">
                            <input
                                id="agreeTerms"
                                type="checkbox"
                                checked={form.agreeTerms}
                                onChange={(e) => update("agreeTerms", e.target.checked)}
                                aria-invalid={!!errors.agreeTerms}
                                className="mt-0.5 size-[18px] shrink-0 accent-primary"
                            />
                            {t(
                                "register.agreeTerms",
                                "I confirm these details are correct and agree to be contacted about my account. Blood donation is always voluntary and free."
                            )}
                        </label>
                        {errors.agreeTerms && (
                            <p role="alert" className="mt-1 ml-[30px] flex items-center gap-1.5 text-[13px] font-medium text-destructive">
                                <AlertCircle size={14} /> {errors.agreeTerms}
                            </p>
                        )}
                    </div>

                    {errors.form && (
                        <p role="alert" className="mt-6 rounded-xl bg-primary/5 p-3.5 text-sm font-medium text-destructive">
                            {errors.form}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-premium mt-8 h-14 w-full text-[15px] font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                    >
                        {submitting ? (
                            <><Loader2 size={20} className="animate-spin" /> {t("register.submitting", "Creating account…")}</>
                        ) : (
                            <>{t("register.submit", "Create account")} <ArrowRight size={18} strokeWidth={2.5} /></>
                        )}
                    </button>

                    <p className="mt-5 text-center text-sm text-muted-foreground">
                        {t("register.haveAccount", "Already registered?")}{" "}
                        <Link to="/login" className="font-bold text-primary hover:underline">
                            {t("navigation.login", "Log in")}
                        </Link>
                    </p>
                </form>

                <aside className="space-y-5 lg:sticky lg:top-24">
                    <div className="rounded-3xl bg-foreground p-7 text-primary-foreground">
                        <h2 className="text-lg font-extrabold">What happens next?</h2>
                        <ol className="mt-5 space-y-4">
                            {[
                                "Verify your phone with the code we send.",
                                "An admin reviews and approves your account.",
                                "Log in and complete your donor profile (blood group, area and availability).",
                            ].map((line, index) => (
                                <li key={line} className="flex gap-3 text-[15px] text-background/70">
                                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-card/10 text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    {line}
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="rounded-3xl border border-border bg-card p-6">
                        <p className="flex items-center gap-2 font-bold text-foreground">
                            <ShieldCheck size={19} className="text-success" />
                            {t("register.privacyTitle", "Your privacy")}
                        </p>
                        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                            {t(
                                "register.privacyText",
                                "We only ask for what's needed to create your account. Your donor details are added later, and you control whether they are listed publicly."
                            )}
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default BecomeDonor;
