import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/useAuth";
import Button from "../ui/Button";
import Input from "../ui/Input";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Eye,
    EyeOff,
    Globe,
    Info,
    Layers,
    Loader2,
    LockKeyhole,
    ShieldCheck,
    TrendingUp,
    UserRound,
} from "lucide-react";

// --------------------------------------------------
// Configuration
// --------------------------------------------------

const REQUEST_TIMEOUT_MS = 15000;
const LAST_ID_KEY = "bc:lastIdentifier";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,30}$/;

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

// --------------------------------------------------
// Reusable components
// --------------------------------------------------

const FeatureItem = ({ icon: Icon, title, description, index }) => (
    <div
        className="cms-feature flex items-start gap-4 rounded-2xl p-[0.85rem_1rem]"
        style={{ animationDelay: `${120 + index * 80}ms` }}
    >
        <div className="cms-feature-icon">
            <Icon size={19} />
        </div>

        <div>
            <h3 className="text-[0.85rem] font-bold text-white">{title}</h3>
            <p className="mt-0.5 text-[0.78rem] leading-relaxed text-white/55">
                {description}
            </p>
        </div>
    </div>
);

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

    useEffect(() => {
        document.title = `${t("cmsLogin.title", "Welcome back")} | Portfolio CMS`;

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

            writeStorage(LAST_ID_KEY, values.remember ? identifier : "");

            onSuccess?.(data);

            navigate(getSafeRedirect(location.state?.from), { replace: true });
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
                    "cmsLogin.err.invalid",
                    "Incorrect email or password. Please try again."
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

            setError("root.serverError", { type: "server", message });
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
            icon: Layers,
            title: t("cmsLogin.f1Title", "Curate projects"),
            description: t("cmsLogin.f1", "Organize work, drafts and case studies in one place."),
        },
        {
            icon: Globe,
            title: t("cmsLogin.f2Title", "Publish with confidence"),
            description: t("cmsLogin.f2", "Preview and release updates whenever you are ready."),
        },
        {
            icon: TrendingUp,
            title: t("cmsLogin.f3Title", "Know your audience"),
            description: t("cmsLogin.f3", "See what resonates with visitors and clients."),
        },
    ];

    return (
        <main className="cms-login-page min-h-dvh bg-surface-alt lg:grid lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)]">

            {/* ------------------------------------------- */}
            {/* Left — studio showcase */}
            {/* ------------------------------------------- */}

            <section className="cms-showcase relative isolate hidden overflow-hidden text-white lg:flex lg:flex-col">
                <div className="cms-orb cms-orb-a" aria-hidden="true" />
                <div className="cms-orb cms-orb-b" aria-hidden="true" />

                <Link to="/" className="inline-flex w-fit items-center gap-3">
                    <span className="cms-brand-mark" aria-hidden="true">
                        <Layers size={24} strokeWidth={2.2} />
                    </span>
                    <span className="font-display text-xl font-extrabold tracking-tight">
                        Portfolio <span className="cms-brand-name">CMS</span>
                    </span>
                </Link>

                <div className="cms-showcase-body my-auto max-w-[34rem] py-8">
                    <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-[0.64rem] font-extrabold uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm">
                        <span className="size-1.5 animate-pulse rounded-full bg-indigo-300" />
                        {t("cmsLogin.badge", "Portfolio CMS")}
                    </span>

                    <h2 className="cms-hero-title mt-6 font-display text-[clamp(2.6rem,4.2vw,4.2rem)] font-extrabold leading-[1.05] tracking-[-0.05em]">
                        {t("cmsLogin.heroTitle", "Your work,")}
                        <span className="cms-gradient-text mt-1 block">
                            {t("cmsLogin.heroHighlight", "beautifully managed.")}
                        </span>
                    </h2>

                    <p className="cms-hero-copy mt-5 max-w-[31rem] text-[0.95rem] leading-[1.85] text-white/60">
                        {t(
                            "cmsLogin.heroText",
                            "A calm, focused space to shape your portfolio, publish case studies, and keep every project in its best light."
                        )}
                    </p>

                    <div className="cms-features mt-9 grid gap-2.5">
                        {features.map((feature, index) => (
                            <FeatureItem key={feature.title} {...feature} index={index} />
                        ))}
                    </div>

                    <div className="cms-stats mt-7 grid grid-cols-3 gap-3">
                        <div className="cms-stat pt-3.5">
                            <p className="font-display text-[1.25rem] font-extrabold tracking-tight text-white">24</p>
                            <p className="mt-0.5 text-[0.63rem] font-semibold uppercase tracking-wider text-white/50">
                                {t("cmsLogin.stat1", "Projects")}
                            </p>
                        </div>
                        <div className="cms-stat pt-3.5">
                            <p className="font-display text-[1.25rem] font-extrabold tracking-tight text-white">18</p>
                            <p className="mt-0.5 text-[0.63rem] font-semibold uppercase tracking-wider text-white/50">
                                {t("cmsLogin.stat2", "Published")}
                            </p>
                        </div>
                        <div className="cms-stat pt-3.5">
                            <p className="font-display text-[1.25rem] font-extrabold tracking-tight text-white">06</p>
                            <p className="mt-0.5 text-[0.63rem] font-semibold uppercase tracking-wider text-white/50">
                                {t("cmsLogin.stat3", "Drafts")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="cms-showcase-footer mt-auto flex items-center justify-between gap-4 border-t border-white/10 pt-5 text-[0.75rem] text-white/55">
                    <p>© {new Date().getFullYear()} Portfolio CMS</p>
                    <span className="cms-secure inline-flex items-center gap-1.5 font-semibold">
                        <ShieldCheck size={15} />
                        Encrypted workspace
                    </span>
                </div>
            </section>

            {/* ------------------------------------------- */}
            {/* Right — sign in */}
            {/* ------------------------------------------- */}

            <section className="bg-gradient relative flex min-h-dvh items-center justify-center px-4 pt-20 pb-8 sm:px-8 lg:min-h-0 lg:px-12 lg:py-10">
                <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-2.5 lg:hidden">
                    <span className="cms-brand-mark" aria-hidden="true">
                        <Layers size={20} strokeWidth={2.2} />
                    </span>
                    <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
                        Portfolio <span className="text-primary">CMS</span>
                    </span>
                </Link>

                <div className="cms-card relative w-full max-w-[27.5rem] rounded-[1.6rem] p-6 sm:p-9">
                    <div className="relative z-10">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-[0.78rem] font-semibold text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft size={16} />
                            {t("cmsLogin.back", "Back to site")}
                        </Link>

                        <div className="cms-heading mt-5">
                            <span className="cms-eyebrow inline-flex items-center gap-2.5 text-[0.63rem] font-extrabold uppercase tracking-[0.18em] text-primary">
                                {t("cmsLogin.eyebrow", "Studio access")}
                            </span>

                            <h1 className="cms-title mt-3 font-display text-[clamp(1.9rem,3vw,2.4rem)] font-extrabold leading-tight tracking-[-0.04em] text-foreground">
                                {t("cmsLogin.title", "Welcome back")}
                            </h1>

                            <p className="mt-2.5 text-[0.875rem] leading-relaxed text-muted-foreground">
                                {t(
                                    "cmsLogin.subtitle",
                                    "Sign in to manage your portfolio and publications."
                                )}
                            </p>
                        </div>

                        {sessionExpired && (
                            <div className="mt-5 flex items-start gap-3 rounded-xl border border-info/20 bg-info/10 p-4 text-[0.82rem] leading-relaxed text-info [&>svg]:mt-0.5 [&>svg]:shrink-0">
                                <Info size={18} />
                                {t("login.expired", "Your session has expired. Please log in again.")}
                            </div>
                        )}

                        <div aria-live="assertive">
                            {serverError && (
                                <div className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-[0.82rem] leading-relaxed text-destructive [&>svg]:mt-0.5 [&>svg]:shrink-0">
                                    <AlertCircle size={19} />
                                    <span>{serverError}</span>
                                </div>
                            )}
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            className="cms-form mt-7 grid gap-5"
                        >
                            {/* Identifier */}
                            <Input
                                id="identifier"
                                label={t("cmsLogin.identifier", "Email or username")}
                                icon={UserRound}
                                size="lg"
                                error={errors.identifier?.message}
                                type="text"
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck={false}
                                placeholder="you@studio.com or username"
                                {...register("identifier", {
                                    required: t(
                                        "cmsLogin.err.idRequired",
                                        "Please enter your email or username."
                                    ),
                                    setValueAs: (value) =>
                                        typeof value === "string" ? value.trim() : value,
                                    validate: (value) => {
                                        const compact = value.replace(/[\s-]/g, "");

                                        return (
                                            EMAIL_RE.test(value) ||
                                            PHONE_RE.test(compact) ||
                                            USERNAME_RE.test(value) ||
                                            t(
                                                "cmsLogin.err.idInvalid",
                                                "Enter a valid email address or username."
                                            )
                                        );
                                    },
                                })}
                            />

                            {/* Password */}
                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="text-[0.7rem] font-extrabold tracking-[0.11em] text-muted-foreground uppercase">
                                        {t("login.password", "Password")}
                                    </span>

                                    <Link
                                        to="/forgot-password"
                                        className="text-[0.75rem] font-bold text-primary hover:text-primary-hover hover:underline"
                                    >
                                        {t("cmsLogin.forgot", "Forgot password?")}
                                    </Link>
                                </div>

                                <Input
                                    id="password"
                                    icon={LockKeyhole}
                                    size="lg"
                                    error={errors.password?.message}
                                    hint={
                                        capsLock && !errors.password
                                            ? t("login.caps", "Caps Lock is on.")
                                            : undefined
                                    }
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    onKeyUp={(event) =>
                                        setCapsLock(
                                            event.getModifierState?.("CapsLock") ?? false
                                        )
                                    }
                                    trailing={
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((previous) => !previous)
                                            }
                                            aria-label={
                                                showPassword ? "Hide password" : "Show password"
                                            }
                                            aria-pressed={showPassword}
                                            className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                    {...register("password", {
                                        required: t(
                                            "cmsLogin.err.pwRequired",
                                            "Please enter your password."
                                        ),
                                        onBlur: () => setCapsLock(false),
                                    })}
                                />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center justify-between gap-3 pt-0.5">
                                <label className="inline-flex cursor-pointer items-center gap-2.5 text-[0.82rem] text-muted-foreground">
                                    <input
                                        type="checkbox"
                                        className="cms-checkbox"
                                        {...register("remember")}
                                    />
                                    <span className="cms-check-box" aria-hidden="true" />

                                    {t("cmsLogin.remember", "Keep me signed in")}
                                </label>

                                {rememberMe && (
                                    <span className="inline-flex items-center gap-1 text-[0.72rem] font-bold text-success">
                                        <ShieldCheck size={14} />
                                        {t("login.rememberOn", "Enabled")}
                                    </span>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                variant="primary"
                                size="xl"
                                disabled={isSubmitting}
                                aria-busy={isSubmitting}
                                className="group mt-1 w-full"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={19} className="animate-spin" />
                                        {t("cmsLogin.submitting", "Signing you in...")}
                                    </>
                                ) : (
                                    <>
                                        {t("cmsLogin.submit", "Sign in to studio")}
                                        <ArrowRight
                                            size={18}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="cms-switch mt-6 border-t border-border pt-6 text-center">
                            <p className="text-[0.82rem] text-muted-foreground">
                                {t("cmsLogin.noAccount", "Need access to the studio?")}
                            </p>

                            <Button
                                to="/become-donor"
                                variant="outline"
                                size="lg"
                                className="group mt-3.5 w-full"
                            >
                                {t("cmsLogin.register", "Request an account")}
                                <ArrowRight
                                    size={17}
                                    className="transition-transform duration-200 group-hover:translate-x-1"
                                />
                            </Button>
                        </div>

                        <p className="mt-5 flex items-center justify-center gap-2 text-[0.72rem] text-muted-foreground">
                            <ShieldCheck size={15} />
                            {t("cmsLogin.trust", "Encrypted session · Your work stays yours")}
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Login;
