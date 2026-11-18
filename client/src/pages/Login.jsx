
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/useAuth";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CalendarCheck,
    CheckCircle2,
    Droplets,
    Eye,
    EyeOff,
    HeartPulse,
    Info,
    Loader2,
    LockKeyhole,
    ShieldCheck,
    UserRound,
    UserCog,
} from "lucide-react";

// --------------------------------------------------
// Configuration
// --------------------------------------------------

const REQUEST_TIMEOUT_MS = 15000;
const LAST_ID_KEY = "bc:lastIdentifier";

// Bangladesh mobile number:
// 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const readStorage = (key) => {
    try {
        return localStorage.getItem(key) || "";
    } catch {
        return "";
    }
};

const writeStorage = (key, value) => {
    try {
        if (value) {
            localStorage.setItem(key, value);
        } else {
            localStorage.removeItem(key);
        }
    } catch {
        // Storage may be unavailable in private browsing.
    }
};

const getSafeRedirect = (from) => {
    const raw =
        typeof from === "string"
            ? from
            : from?.pathname
                ? `${from.pathname}${from.search || ""}${from.hash || ""}`
                : "/";

    if (
        !raw.startsWith("/") ||
        raw.startsWith("//") ||
        raw.startsWith("/login")
    ) {
        return "/";
    }

    return raw;
};

const getInputClass = (hasError) =>
    [
        "h-13 w-full rounded-xl border bg-white pl-12 pr-4",
        "text-sm font-medium text-slate-900 outline-none",
        "placeholder:font-normal placeholder:text-slate-400",
        "transition duration-200",
        "focus:ring-4",
        hasError
            ? "border-primary/40 focus:border-primary/90 focus:ring-primary/90/10"
            : "border-slate-200 hover:border-slate-300 focus:border-primary/90 focus:ring-primary/90/10",
    ].join(" ");

// --------------------------------------------------
// Reusable components
// --------------------------------------------------

