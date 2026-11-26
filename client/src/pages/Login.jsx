import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import LoginForm from "@/components/LoginForm";
import {
    ArrowLeft,
    ArrowRight,
    Globe,
    Layers,
    ShieldCheck,
    TrendingUp,
} from "lucide-react";

const FeatureItem = ({ icon: Icon, title, description, index }) => (
    <div
        className="flex items-start gap-4 rounded-2xl border border-white/[0.09] bg-[linear-gradient(125deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-[0.85rem_1rem] shadow-none backdrop-blur-[14px] animate-[fade-in_500ms_var(--ease-premium)_backwards] transition-[transform,border-color,background] duration-300 ease-[var(--ease-premium)] hover:translate-x-[5px] hover:border-white/20 hover:bg-[linear-gradient(125deg,rgba(255,255,255,0.11),rgba(255,255,255,0.03))]"
        style={{ animationDelay: `${120 + index * 80}ms` }}
    >
        <div className="grid size-[2.6rem] shrink-0 place-items-center rounded-[0.8rem] border border-[color-mix(in_srgb,var(--cms-indigo)_28%,transparent)] bg-[color-mix(in_srgb,var(--cms-violet)_18%,transparent)] text-[var(--cms-indigo-soft)]">
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
// Login page
// --------------------------------------------------

const Login = ({ onSuccess }) => {
    const { t } = useTranslation();

    useEffect(() => {
        document.title = `${t("cmsLogin.title", "Welcome back")} | Portfolio CMS`;
    }, [t]);

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
        <main className="min-h-dvh bg-surface-alt [--cms-violet:#6366f1] [--cms-indigo:#818cf8] [--cms-indigo-soft:#c7d2fe] [--cms-teal:#5eead4] [--cms-ink:#0b0d14] [--cms-ink-2:#141829] lg:grid lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)]">

            {/* ------------------------------------------- */}
            {/* Left — studio showcase */}
            {/* ------------------------------------------- */}

            <section className="relative isolate hidden overflow-hidden bg-[radial-gradient(80%_70%_at_0%_-10%,color-mix(in_srgb,var(--cms-violet)_30%,transparent),transparent_60%),radial-gradient(70%_65%_at_105%_105%,color-mix(in_srgb,var(--cms-teal)_16%,transparent),transparent_62%),linear-gradient(155deg,var(--cms-ink-2)_0%,var(--cms-ink)_55%,#0d1018_100%)] p-[clamp(1.75rem,3.4vw,3.25rem)_clamp(1.75rem,4.4vw,4.25rem)] text-white before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(rgba(255,255,255,0.11)_1px,transparent_1px)] before:bg-[length:26px_26px] before:opacity-40 before:[mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.6),transparent_80%)] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:bg-[radial-gradient(60%_45%_at_90%_4%,rgba(255,255,255,0.06),transparent_70%)] [@media(max-height:820px)]:py-6 lg:flex lg:flex-col">
                <div className="absolute -top-36 -left-28 -z-10 size-96 animate-[auth-float_16s_ease-in-out_infinite] rounded-full blur-[70px] pointer-events-none" aria-hidden="true" />
                <div className="absolute -right-40 -bottom-52 -z-10 size-[28rem] animate-[auth-float_16s_ease-in-out_infinite] rounded-full bg-[color-mix(in_srgb,var(--primary-hover)_22%,transparent)] blur-[70px] [animation-direction:reverse] [animation-duration:20s] pointer-events-none" aria-hidden="true" />

                <Link to="/" className="inline-flex w-fit items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-[0.95rem] bg-gradient-to-br from-[var(--cms-indigo)] to-[var(--cms-violet)] font-display text-white shadow-[0_12px_28px_-12px_color-mix(in_srgb,var(--cms-violet)_95%,transparent),inset_0_1px_0_rgba(255,255,255,0.35)]" aria-hidden="true">
                        <Layers size={24} strokeWidth={2.2} />
                    </span>
                    <span className="font-display text-xl font-extrabold tracking-tight">
                        Portfolio <span className="text-[var(--cms-indigo-soft)]">CMS</span>
                    </span>
                </Link>

                <div className="my-auto max-w-[34rem] py-4">
                    <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-[0.64rem] font-extrabold uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm">
                        <span className="size-1.5 animate-pulse rounded-full bg-indigo-300" />
                        {t("cmsLogin.badge", "Portfolio CMS")}
                    </span>

                    <h2 className="mt-6 font-display text-[clamp(2.6rem,4.2vw,4.2rem)] font-extrabold leading-[1.05] tracking-[-0.05em] [@media(max-height:820px)]:mt-4 [@media(max-height:820px)]:text-[clamp(1.95rem,2.7vw,2.6rem)]">
                        {t("cmsLogin.heroTitle", "Your work,")}
                        <span className="mt-1 block bg-[linear-gradient(100deg,var(--cms-indigo-soft),var(--cms-indigo)_50%,var(--cms-teal))] bg-clip-text text-transparent dark:bg-[linear-gradient(90deg,var(--brand-light),var(--primary-foreground))]">
                            {t("cmsLogin.heroHighlight", "beautifully managed.")}
                        </span>
                    </h2>

                    <p className="mt-5 max-w-[31rem] text-[0.95rem] leading-[1.85] text-white/60 [@media(max-height:820px)]:mt-3.5 [@media(max-height:820px)]:text-[0.86rem] [@media(max-height:820px)]:leading-[1.7]">
                        {t(
                            "cmsLogin.heroText",
                            "A calm, focused space to shape your portfolio, publish case studies, and keep every project in its best light."
                        )}
                    </p>

                    <div className="mt-7 grid gap-2.5 [@media(max-height:820px)]:mt-5 [@media(max-height:820px)]:gap-2">
                        {features.map((feature, index) => (
                            <FeatureItem key={feature.title} {...feature} index={index} />
                        ))}
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3 [@media(max-height:820px)]:mt-4">
                        <div className="border-t border-white/12 pt-3.5">
                            <p className="font-display text-[1.25rem] font-extrabold tracking-tight text-white">24</p>
                            <p className="mt-0.5 text-[0.63rem] font-semibold uppercase tracking-wider text-white/50">
                                {t("cmsLogin.stat1", "Projects")}
                            </p>
                        </div>
                        <div className="border-t border-white/12 pt-3.5">
                            <p className="font-display text-[1.25rem] font-extrabold tracking-tight text-white">18</p>
                            <p className="mt-0.5 text-[0.63rem] font-semibold uppercase tracking-wider text-white/50">
                                {t("cmsLogin.stat2", "Published")}
                            </p>
                        </div>
                        <div className="border-t border-white/12 pt-3.5">
                            <p className="font-display text-[1.25rem] font-extrabold tracking-tight text-white">06</p>
                            <p className="mt-0.5 text-[0.63rem] font-semibold uppercase tracking-wider text-white/50">
                                {t("cmsLogin.stat3", "Drafts")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/10 pt-5 text-[0.75rem] text-white/55 [@media(max-height:820px)]:pt-3.5">
                    <p>© {new Date().getFullYear()} Portfolio CMS</p>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--cms-teal)]">
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
                    <span className="grid size-12 place-items-center rounded-[0.95rem] bg-gradient-to-br from-[var(--cms-indigo)] to-[var(--cms-violet)] font-display text-white shadow-[0_12px_28px_-12px_color-mix(in_srgb,var(--cms-violet)_95%,transparent),inset_0_1px_0_rgba(255,255,255,0.35)]" aria-hidden="true">
                        <Layers size={20} strokeWidth={2.2} />
                    </span>
                    <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
                        Portfolio <span className="text-primary">CMS</span>
                    </span>
                </Link>

                <BackgroundGradient containerClassName="w-full rounded-[1.6rem]">
                    <div className="relative w-full min-w-lg p-8 rounded-[1.35rem] bg-[color-mix(in_srgb,var(--card)_90%,transparent)]  shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_36px_80px_-36px_color-mix(in_srgb,var(--primary)_32%,transparent),0_3px_12px_-4px_rgba(0,0,0,0.12)] backdrop-blur-[20px] animate-rise">
                        <div className="relative z-10">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-[0.78rem] font-semibold text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ArrowLeft size={16} />
                                {t("cmsLogin.back", "Back to site")}
                            </Link>

                            <div className="mt-5 [@media(max-height:820px)]:mt-4">
                                <span className="inline-flex items-center gap-2.5 text-[0.63rem] font-extrabold uppercase tracking-[0.18em] text-primary before:h-0.5 before:w-6 before:rounded-sm before:bg-primary before:content-['']">
                                    {t("cmsLogin.eyebrow", "Studio access")}
                                </span>

                                <h1 className="mt-3 font-display text-[clamp(1.9rem,3vw,2.4rem)] font-extrabold leading-tight tracking-[-0.04em] text-foreground [@media(max-height:820px)]:text-[1.9rem]">
                                    {t("cmsLogin.title", "Welcome back")}
                                </h1>

                                <p className="mt-2.5 text-[0.875rem] leading-relaxed text-muted-foreground">
                                    {t(
                                        "cmsLogin.subtitle",
                                        "Sign in to manage your portfolio and publications."
                                    )}
                                </p>
                            </div>

                            <LoginForm onSuccess={onSuccess} />

                            <div className="mt-6 border-t border-border pt-6 text-center [@media(max-height:820px)]:mt-5 [@media(max-height:820px)]:pt-5">
                                <p className="text-[0.82rem] text-muted-foreground">
                                    {t("cmsLogin.noAccount", "Need access to the studio?")}
                                </p>

                                <Button
                                    to="/become-donor"
                                    variant="outline"
                                    size="sm"
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
                </BackgroundGradient>
            </section>
        </main>
    );
};

export default Login;
