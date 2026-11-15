import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    AlertCircle,
    ArrowRight,
    CalendarCheck,
    Droplets,
    Eye,
    EyeOff,
    HeartPulse,
    Info,
    Loader2,
    Lock,
    UserRound,
    UserCog,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Config                                                             */
/* ------------------------------------------------------------------ */
const LOGIN_ENDPOINT = "/api/auth/login";
const REQUEST_TIMEOUT_MS = 15000;
const LAST_ID_KEY = "bc:lastIdentifier";

/* Flip to true to try the UI without a backend (password: password123) */
const MOCK_AUTH = false;

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/* Bangladesh mobile: 01XXXXXXXXX, +8801XXXXXXXXX or 8801XXXXXXXXX */
const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;

const readStorage = (key) => {
    try {
        return localStorage.getItem(key) || "";
    } catch {
        return "";
    }
};
const writeStorage = (key, value) => {
    try {
        value ? localStorage.setItem(key, value) : localStorage.removeItem(key);
    } catch {
        /* storage can be blocked (private mode); safe to ignore */
    }
};

/* Only allow redirects to paths inside this app (blocks open-redirects) */
const getSafeRedirect = (from) => {
    const raw =
        typeof from === "string"
            ? from
            : from?.pathname
                ? `${from.pathname}${from.search || ""}${from.hash || ""}`
                : "/";
    if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/login")) return "/";
    return raw;
};

/*
 * API call. Prefer an httpOnly, Secure, SameSite cookie set by the server
 * (credentials: "include") over storing tokens in localStorage.
 */
async function loginRequest(payload, signal) {
    if (MOCK_AUTH) {
        await new Promise((r) => setTimeout(r, 800));
        if (payload.password !== "password123") {
            const err = new Error("Invalid credentials");
            err.status = 401;
            throw err;
        }
        return { user: { id: 1, name: "Demo Donor" } };
    }

    const res = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
        signal,
    });

    let data = null;
    try {
        data = await res.json();
    } catch {
        /* non-JSON response */
    }

    if (!res.ok) {
        const err = new Error(data?.message || "Login failed");
        err.status = res.status;
        err.retryAfter = Number(res.headers.get("Retry-After")) || null;
        throw err;
    }
    return data;
}