const FeatureItem = ({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/10 text-primary">
            <Icon size={20} />
        </div>

        <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
                {description}
            </p>
        </div>
    </div>
);

const FieldError = ({ id, children }) => {
    if (!children) return null;

    return (
        <p
            id={id}
            role="alert"
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary"
        >
            <AlertCircle size={14} />
            {children}
        </p>
    );
};

// --------------------------------------------------
// Login component
// --------------------------------------------------

const Login = ({ onSuccess }) => {
    const { t } = useTranslation();
    const { login } = useAuth();
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
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        mode: "onTouched",
        reValidateMode: "onChange",
        defaultValues: {
            identifier: rememberedId,
            password: "",
            remember: Boolean(rememberedId),
        },
    });

    const rememberMe = watch("remember");

    // Focus the appropriate field on initial render.
    useEffect(() => {
        document.title = `${t("login.title", "Log in")} | Blood Connect`;

        setFocus(rememberedId ? "password" : "identifier");

        return () => {
            abortRef.current?.abort();
        };
    }, []);

    // ------------------------------------------------
    // Submit
    // ------------------------------------------------

    const onSubmit = async (values) => {
        clearErrors("root.serverError");

        abortRef.current?.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        let timedOut = false;

        const timer = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, REQUEST_TIMEOUT_MS);

        const identifier = values.identifier.trim();

        try {
            const data = await login(
                {
                    identifier,
                    password: values.password,
                    remember: values.remember,
                },
                controller.signal
            );

            writeStorage(
                LAST_ID_KEY,
                values.remember ? identifier : ""
            );

            onSuccess?.(data);

            navigate(getSafeRedirect(location.state?.from), {
                replace: true,
            });
        } catch (error) {
            if (controller.signal.aborted && !error.status) {
                if (timedOut) {
                    setError("root.serverError", {
                        type: "timeout",
                        message: t(
                            "login.err.timeout",
                            "The request took too long. Check your connection and try again."
                        ),
                    });
                }

                return;
            }

            let message;

            if ([400, 401, 404].includes(error.status)) {
                message = t(
                    "login.err.invalid",
                    "Incorrect phone, email or password. Please try again."
                );

                resetField("password");
                setFocus("password");
            } else if (error.status === 403) {
                message =
                    error.message ||
                    t(
                        "login.err.blocked",
                        "This account cannot log in right now. Please contact support."
                    );
            } else if (error.status === 429) {
                message = error.retryAfter
                    ? t(
                        "login.err.rateWait",
                        "Too many attempts. Try again in {{seconds}} seconds.",
                        { seconds: error.retryAfter }
                    )
                    : t(
                        "login.err.rate",
                        "Too many attempts. Please wait a few minutes and try again."
                    );
            } else if (error.status >= 500) {
                message = t(
                    "login.err.server",
                    "Our server had a problem. Please try again shortly."
                );
            } else {
                message = t(
                    "login.err.network",
                    "Could not reach the server. Check your internet connection."
                );
            }

            setError("root.serverError", {
                type: "server",
                message,
            });
        } finally {
            clearTimeout(timer);
        }
    };

    // ------------------------------------------------
    // Content
    // ------------------------------------------------

    const serverError = errors.root?.serverError?.message;
    const sessionExpired = location.state?.reason === "expired";

    const features = [
        {
            icon: CalendarCheck,
            title: t("login.f1Title", "Manage availability"),
            description: t(
                "login.f1",
                "Update your donor availability whenever you need."
            ),
        },
        {
            icon: HeartPulse,
            title: t("login.f2Title", "Help save lives"),
            description: t(
                "login.f2",
                "Stay informed about blood requests in your area."
            ),
        },
        {
            icon: UserCog,
            title: t("login.f3Title", "Your donor profile"),
            description: t(
                "login.f3",
                "Manage your personal information and donation history."
            ),
        },
    ];

    return (
        <main className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-[#F8F9FC] lg:grid lg:grid-cols-2">

            {/* ------------------------------------------- */}
            {/* Left brand panel */}
            {/* ------------------------------------------- */}

            <section className="relative hidden overflow-hidden bg-[#101827] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-14">

                {/* Background decoration */}
                <div className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-primary/90/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-48 -left-40 size-[520px] rounded-full bg-rose-500/10 blur-3xl" />

                <div className="relative z-10">

                    {/* Brand */}
                    <Link to="/" className="inline-flex items-center gap-3">
                        <span className="grid size-12 place-items-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
                            <Droplets size={25} className="text-white" />
                        </span>

                        <span className="text-xl font-extrabold tracking-tight">
                            Blood <span className="text-primary">{t("text.Connect")}</span>
                        </span>
                    </Link>

                    {/* Hero */}
                    <div className="mt-24 max-w-lg">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-primary">
                            <span className="size-1.5 rounded-full bg-primary" />
                            {t("login.brandBadge", "A COMMUNITY THAT CARES")}
                        </span>

                        <h2 className="mt-6 text-4xl leading-[1.12] font-extrabold tracking-tight xl:text-5xl">
                            {t("login.heroTitle", "Welcome back, donor.")}
                            <span className="mt-2 block text-primary">
                                {t("login.heroHighlight", "Your next act could save a life.")}
                            </span>
                        </h2>

                        <p className="mt-6 max-w-md text-base leading-8 text-slate-400">
                            {t(
                                "login.heroText",
                                "Log in to manage your donor profile, update your availability and stay connected with people who need blood."
                            )}
                        </p>

                        <div className="mt-10 space-y-7">
                            {features.map((feature) => (
                                <FeatureItem key={feature.title} {...feature} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom information */}
                <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6">
                    <p className="text-sm text-slate-400">
                        {t(
                            "login.voluntary",
                            "Blood donation is always voluntary and free."
                        )}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        {t("login.secure", "Secure access")}
                    </div>
                </div>
            </section>

            {/* ------------------------------------------- */}
            {/* Login form panel */}
            {/* ------------------------------------------- */}

            <section className="relative flex min-h-[calc(100vh-76px)] items-center justify-center px-4 py-10 sm:px-8 lg:px-12">

                {/* Mobile brand */}
                <Link
                    to="/"
                    className="absolute top-6 left-5 inline-flex items-center gap-2.5 lg:hidden"
                >
                    <span className="grid size-10 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                        <Droplets size={21} />
                    </span>

                    <span className="text-lg font-extrabold tracking-tight text-slate-900">
                        Blood <span className="text-primary">{t("text.Connect")}</span>
                    </span>
                </Link>

                <div className="w-full max-w-[440px] pt-12 lg:pt-0">

                    {/* Back link */}
                    <Link
                        to="/"
                        className="mb-8 hidden w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary lg:inline-flex"
                    >
                        <ArrowLeft size={16} />
                        {t("login.backHome", "Back to home")}
                    </Link>

                    {/* Form heading */}
                    <div>
                        <div className="mb-6 grid size-14 place-items-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
                            <LockKeyhole size={25} />
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                            {t("login.title", "Welcome back")}
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                            {t(
                                "login.subtitle",
                                "Sign in to your Blood Connect account using your registered phone number or email."
                            )}
                        </p>
                    </div>

                    {/* Session expired */}
                    {sessionExpired && (
                        <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                            <Info size={18} className="mt-0.5 shrink-0" />
                            {t(
                                "login.expired",
                                "Your session has expired. Please log in again."
                            )}
                        </div>
                    )}

                    {/* Server error */}
                    <div aria-live="assertive">
                        {serverError && (
                            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                                <span>{serverError}</span>
                            </div>
                        )}
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                        className="mt-8 space-y-5"
                    >

                        {/* Identifier */}
                        <div>
                            <label
                                htmlFor="identifier"
                                className="mb-2 block text-sm font-semibold text-slate-800"
                            >
                                {t("login.identifier", "Phone number or email")}
                            </label>

                            <div className="relative">
                                <UserRound
                                    size={19}
                                    className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="identifier"
                                    type="text"
                                    inputMode="email"
                                    autoComplete="username"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    placeholder="01XXXXXXXXX or you@example.com"
                                    aria-invalid={Boolean(errors.identifier)}
                                    aria-describedby={
                                        errors.identifier ? "identifier-error" : undefined
                                    }
                                    className={getInputClass(errors.identifier)}
                                    {...register("identifier", {
                                        required: t(
                                            "login.err.idRequired",
                                            "Please enter your phone number or email."
                                        ),
                                        setValueAs: (value) =>
                                            typeof value === "string" ? value.trim() : value,
                                        validate: (value) => {
                                            const compact = value.replace(/[\s-]/g, "");

                                            return (
                                                EMAIL_RE.test(value) ||
                                                PHONE_RE.test(compact) ||
                                                t(
                                                    "login.err.idInvalid",
                                                    "Please enter a valid mobile number or email address."
                                                )
                                            );
                                        },
                                    })}
                                />
                            </div>

                            <FieldError id="identifier-error">
                                {errors.identifier?.message}
                            </FieldError>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-slate-800"
                                >
                                    {t("login.password", "Password")}
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-semibold text-primary transition hover:text-red-700 hover:underline sm:text-sm"
                                >
                                    {t("login.forgot", "Forgot password?")}
                                </Link>
                            </div>

                            <div className="relative">
                                <LockKeyhole
                                    size={19}
                                    className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={
                                        [
                                            errors.password && "password-error",
                                            capsLock && "caps-warning",
                                        ]
                                            .filter(Boolean)
                                            .join(" ") || undefined
                                    }
                                    onKeyUp={(event) =>
                                        setCapsLock(
                                            event.getModifierState?.("CapsLock") ?? false
                                        )
                                    }
                                    className={getInputClass(errors.password) + " pr-12"}
                                    {...register("password", {
                                        required: t(
                                            "login.err.pwRequired",
                                            "Please enter your password."
                                        ),
                                        onBlur: () => setCapsLock(false),
                                    })}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((previous) => !previous)}
                                    aria-label={
                                        showPassword ? "Hide password" : "Show password"
                                    }
                                    aria-pressed={showPassword}
                                    className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/90/30"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>

                            <FieldError id="password-error">
                                {errors.password?.message}
                            </FieldError>

                            {capsLock && !errors.password && (
                                <p
                                    id="caps-warning"
                                    className="mt-2 flex items-center gap-2 text-xs font-medium text-amber-700"
                                >
                                    <Info size={14} />
                                    {t("login.caps", "Caps Lock is on.")}
                                </p>
                            )}
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center justify-between gap-3 pt-1">
                            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    className="size-4 cursor-pointer rounded border-slate-300 accent-primary focus:ring-primary/90"
                                    {...register("remember")}
                                />

                                {t("login.remember", "Remember my identifier")}
                            </label>

                            {rememberMe && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                    <CheckCircle2 size={14} />
                                    {t("login.rememberOn", "Enabled")}
                                </span>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                            className="btn-premium group min-h-[54px] w-full px-5 text-sm outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={19} className="animate-spin" />
                                    {t("login.submitting", "Signing you in...")}
                                </>
                            ) : (
                                <>
                                    {t("login.submit", "Sign in to your account")}
                                    <ArrowRight
                                        size={18}
                                        className="transition-transform duration-200 group-hover:translate-x-1"
                                    />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register */}
                    <div className="mt-8 border-t border-slate-200 pt-7 text-center">
                        <p className="text-sm text-slate-500">
                            {t("login.noAccount", "New to Blood Connect?")}{" "}
                            <Link
                                to="/become-donor"
                                className="font-bold text-primary transition hover:text-primary hover:underline"
                            >
                                {t("login.register", "Create an account")}
                            </Link>
                        </p>
                    </div>

                    {/* Trust note */}
                    <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
                        <ShieldCheck size={15} />
                        {t(
                            "login.privacy",
                            "Your account information is protected."
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Login;
