import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/useAuth";
import Button from "../ui/Button";
import { InputField as Input } from "@/components/ui/input-field";
import {
    AlertCircle,
    ArrowRight,
    Eye,
    EyeOff,
    Info,
    Loader2,
    LockKeyhole,
    ShieldCheck,
    UserRound,
} from "lucide-react";

const REQUEST_TIMEOUT_MS = 15000;
const LAST_ID_KEY = "bc:lastIdentifier";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,30}$/;

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

    if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/login")) {
        return "/";
    }

    return raw;
};

/**
 * Shared sign-in form used by the full /login page and the navbar dialog.
 */
export default function LoginForm({
    onSuccess,
    navigateOnSuccess = true,
    showSessionExpired = true,
}) {
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
        setFocus(rememberedId ? "password" : "identifier");
        return () => abortRef.current?.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

            if (navigateOnSuccess) {
                navigate(getSafeRedirect(location.state?.from), { replace: true });
            }
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

    const serverError = errors.root?.serverError?.message;
    const sessionExpired = showSessionExpired && location.state?.reason === "expired";

    return (
        <>
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
                className="mt-7 grid gap-5 [@media(max-height:820px)]:mt-5 [@media(max-height:820px)]:gap-3.5"
            >
                <Input
                    id="identifier"
                    label={t("cmsLogin.identifier", "Email or username")}
                    icon={UserRound}
                    size="md"
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
                        size="md"
                        error={errors.password?.message}
                        hint={
                            capsLock && !errors.password
                                ? t("login.caps", "Caps Lock is on.")
                                : undefined
                        }
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        onKeyUp={(event) =>
                            setCapsLock(event.getModifierState?.("CapsLock") ?? false)
                        }
                        trailing={
                            <button
                                type="button"
                                onClick={() => setShowPassword((previous) => !previous)}
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

                <div className="flex items-center justify-between gap-3 pt-0.5">
                    <label className="inline-flex cursor-pointer items-center gap-2.5 text-[0.82rem] text-muted-foreground">
                        <input
                            type="checkbox"
                            className="peer absolute m-0 size-[1.15rem] cursor-pointer opacity-0"
                            {...register("remember")}
                        />
                        <span
                            className="pointer-events-none grid size-[1.15rem] shrink-0 place-items-center rounded-[0.4rem] border-2 border-input bg-card transition-[border-color,background-color] duration-200 after:-mt-[0.12rem] after:h-[0.55rem] after:w-[0.32rem] after:rotate-45 after:border-b-2 after:border-r-2 after:border-primary-foreground after:opacity-0 after:transition-opacity after:duration-200 peer-checked:border-primary peer-checked:bg-primary peer-checked:after:opacity-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
                            aria-hidden="true"
                        />

                        {t("cmsLogin.remember", "Keep me signed in")}
                    </label>

                    {rememberMe && (
                        <span className="inline-flex items-center gap-1 text-[0.72rem] font-bold text-success">
                            <ShieldCheck size={14} />
                            {t("login.rememberOn", "Enabled")}
                        </span>
                    )}
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
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
        </>
    );
}
