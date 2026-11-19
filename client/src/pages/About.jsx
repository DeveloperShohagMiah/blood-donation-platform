import { useTranslation } from "react-i18next";
import {
    Heart,
    Target,
    Eye,
    Users,
    ShieldCheck,
    Droplet,
    ArrowRight,
    HandHeart,
} from "lucide-react";
import { Link } from "react-router-dom";

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

const About = () => {
    const { t } = useTranslation();

    return (
        <main className="overflow-hidden bg-background text-foreground">
            {/* Hero */}
            <section className="relative isolate">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-red-50 via-background to-rose-100/60 dark:from-red-950/20 dark:via-background dark:to-rose-950/10" />

                <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                            <Heart size={15} />
                            {t("about.badge", "About Blood Connect")}
                        </span>

                        <h1 className="mt-7 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            {t("about.heading1", "Connecting Hearts,")}
                            <span className="block text-primary">
                                {t("about.heading2", "Saving Lives.")}
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                            {t(
                                "about.intro",
                                "Blood Connect is a community-focused blood donation initiative that connects voluntary blood donors with people who need blood. Our goal is to make blood donation coordination more accessible, organized, and reliable."
                            )}
                        </p>

                        <div className="mt-9 flex flex-wrap gap-4">
                            <Link
                                to="/become-donor"
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
                            >
                                {t("about.becomeDonor", "Become a Donor")}
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                to="/contact"
                                className="rounded-xl border border-border bg-background px-6 py-3.5 font-semibold transition hover:bg-muted"
                            >
                                {t("about.contact", "Contact Us")}
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 rounded-[2rem] bg-red-500/10 blur-2xl" />
                        <img
                            src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1000&q=85"
                            alt={t("about.imageAlt", "Blood donation")}
                            className="relative aspect-[5/4] w-full rounded-[2rem] object-cover shadow-2xl"
                        />

                        <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-white/60 bg-muted/50/95 p-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-zinc-900/95 sm:left-auto sm:right-5 sm:w-64">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                                    <Droplet size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-900 dark:text-white">
                                        {t("about.everyDrop", "Every Drop Matters")}
                                    </p>
                                    <p className="text-sm text-zinc-500">
                                        {t("about.giveHope", "Give blood. Give hope.")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Introduction */}
            <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                        {t("about.whoHeading", "Who We Are")}
                    </span>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        {t("about.whoTitle", "A Community Built Around Humanity")}
                    </h2>
                    <p className="mt-6 text-base leading-8 text-muted-foreground">
                        {t(
                            "about.whoText1",
                            "Finding a blood donor during an emergency can be stressful and time-sensitive. Blood Connect aims to simplify that process by creating a structured platform where people can find available donors and volunteers can coordinate blood requests."
                        )}
                    </p>
                    <p className="mt-4 text-base leading-8 text-muted-foreground">
                        {t(
                            "about.whoText2",
                            "We are starting our operations in Tangail, Bangladesh, with a vision to expand our support to more communities across the country."
                        )}
                    </p>
                </div>
            </section>

            {/* Mission and Vision */}
            <section className="bg-primary/3 py-20">
                <div className="mx-auto grid max-w-7xl gap-7 px-5 sm:px-8 md:grid-cols-2">
                    {missionItems.map(({ key, icon: Icon }) => (
                        <div
                            key={key}
                            className="rounded-2xl bg-linear-to-b from-primary/1 to-white p-5 border border-primary/10 shadow-xs hover:shadow-md transition-shadow sm:p-6"
                        >
                            <div className="mb-6 inline-flex rounded-2xl bg-primary/5 p-4 text-primary dark:bg-primary/20">
                                <Icon />
                            </div>
                            <h3 className="text-2xl font-bold">{t(`about.${key}.title`)}</h3>
                            <p className="mt-4 leading-8 text-muted-foreground">
                                {t(`about.${key}.text`)}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Values */}
            <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                        {t("about.guideHeading", "What Guides Us")}
                    </span>
                    <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                        {t("about.valuesTitle", "Our Core Values")}
                    </h2>
                    <p className="mt-4 leading-7 text-muted-foreground">
                        {t("about.valuesText", "The principles that guide how we serve our community.")}
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {valueItems.map(({ key, icon: Icon }) => (
                        <div
                            key={key}
                            className="rounded-2xl bg-linear-to-b from-primary/2 to-white p-5 border border-primary/10 shadow-xs hover:shadow-md transition-shadow sm:p-6"
                        >
                            <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                                <Icon />
                            </div>
                            <h3 className="text-lg font-bold">{t(`about.values.${key}.title`)}</h3>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                {t(`about.values.${key}.text`)}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Community CTA */}
            <section className="bg-primary/3">
                <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
                    <div className="flex flex-col items-start gap-6 rounded-3xl bg-primary p-8 text-white sm:p-12 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold">
                                {t("about.ctaTitle", "Be Part of Something Meaningful")}
                            </h2>
                            <p className="mt-3 max-w-2xl leading-7 text-red-100">
                                {t(
                                    "about.ctaText",
                                    "Your willingness to donate blood can make a real difference. Join our community and help someone find hope."
                                )}
                            </p>
                        </div>

                        <Link
                            to="/become-donor"
                            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold text-primary transition"
                        >
                            {t("about.join", "Join Our Community")}
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* How we work */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                            {t("about.approach", "Our Approach")}
                        </span>
                        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                            {t("about.howTitle", "How Blood Connect Works")}
                        </h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {stepItems.map(({ number, key }) => (
                            <div
                                key={number}
                                className="flex flex-col justify-between rounded-2xl bg-linear-to-b from-primary/2 to-white p-5 border border-primary/10 shadow-xs hover:shadow-md transition-shadow sm:p-6"
                            >
                                <span className="text-4xl font-black text-primary/20">{number}</span>
                                <h3 className="mt-5 text-xl font-bold">{t(`about.steps.${key}.title`)}</h3>
                                <p className="mt-3 leading-7 text-muted-foreground">
                                    {t(`about.steps.${key}.text`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default About;