const inputClass = (hasError, extra = "") =>
    [
        "h-12 w-full rounded-xl border bg-[#F4F7F9] text-[15px] font-medium text-[#192623] outline-none transition",
        "placeholder:font-normal placeholder:text-[#9AA6A1] focus:bg-white focus:ring-4",
        hasError
            ? "border-[#E11D48] focus:border-[#E11D48] focus:ring-[#E11D48]/10"
            : "border-[#E4EBE7] focus:border-[#C62838] focus:ring-[#C62838]/10",
        extra,
    ].join(" ");

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
const Login = ({ onSuccess }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const abortRef = useRef(null);

    const [showPassword, setShowPassword] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    const rememberedId = readStorage(LAST_ID_KEY);

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        setFocus,
        resetField,
        formState: { errors, isSubmitting },
    } = useForm({
        mode: "onTouched",
        reValidateMode: "onChange",
        defaultValues: {
            identifier: rememberedId,
            password: "",
            remember: true,
        },
    });

    useEffect(() => {
        document.title = `${t("login.title", "Log in")} | Blood Connect`;
        setFocus(rememberedId ? "password" : "identifier");
        return () => abortRef.current?.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (values) => {
        clearErrors("root.serverError");

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const identifier = values.identifier.trim();

        try {
            const data = await loginRequest(
                { identifier, password: values.password, remember: values.remember },
                controller.signal
            );

            writeStorage(LAST_ID_KEY, values.remember ? identifier : "");
            onSuccess?.(data);
            navigate(getSafeRedirect(location.state?.from), { replace: true });
        } catch (err) {
            if (controller.signal.aborted && !err.status) {
                setError("root.serverError", {
                    type: "timeout",
                    message: t("login.err.timeout", "The request took too long. Check your connection and try again."),
                });
                return;
            }

            let message;
            if (err.status === 400 || err.status === 401 || err.status === 404) {
                /* Same message for wrong id or password so accounts can't be probed */
                message = t("login.err.invalid", "Incorrect phone, email or password. Please try again.");
                resetField("password");
                setFocus("password");
            } else if (err.status === 403) {
                message = t("login.err.blocked", "This account can’t log in right now. Please contact support.");
            } else if (err.status === 429) {
                message = err.retryAfter
                    ? t("login.err.rateWait", "Too many attempts. Try again in {{seconds}} seconds.", { seconds: err.retryAfter })
                    : t("login.err.rate", "Too many attempts. Please wait a few minutes and try again.");
            } else if (err.status >= 500) {
                message = t("login.err.server", "Our server had a problem. Please try again shortly.");
            } else {
                message = t("login.err.network", "Couldn’t reach the server. Check your internet connection.");
            }

            setError("root.serverError", { type: "server", message });
        } finally {
            clearTimeout(timer);
        }
    };

    const serverError = errors.root?.serverError?.message;
    const sessionExpired = location.state?.reason === "expired";

    const features = [
        { icon: CalendarCheck, text: t("login.f1", "Update your availability in one tap") },
        { icon: HeartPulse, text: t("login.f2", "Respond to urgent blood requests") },
        { icon: UserCog, text: t("login.f3", "Manage your donor profile and history") },
    ];

    return (
        <main className="grid min-h-[calc(100vh-76px)] lg:grid-cols-[1fr_1.05fr]">
            {/* Brand panel */}
            <section className="relative hidden overflow-hidden bg-[#0B1020] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-32 -bottom-40 size-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(230,75,90,0.4),transparent)]"
                />

                <Link to="/" className="relative inline-flex w-fit items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                    <span className="grid size-11 place-items-center rounded-[14px] bg-gradient-to-br from-[#E64B5A] to-[#B91F32] shadow-[0_8px_18px_rgba(198,40,56,0.35),inset_0_1px_0_rgba(255,255,255,0.28)]">
                        <Droplets size={22} strokeWidth={2.5} fill="rgba(255,255,255,0.18)" />
                    </span>
                    <span className="text-[21px] leading-none font-extrabold tracking-tight">
                        Blood <span className="text-[#F26A77]">Connect</span>
                    </span>
                </Link>

                <div className="relative max-w-[460px]">
                    <h2 className="text-4xl leading-[1.1] font-extrabold tracking-tight xl:text-5xl">
                        {t("login.heroTitle", "Welcome back, donor.")}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-[#B7C4BE]">
                        {t("login.heroText", "Log in to manage your profile and help people who need blood today.")}
                    </p>

                    <ul className="mt-9 space-y-4">
                        {features.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-3.5 text-[15px] text-[#D5DFDA]">
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[#F6B9BF]">
                                    <Icon size={19} />
                                </span>
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-sm text-[#8FA099]">
                    {t("login.voluntary", "Blood donation is always voluntary and free.")}
                </p>
            </section>

            {/* Form panel */}
            <section className="grid place-items-center bg-[#F8FAFB] px-4 py-12 sm:px-8 lg:bg-white">
                <div className="w-full max-w-[420px]">
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#192623] sm:text-[34px]">
                        {t("login.title", "Log in")}
                    </h1>
                    <p className="mt-2 text-[15px] text-[#66736E]">
                        {t("login.subtitle", "Use the phone number or email you registered with.")}
                    </p>

                    {sessionExpired && (
                        <p className="mt-6 flex items-start gap-2.5 rounded-xl bg-[#EEF4FF] p-3.5 text-sm leading-relaxed text-[#2B4C9B]">
                            <Info size={18} className="mt-0.5 shrink-0" />
                            {t("login.expired", "Your session ended. Please log in again.")}
                        </p>
                    )}

                    {/* Server-level error (announced to screen readers) */}
                    <div aria-live="assertive">
                        {serverError && (
                            <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-[#FBCFD6] bg-[#FFF1F2] p-3.5 text-sm leading-relaxed font-medium text-[#BE123C]">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                {serverError}
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-5">
                        {/* Identifier */}
                        <div>
                            <label htmlFor="identifier" className="mb-2 block text-sm font-bold text-[#192623]">
                                {t("login.identifier", "Phone or email")}
                            </label>
                            <span className="relative block">
                                <UserRound size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#84918C]" />
                                <input
                                    id="identifier"
                                    type="text"
                                    inputMode="email"
                                    autoComplete="username"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    placeholder="01XXXXXXXXX or you@example.com"
                                    aria-invalid={!!errors.identifier}
                                    aria-describedby={errors.identifier ? "identifier-error" : undefined}
                                    className={inputClass(errors.identifier, "pr-4 pl-11")}
                                    {...register("identifier", {
                                        required: t("login.err.idRequired", "Enter your phone number or email."),
                                        setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                                        validate: (v) => {
                                            const compact = v.replace(/[\s-]/g, "");
                                            return (
                                                EMAIL_RE.test(v) ||
                                                PHONE_RE.test(compact) ||
                                                t("login.err.idInvalid", "Enter a valid mobile number or email address.")
                                            );
                                        },
                                    })}
                                />
                            </span>
                            {errors.identifier && (
                                <p id="identifier-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[#E11D48]">
                                    <AlertCircle size={14} /> {errors.identifier.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-bold text-[#192623]">
                                    {t("login.password", "Password")}
                                </label>
                                <Link to="/forgot-password" className="text-sm font-semibold text-[#C62838] hover:underline">
                                    {t("login.forgot", "Forgot password?")}
                                </Link>
                            </div>

                            <span className="relative block">
                                <Lock size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#84918C]" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    aria-invalid={!!errors.password}
                                    aria-describedby={
                                        [errors.password && "password-error", capsLock && "caps-warning"]
                                            .filter(Boolean)
                                            .join(" ") || undefined
                                    }
                                    onKeyUp={(e) => setCapsLock(e.getModifierState?.("CapsLock") ?? false)}
                                    className={inputClass(errors.password, "pr-12 pl-11")}
                                    {...register("password", {
                                        required: t("login.err.pwRequired", "Enter your password."),
                                        onBlur: () => setCapsLock(false),
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    aria-label={showPassword ? t("login.hide", "Hide password") : t("login.show", "Show password")}
                                    aria-pressed={showPassword}
                                    className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[#66736E] outline-none hover:bg-[#EEF1F4] focus-visible:ring-2 focus-visible:ring-[#C62838]/40"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </span>

                            {errors.password && (
                                <p id="password-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[#E11D48]">
                                    <AlertCircle size={14} /> {errors.password.message}
                                </p>
                            )}
                            {capsLock && !errors.password && (
                                <p id="caps-warning" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[#9A6B0B]">
                                    <Info size={14} /> {t("login.caps", "Caps Lock is on.")}
                                </p>
                            )}
                        </div>

                        {/* Remember me */}
                        <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-[#33443D]">
                            <input type="checkbox" className="size-[18px] accent-[#C62838]" {...register("remember")} />
                            {t("login.remember", "Keep me logged in on this device")}
                        </label>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#E11D48] text-[15px] font-extrabold text-white shadow-[0_12px_26px_rgba(220,38,38,0.28)] outline-none transition hover:brightness-95 focus-visible:ring-4 focus-visible:ring-[#C62838]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin motion-reduce:animate-none" />
                                    {t("login.submitting", "Logging in…")}
                                </>
                            ) : (
                                <>
                                    {t("login.submit", "Log in")}
                                    <ArrowRight size={18} strokeWidth={2.5} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-[#66736E]">
                        {t("login.noAccount", "New to Blood Connect?")}{" "}
                        <Link to="/become-donor" className="font-bold text-[#C62838] hover:underline">
                            {t("login.register", "Become a donor")}
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Login;