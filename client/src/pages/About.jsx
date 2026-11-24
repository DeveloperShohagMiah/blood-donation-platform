import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import {
    ArrowRight,
    Check,
    Droplet,
    Eye,
    HandHeart,
    Heart,
    MapPin,
    MessageCircle,
    ShieldCheck,
    Target,
    Users,
} from "lucide-react";
import HeroBadge from "../ui/HeroBadge";

const valueItems = [
    { key: "humanity", icon: Heart },
    { key: "trust", icon: ShieldCheck },
    { key: "community", icon: Users },
    { key: "service", icon: HandHeart },
];

const missionItems = [
    { key: "mission", icon: Target },
    { key: "vision", icon: Eye },
];

const stepItems = [
    { number: "01", key: "find" },
    { number: "02", key: "verify" },
    { number: "03", key: "coordinate" },
];

const pillarItems = [
    { key: "pillar1", icon: MapPin },
    { key: "pillar2", icon: ShieldCheck },
    { key: "pillar3", icon: Heart },
];

const SectionHeading = ({ eyebrow, title, text, centered = true }) => (
    <div
        className={`about-reveal about-section-heading ${centered
            ? "about-section-heading--center mx-auto mb-12 max-w-2xl text-center"
            : "mb-10 max-w-2xl"
            }`}
    >
        <span
            className={`about-section-eyebrow inline-flex items-center gap-3 text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-primary ${centered ? "justify-center" : ""
                }`}
        >
            {eyebrow}
        </span>
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            {title}
        </h2>
        {text && <p className="mt-4 leading-7 text-muted-foreground">{text}</p>}
    </div>
);

const IconBadge = ({ icon: Icon, small = false }) => (
    <span
        className={`grid shrink-0 place-items-center bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-lg shadow-primary/25 ${small ? "size-11 rounded-xl" : "size-14 rounded-2xl"
            }`}
    >
        <Icon size={small ? 20 : 25} strokeWidth={2.1} />
    </span>
);

