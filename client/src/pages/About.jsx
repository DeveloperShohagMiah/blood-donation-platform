import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Droplet,
    Eye,
    HandHeart,
    Heart,
    MapPin,
    ShieldCheck,
    Target,
    Users,
} from "lucide-react";

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

const SectionHeading = ({ eyebrow, title, text, centered = true }) => (
    <div className={centered ? "mx-auto mb-12 max-w-2xl text-center" : "mb-10 max-w-2xl"}>
        <div className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
            <span className="eyebrow">{eyebrow}</span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-primary" />
        </div>
        <h2 className="font-display mt-4 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            {title}
        </h2>
        {text && <p className="mt-4 leading-7 text-muted-foreground">{text}</p>}
    </div>
);

const IconBadge = ({ icon: Icon, size = "lg" }) => (
    <span
        className={`grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/15 ${
            size === "lg" ? "size-14" : "size-11"
        }`}
    >
        <Icon size={size === "lg" ? 25 : 20} strokeWidth={2.1} />
    </span>
);

const About = () => {
    const { t } = useTranslation();

    return (
        <main className="overflow-hidden bg-background text-foreground">
            {/* Hero */}
            <section className="relative isolate overflow-hidden">
                <div aria-hidden="true" className="pointer-events-none absolute -top-48 -left-40 -z-10 size-[560px] rounded-full bg-primary/10 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-32 -z-10 size-[520px] rounded-full bg-success/10 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-background to-transparent" />

                <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:py-28">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold tracking-wide text-primary shadow-sm backdrop-blur">
                            <Heart size={14} className="fill-primary/20" />
                            {t("about.badge", "About Blood Connect")}
                        </span>

                        <h1 className="font-display mt-7 text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.05] font-extrabold tracking-[-0.055em]">
                            {t("about.heading1", "Connecting Hearts,")}
                            <span className="mt-1 block bg-gradient-to-r from-primary via-primary-hover to-brand-deep bg-clip-text text-transparent">
                                {t("about.heading2", "Saving Lives.")}
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                            {t(
                                "about.intro",
                                "Blood Connect is a community-focused blood donation initiative that connects voluntary blood donors with people who need blood. Our goal is to make blood donation coordination more accessible, organized, and reliable."
                            )}
                        </p>

                        <div className="mt-9 flex flex-wrap gap-3">
                            <Link to="/become-donor" className="btn-premium h-12 px-6 text-sm">
                                {t("about.becomeDonor", "Become a Donor")}
                                <ArrowRight size={17} />
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-bold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-md"
                            >
                                {t("about.contact", "Contact Us")}
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div aria-hidden="true" className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl" />
                        <div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-card shadow-2xl shadow-primary/10 ring-1 ring-background/60">
                            <img
                                src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1000&q=85"
                                alt={t("about.imageAlt", "Blood donation")}
                                className="aspect-[5/4] w-full object-cover"
                            />
                            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-brand-deep/25 via-transparent to-transparent" />
                        </div>

                        <div className="surface absolute -bottom-6 left-4 right-4 flex items-center gap-3 rounded-2xl p-4 sm:left-auto sm:right-6 sm:w-72">
                            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-lg shadow-primary/25">
                                <Droplet size={23} />
                            </span>
                            <div className="min-w-0">
                                <p className="font-display truncate text-sm font-extrabold text-foreground">
                                    {t("about.everyDrop", "Every Drop Matters")}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {t("about.giveHope", "Give blood. Give hope.")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who we are */}
            <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
                <SectionHeading
                    eyebrow={t("about.whoHeading", "Who We Are")}
                    title={t("about.whoTitle", "A Community Built Around Humanity")}
                />
                <div className="mx-auto max-w-3xl space-y-5 text-center">
                    <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                        {t(
                            "about.whoText1",
                            "Finding a blood donor during an emergency can be stressful and time-sensitive. Blood Connect aims to simplify that process by creating a structured platform where people can find available donors and volunteers can coordinate blood requests."
                        )}
                    </p>
                    <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                        {t(
                            "about.whoText2",
                            "We are starting our operations in Tangail, Bangladesh, with a vision to expand our support to more communities across the country."
                        )}
                    </p>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-3">
                    {[
                        { icon: MapPin, text: "Tangail, Bangladesh" },
                        { icon: ShieldCheck, text: "Volunteer verified" },
                        { icon: Heart, text: "Community driven" },
                    ].map(({ icon: Icon, text }) => (
                        <div
                            key={text}
                            className="flex items-center justify-center gap-2.5 rounded-2xl border border-primary/10 bg-primary/[0.03] px-4 py-4 text-sm font-bold text-foreground"
                        >
                            <Icon size={17} className="text-primary" />
                            {text}
                        </div>
                    ))}
                </div>
            </section>

            {/* Mission and Vision */}
            <section className="border-y border-primary/10 bg-primary/[0.03] py-20">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        {missionItems.map(({ key, icon: Icon }) => (
                            <article key={key} className="premium-card p-6 sm:p-8">
                                <IconBadge icon={Icon} />
                                <h3 className="font-display mt-6 text-2xl font-extrabold tracking-tight">
                                    {t(`about.${key}.title`)}
                                </h3>
                                <p className="mt-4 leading-8 text-muted-foreground">
                                    {t(`about.${key}.text`)}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
                <SectionHeading
                    eyebrow={t("about.guideHeading", "What Guides Us")}
                    title={t("about.valuesTitle", "Our Core Values")}
                    text={t("about.valuesText", "The principles that guide how we serve our community.")}
                />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {valueItems.map(({ key, icon: Icon }, index) => (
                        <article key={key} className="premium-card group p-5 sm:p-6">
                            <div className="flex items-start justify-between">
                                <IconBadge icon={Icon} size="sm" />
                                <span className="font-display text-3xl font-black text-primary/15">
                                    0{index + 1}
                                </span>
                            </div>
                            <h3 className="mt-6 font-display text-lg font-extrabold tracking-tight">
                                {t(`about.values.${key}.title`)}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                {t(`about.values.${key}.text`)}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            {/* How we work */}
            <section className="border-t border-primary/10 bg-primary/[0.03] py-20">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <SectionHeading
                        eyebrow={t("about.approach", "Our Approach")}
                        title={t("about.howTitle", "How Blood Connect Works")}
                    />
                    <div className="relative grid gap-6 md:grid-cols-3">
                        <div aria-hidden="true" className="absolute top-9 right-16 left-16 hidden h-px bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 md:block" />
                        {stepItems.map(({ number, key }) => (
                            <article key={number} className="premium-card relative p-6 sm:p-7">
                                <span className="font-display grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-xl font-black text-primary-foreground shadow-lg shadow-primary/25">
                                    {number}
                                </span>
                                <h3 className="font-display mt-6 text-xl font-extrabold tracking-tight">
                                    {t(`about.steps.${key}.title`)}
                                </h3>
                                <p className="mt-3 leading-7 text-muted-foreground">
                                    {t(`about.steps.${key}.text`)}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Community CTA */}
            <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
                <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-deep via-primary to-primary p-9 text-primary-foreground shadow-xl shadow-primary/20 sm:p-12">
                    <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full border-[26px] border-white/10" />
                    <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/4 size-72 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold tracking-wide uppercase backdrop-blur">
                                <Heart size={13} />
                                {t("about.badge", "About Blood Connect")}
                            </span>
                            <h2 className="font-display mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                {t("about.ctaTitle", "Be Part of Something Meaningful")}
                            </h2>
                            <p className="mt-3 leading-7 text-primary-foreground/85">
                                {t(
                                    "about.ctaText",
                                    "Your willingness to donate blood can make a real difference. Join our community and help someone find hope."
                                )}
                            </p>
                        </div>
                        <Link
                            to="/become-donor"
                            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-card px-6 text-sm font-extrabold text-primary-hover shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            {t("about.join", "Join Our Community")}
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default About;
