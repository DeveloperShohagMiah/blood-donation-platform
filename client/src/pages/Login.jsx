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

const inputClass = (hasError) =>
    hasError ? "login-input is-invalid" : "login-input";

// --------------------------------------------------
// Reusable components
// --------------------------------------------------

const BrandMark = ({ className }) => (
    <span className={className}>
        <Droplets size={25} strokeWidth={2.2} />
    </span>
);

const FeatureItem = ({ icon: Icon, title, description, index }) => (
    <div
        className="login-feature"
        style={{ animationDelay: `${120 + index * 80}ms` }}
    >
        <div className="login-feature-icon">
            <Icon size={19} />
        </div>

        <div>
            <h3 className="login-feature-title">{title}</h3>
            <p className="login-feature-copy">{description}</p>
        </div>
    </div>
);

const FieldError = ({ id, children }) => {
    if (!children) return null;

    return (
        <p id={id} role="alert" className="login-hint login-hint-error">
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
        <main className="login-page">

            {/* ------------------------------------------- */}
            {/* Left brand showcase */}
            {/* ------------------------------------------- */}

            <section className="login-showcase">
                <div className="login-texture" aria-hidden="true" />
                <div className="login-sheen" aria-hidden="true" />

                <div className="login-orb login-orb-a" aria-hidden="true" />
                <div className="login-orb login-orb-b" aria-hidden="true" />
                <div className="login-orb login-orb-c" aria-hidden="true" />

                {/* Decorative heartbeat — the visual signature of the page. */}
                <div className="login-pulse" aria-hidden="true">
                    <svg viewBox="0 0 420 170" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="authPulseStroke" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="var(--login-pulse-edge)" />
                                <stop offset="45%" stopColor="var(--login-rose)" />
                                <stop offset="70%" stopColor="var(--login-rose-soft)" />
                                <stop offset="100%" stopColor="var(--login-pulse-edge)" />
                            </linearGradient>
                        </defs>
                        <path d="M0 110 H68 L84 110 L96 86 L110 138 L128 34 L146 110 H214 L230 110 L242 92 L254 128 L270 62 L286 110 L360 110 L376 96 L390 124 L406 74 L420 110" />
                    </svg>
                </div>

                <Link to="/" className="login-brand">
                    <BrandMark className="login-brand-mark" />
                    <span className="login-brand-name">
                        Blood <span>{t("text.Connect")}</span>
                    </span>
                </Link>

                <div className="login-showcase-body">
                    <span className="login-badge">
                        <span className="login-badge-dot" />
                        {t("login.brandBadge", "A COMMUNITY THAT CARES")}
                    </span>

                    <h2 className="login-hero-title">
                        {t("login.heroTitle", "Welcome back, donor.")}
                        <span>
                            {t("login.heroHighlight", "Your next act could save a life.")}
                        </span>
                    </h2>

                    <p className="login-hero-copy">
                        {t(
                            "login.heroText",
                            "Log in to manage your donor profile, update your availability and stay connected with people who need blood."
                        )}
                    </p>

                    <div className="login-features">
                        {features.map((feature, index) => (
                            <FeatureItem key={feature.title} {...feature} index={index} />
                        ))}
                    </div>

                    <div className="login-stats">
                        <div className="login-stat">
                            <p className="login-stat-value">24/7</p>
                            <p className="login-stat-label">
                                {t("login.stat1", "Always online")}
                            </p>
                        </div>
                        <div className="login-stat">
                            <p className="login-stat-value">100%</p>
                            <p className="login-stat-label">
                                {t("login.stat2", "Voluntary")}
                            </p>
                        </div>
                        <div className="login-stat">
                            <p className="login-stat-value">Free</p>
                            <p className="login-stat-label">
                                {t("login.stat3", "No cost, ever")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="login-showcase-footer">
                    <p>
                        {t(
                            "login.voluntary",
                            "Blood donation is always voluntary and free."
                        )}
                    </p>

                    <span className="login-secure">
                        <ShieldCheck size={15} />
                        {t("login.secure", "Secure access")}
                    </span>
                </div>
            </section>

            {/* ------------------------------------------- */}
            {/* Right form panel */}
            {/* ------------------------------------------- */}

            <section className="login-panel">
                <Link to="/" className="login-mobile-brand">
                    <BrandMark className="login-mobile-mark" />
                    <span className="login-mobile-name">
                        Blood <span>{t("text.Connect")}</span>
                    </span>
                </Link>

                <div className="login-card">
                    <div className="login-card-content">
                        <Link to="/" className="login-back">
                            <ArrowLeft size={16} />
                            {t("login.backHome", "Back to home")}
                        </Link>

                        <div className="login-heading">
                            <span className="login-eyebrow">
                                {t("login.eyebrow", "Member sign in")}
                            </span>

                            <h1 className="login-title">
                                {t("login.title", "Welcome back")}
                            </h1>

                            <p className="login-subtitle">
                                {t(
                                    "login.subtitle",
                                    "Sign in to your Blood Connect account using your registered phone number or email."
                                )}
                            </p>
                        </div>

                        {sessionExpired && (
                            <div className="login-alert login-alert-info">
                                <Info size={18} />
                                {t(
                                    "login.expired",
                                    "Your session has expired. Please log in again."
                                )}
                            </div>
                        )}

                        <div aria-live="assertive">
                            {serverError && (
                                <div className="login-alert login-alert-error">
                                    <AlertCircle size={19} />
                                    <span>{serverError}</span>
                                </div>
                            )}
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            className="login-form"
                        >
                            {/* Identifier */}
                            <div>
                                <label htmlFor="identifier" className="login-label">
                                    {t("login.identifier", "Phone number or email")}
                                </label>

                                <div className="login-field">
                                    <UserRound size={19} className="login-input-icon" />

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
                                        className={inputClass(errors.identifier)}
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
                                <div className="login-label-row">
                                    <label htmlFor="password" className="login-label">
                                        {t("login.password", "Password")}
                                    </label>

                                    <Link to="/forgot-password" className="login-forgot">
                                        {t("login.forgot", "Forgot password?")}
                                    </Link>
                                </div>

                                <div className="login-field">
                                    <LockKeyhole size={19} className="login-input-icon" />

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
                                        className={inputClass(errors.password)}
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
                                        className="login-eye"
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
                                    <p id="caps-warning" className="login-hint login-hint-warn">
                                        <Info size={14} />
                                        {t("login.caps", "Caps Lock is on.")}
                                    </p>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="login-remember">
                                <label className="login-check-label">
                                    <input
                                        type="checkbox"
                                        className="login-checkbox"
                                        {...register("remember")}
                                    />
                                    <span className="login-check-box" aria-hidden="true" />

                                    {t("login.remember", "Remember my identifier")}
                                </label>

                                {rememberMe && (
                                    <span className="login-enabled">
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
                                className="btn-premium login-submit"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={19} className="animate-spin" />
                                        {t("login.submitting", "Signing you in...")}
                                    </>
                                ) : (
                                    <>
                                        {t("login.submit", "Sign in to your account")}
                                        <ArrowRight size={18} className="login-arrow" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="login-switch">
                            <p className="login-switch-text">
                                {t("login.noAccount", "New to Blood Connect?")}
                            </p>

                            <Link to="/become-donor" className="login-register">
                                {t("login.register", "Create an account")}
                                <ArrowRight size={17} />
                            </Link>
                        </div>

                        <p className="login-trust">
                            <ShieldCheck size={15} />
                            {t(
                                "login.privacy",
                                "Your account information is protected."
                            )}
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Login;