const About = () => {
    const { t } = useTranslation();

    return (
        <div className="overflow-hidden bg-background text-foreground">

            {/* ---------- Hero — Tailwind only ---------- */}
            <section className="relative isolate overflow-hidden bg-card py-10 sm:py-16 lg:py-24">
                {/* Ambient gradient field */}
                <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-20">
                    <div>
                        <HeroBadge
                            icon={<Heart size={13} fill="currentColor" fillOpacity={0.25} />}
                            label={t("about.badge", "About Blood Connect")}
                        />
                        <h1 className="mt-6 font-display text-[clamp(2.6rem,5.6vw,4.6rem)] leading-[1.04] font-extrabold tracking-[-0.05em] ">
                            {t("about.heading1", "Connecting Hearts,")}
                            <span className="mt-1 block bg-gradient-to-r from-primary via-primary-hover to-brand-deep bg-clip-text text-transparent">
                                {t("about.heading2", "Saving Lives.")}
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                            {t(
                                "about.intro",
                                "Blood Connect is a community-focused blood donation initiative that connects voluntary blood donors with people who need blood. Our goal is to make blood donation coordination more accessible, organized, and reliable."
                            )}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button to="/become-donor" variant="primary" size="lg">
                                {t("about.becomeDonor", "Become a Donor")}
                                <ArrowRight size={17} />
                            </Button>
                            <Button
                                to="/contact"
                                variant="secondary"
                                size="lg"
                                className="gap-2 rounded-xl border border-border bg-card font-bold text-foreground shadow-sm hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                            >
                                {t("about.contact", "Contact Us")}
                            </Button>
                        </div>

                        <div className="mt-12 grid grid-cols-3 gap-5 border-t border-white/10 pt-6">
                            <div>
                                <strong className="block font-display text-[clamp(1.35rem,2.4vw,1.8rem)] font-extrabold tracking-tight text-white">24/7</strong>
                                <span className="mt-1 block text-[0.66rem] font-semibold tracking-wider text-white/50 uppercase">{t("about.statOnline", "Always online")}</span>
                            </div>
                            <div>
                                <strong className="block font-display text-[clamp(1.35rem,2.4vw,1.8rem)] font-extrabold tracking-tight text-white">100%</strong>
                                <span className="mt-1 block text-[0.66rem] font-semibold tracking-wider text-white/50 uppercase">{t("about.statVoluntary", "Voluntary donors")}</span>
                            </div>
                            <div>
                                <strong className="block font-display text-[clamp(1.35rem,2.4vw,1.8rem)] font-extrabold tracking-tight text-white">Tangail</strong>
                                <span className="mt-1 block text-[0.66rem] font-semibold tracking-wider text-white/50 uppercase">{t("about.statBase", "Based in Tangail")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div aria-hidden="true" className="pointer-events-none absolute -inset-6 -z-10 rounded-[3rem] bg-indigo-400/20 blur-3xl" />

                        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900 shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1000&q=85"
                                alt={t("about.imageAlt", "Blood donation")}
                                className="block aspect-[5/4] w-full object-cover"
                            />
                            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-indigo-950/50 via-transparent to-transparent" />
                        </div>

                        <div className="absolute inset-x-4 -bottom-8 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#0b1020]/85 p-4 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-6 sm:w-72">
                            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-lg">
                                <Droplet size={23} />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate font-display text-sm font-extrabold text-white">{t("about.everyDrop", "Every Drop Matters")}</p>
                                <p className="mt-0.5 text-xs text-white/60">{t("about.giveHope", "Give blood. Give hope.")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Manifesto ---------- */}
            <section className="about-manifesto border-y border-white/5 py-20 sm:py-24">
                <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
                    <span className="text-[0.65rem] font-extrabold tracking-[0.2em] text-indigo-300 uppercase">
                        {t("about.manifestoEyebrow", "What we believe")}
                    </span>
                    <p className="mt-6 font-heading text-2xl leading-[1.6] text-white/90 sm:text-4xl">
                        {t(
                            "about.manifesto",
                            "Blood donation isn't a transaction. It's a quiet promise between strangers — and we're here to make keeping it feel effortless."
                        )}
                    </p>
                    <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </div>
            </section>

            {/* ---------- Who we are ---------- */}
            <section className="py-20 sm:py-28">
                <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
                    <div className="about-reveal">
                        <SectionHeading
                            eyebrow={t("about.whoHeading", "Who We Are")}
                            title={t("about.whoTitle", "A Community Built Around Humanity")}
                            centered={false}
                        />
                        <p className="about-who-lead mt-7 pl-5 text-[clamp(1.15rem,1.8vw,1.5rem)] leading-relaxed text-foreground">
                            {t(
                                "about.whoText1",
                                "Finding a blood donor during an emergency can be stressful and time-sensitive. Blood Connect aims to simplify that process by creating a structured platform where people can find available donors and volunteers can coordinate blood requests."
                            )}
                        </p>
                    </div>

                    <div className="about-reveal">
                        <p className="text-base leading-8 text-muted-foreground">
                            {t(
                                "about.whoText2",
                                "We are starting our operations in Tangail, Bangladesh, with a vision to expand our support to more communities across the country."
                            )}
                        </p>

                        <div className="mt-8 grid gap-3">
                            {pillarItems.map(({ key, icon: Icon }) => (
                                <div
                                    key={key}
                                    className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-primary/[0.03] px-4 py-3.5 text-sm font-bold text-foreground transition duration-200 hover:translate-x-1 hover:border-primary/40"
                                >
                                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                                        <Icon size={17} />
                                    </span>
                                    {t(`about.${key}`)}
                                    <Check size={16} className="ml-auto shrink-0 text-success" aria-hidden="true" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Mission & vision ---------- */}
            <section className="border-y border-primary/10 bg-primary/[0.03] py-20 sm:py-28">
                <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        {missionItems.map(({ key, icon: Icon }, index) => (
                            <article
                                key={key}
                                className="about-mv-card relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-10"
                            >
                                <span className="about-mv-index absolute top-6 right-7 font-display text-5xl font-extrabold leading-none" aria-hidden="true">
                                    0{index + 1}
                                </span>
                                <IconBadge icon={Icon} />
                                <h3 className="relative mt-6 font-display text-2xl font-extrabold tracking-tight">
                                    {t(`about.${key}.title`)}
                                </h3>
                                <p className="relative mt-4 max-w-md leading-8 text-muted-foreground">
                                    {t(`about.${key}.text`)}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- Values ---------- */}
            <section className="py-20 sm:py-28">
                <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
                    <SectionHeading
                        eyebrow={t("about.guideHeading", "What Guides Us")}
                        title={t("about.valuesTitle", "Our Core Values")}
                        text={t("about.valuesText", "The principles that guide how we serve our community.")}
                    />

                    <div className="about-values-grid mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {valueItems.map(({ key, icon: Icon }, index) => (
                            <article
                                key={key}
                                className="about-value-card relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="relative flex items-start justify-between gap-4">
                                    <IconBadge icon={Icon} small />
                                    <span className="font-display text-3xl font-black leading-none text-primary/15">0{index + 1}</span>
                                </div>
                                <h3 className="relative mt-6 font-display text-lg font-extrabold tracking-tight">
                                    {t(`about.values.${key}.title`)}
                                </h3>
                                <p className="relative mt-3 text-sm leading-7 text-muted-foreground">
                                    {t(`about.values.${key}.text`)}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- How we work ---------- */}
            <section className="border-t border-primary/10 bg-primary/[0.03] py-20 sm:py-28">
                <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
                    <SectionHeading
                        eyebrow={t("about.approach", "Our Approach")}
                        title={t("about.howTitle", "How Blood Connect Works")}
                    />

                    <div className="about-steps-grid relative mt-12 grid gap-10 md:grid-cols-3">
                        <div aria-hidden="true" className="absolute top-8 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent md:block" />

                        {stepItems.map(({ number, key }) => (
                            <article className="about-step relative" key={number}>
                                <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover font-display text-xl font-black text-primary-foreground shadow-lg shadow-primary/25">
                                    {number}
                                </span>
                                <h3 className="mt-6 font-display text-xl font-extrabold tracking-tight">
                                    {t(`about.steps.${key}.title`)}
                                </h3>
                                <p className="mt-3 max-w-xs leading-7 text-muted-foreground">
                                    {t(`about.steps.${key}.text`)}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- CTA ---------- */}
            <section className="pt-16 pb-24">
                <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
                    <div className="about-cta rounded-[2rem] p-9 sm:p-12">
                        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                            <div className="max-w-2xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-white uppercase backdrop-blur">
                                    <Heart size={13} />
                                    {t("about.badge", "About Blood Connect")}
                                </span>
                                <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                                    {t("about.ctaTitle", "Be Part of Something Meaningful")}
                                </h2>
                                <p className="mt-3 leading-7 text-white/85">
                                    {t("about.ctaText", "Your willingness to donate blood can make a real difference. Join our community and help someone find hope.")}
                                </p>
                            </div>
                            <Button
                                to="/become-donor"
                                variant="ghost"
                                size="lg"
                                className="shrink-0 gap-2 rounded-xl bg-card font-extrabold text-primary-hover shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
                            >
                                {t("about.join", "Join Our Community")}
                                <ArrowRight size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div >
    );
};

export default About;
