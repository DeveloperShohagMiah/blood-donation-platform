import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowUpRight,
    CalendarClock,
    CheckCircle2,
    Clock,
    Droplets,
    HeartPulse,
    MapPin,
    Search,
    ShieldCheck,
} from "lucide-react";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

/*
 * Optional real numbers, shown only if you pass them:
 * <Hero stats={{ donors: "12,400", fulfilled: "3,200", districts: "64" }} />
 */
const Hero = ({ stats }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [group, setGroup] = useState("");
    const [location, setLocation] = useState("");

    const handleSearch = (event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (group) params.set("group", group);
        if (location.trim()) params.set("location", location.trim());
        const query = params.toString();
        navigate(query ? `/donors?${query}` : "/donors");
    };

    const facts = [
        {
            icon: Droplets,
            title: t("hero.fact1.title", "O- is the universal donor"),
            text: t("hero.fact1.text", "Its red cells can be given to any blood group in an emergency."),
        },
        {
            icon: Clock,
            title: t("hero.fact2.title", "About 10 minutes"),
            text: t("hero.fact2.text", "The donation itself is quick. Plan about an hour in total."),
        },
        {
            icon: HeartPulse,
            title: t("hero.fact3.title", "Up to 3 lives"),
            text: t("hero.fact3.text", "One donation is separated into red cells, plasma and platelets."),
        },
        {
            icon: CalendarClock,
            title: t("hero.fact4.title", "Every 3 to 4 months"),
            text: t("hero.fact4.text", "The usual safe gap between whole-blood donations."),
        },
    ];

    const statItems = stats
        ? [
            stats.donors && { value: stats.donors, label: t("hero.stat.donors", "Registered donors") },
            stats.fulfilled && { value: stats.fulfilled, label: t("hero.stat.fulfilled", "Requests fulfilled") },
            stats.districts && { value: stats.districts, label: t("hero.stat.districts", "Districts covered") },
        ].filter(Boolean)
        : [];

    return (
        <section className="relative isolate overflow-hidden bg-card pb-30">
            {/* Ambient gradient field */}
            <div aria-hidden="true" className="pointer-events-none absolute -top-56 -left-40 -z-10 size-[620px] rounded-full bg-primary/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-24 -z-10 size-[560px] rounded-full bg-success/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-card to-transparent" />

            <div className="mx-auto w-[calc(100%-2rem)] max-w-[1280px] md:w-[calc(100%-4rem)]">
                <div className="grid items-center gap-14 pt-14 pb-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pt-20">
                    {/* ---------- Copy + search ---------- */}
                    <div>
                        <span className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 py-1.5 pr-4 pl-3 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex size-full rounded-full bg-primary/60 motion-safe:animate-ping" />
                                <span className="relative inline-flex size-2 rounded-full bg-primary" />
                            </span>
                            {t("hero.badge", "Voluntary donors, ready to help")}
                        </span>

                        <h1 className="font-display mt-7 font-extrabold text-balance text-foreground">
                            <span className="block">{t("hero.title1", "Connecting Donors")}</span>
                            <span className="mt-1 block bg-gradient-to-r from-primary via-primary-hover to-brand-deep bg-clip-text text-transparent">
                                {t("hero.titleAccent", "Saving Lives")}
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-md">
                            {t(
                                "hero.subtitle",
                                "Search donors by blood group and location, or post a request and let people nearby respond. Fast, free and always voluntary."
                            )}
                        </p>

                        {/* Search panel */}
                        <form
                            onSubmit={handleSearch}
                            className="surface mt-9 rounded-[2rem] p-4 sm:p-5"
                        >
                            <fieldset>
                                <legend className="mb-3 flex w-full items-center justify-between text-sm font-bold text-foreground">
                                    {t("hero.chooseGroup", "Blood group")}
                                    {group && (
                                        <button
                                            type="button"
                                            onClick={() => setGroup("")}
                                            className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            {t("hero.clear", "Clear")}
                                        </button>
                                    )}
                                </legend>
                                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                                    {bloodGroups.map((item) => {
                                        const selected = group === item;
                                        return (
                                            <label key={item} className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="bloodGroup"
                                                    value={item}
                                                    checked={selected}
                                                    onChange={() => setGroup(item)}
                                                    className="peer sr-only"
                                                />
                                                <span
                                                    className={[
                                                        "grid h-12 place-items-center rounded-2xl border text-[15px] font-extrabold select-none",
                                                        "transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2",
                                                        selected
                                                            ? "border-transparent bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-lg shadow-primary/30"
                                                            : "border-border bg-background text-foreground hover:border-primary/40 hover:text-primary",
                                                    ].join(" ")}
                                                >
                                                    {item}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </fieldset>

                            <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border bg-background p-1.5 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 sm:flex-row sm:items-center sm:rounded-full">
                                <label className="relative flex-1">
                                    <span className="sr-only">{t("hero.locationLabel", "Location")}</span>
                                    <MapPin size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder={t("hero.locationPlaceholder", "City or district")}
                                        className="h-12 w-full rounded-full bg-transparent pr-3 pl-11 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                                    />
                                </label>
                                <button type="submit" className="btn-premium h-12 rounded-full px-8 text-[15px]">
                                    <Search size={17} strokeWidth={2.4} />
                                    {t("hero.search", "Find donors")}
                                </button>
                            </div>
                        </form>

                        <p className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ShieldCheck size={14} className="text-success-deep" />
                            {t("hero.note", "Results match your blood group and area. Donating is always free.")}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                            <Link to="/become-donor" className="group inline-flex items-center gap-1.5 font-bold text-primary transition-colors hover:text-primary-hover">
                                {t("hero.becomeDonor", "Become a donor")}
                                <ArrowUpRight size={16} strokeWidth={2.4} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                            <Link to="/blood-requests" className="font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
                                {t("hero.viewRequests", "See open blood requests")}
                            </Link>
                        </div>
                    </div>

                    {/* ---------- Visual ---------- */}
                    <div className="relative mx-auto hidden w-full max-w-lg lg:block">
                        <div aria-hidden="true" className="pointer-events-none absolute inset-8 rounded-full bg-primary/10 blur-3xl" />
                        <div className="relative aspect-square">
                            <div aria-hidden="true" className="absolute inset-4 rounded-full border border-primary/10" />
                            <div aria-hidden="true" className="absolute inset-14 rounded-full border border-primary/15" />
                            <div aria-hidden="true" className="absolute inset-24 rounded-full border border-primary/20" />

                            <div className="absolute inset-0 grid place-items-center">
                                <div className="grid size-44 place-items-center rounded-[2.5rem] bg-gradient-to-br from-primary via-primary-hover to-brand-deep text-primary-foreground shadow-2xl shadow-primary/30 ring-1 ring-white/25">
                                    <Droplets size={84} strokeWidth={1.6} fill="var(--primary-foreground)" fillOpacity="0.14" />
                                </div>
                            </div>

                            <div className="surface absolute top-8 left-0 flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-lg">
                                <span className="grid size-9 place-items-center rounded-xl bg-success/10 text-success-deep">
                                    <ShieldCheck size={18} />
                                </span>
                                <div>
                                    <p className="text-xs font-extrabold text-foreground">{t("hero.visualVerified", "Verified donors")}</p>
                                    <p className="text-[11px] text-muted-foreground">{t("hero.visualVerifiedText", "Community checked profiles")}</p>
                                </div>
                            </div>

                            <div className="surface absolute right-0 bottom-16 flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-lg">
                                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                                    <CheckCircle2 size={18} />
                                </span>
                                <div>
                                    <p className="text-xs font-extrabold text-foreground">{t("hero.visualFree", "Always free")}</p>
                                    <p className="text-[11px] text-muted-foreground">{t("hero.visualFreeText", "Voluntary, never paid")}</p>
                                </div>
                            </div>

                            {["A+", "O-", "B+", "AB+"].map((groupBadge, index) => (
                                <span
                                    key={groupBadge}
                                    className={`absolute grid size-12 place-items-center rounded-2xl border border-border bg-card text-sm font-extrabold text-primary shadow-md ${index === 0 ? "top-1/4 right-2" : ""
                                        } ${index === 1 ? "bottom-6 left-10" : ""} ${index === 2 ? "top-6 left-1/3" : ""} ${index === 3 ? "right-6 bottom-1/4" : ""}`}
                                >
                                    {groupBadge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Optional real stats */}
                {statItems.length > 0 && (
                    <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-3 divide-x divide-border">
                        {statItems.map((s) => (
                            <div key={s.label} className="flex flex-col-reverse px-4 text-center">
                                <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
                                <dd className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{s.value}</dd>
                            </div>
                        ))}
                    </dl>
                )}

                {/* ---------- Facts ---------- */}
                {/* <ul className=" mb-14 grid gap-4 border-t border-border sm:grid-cols-2 py-5 overflow-hidden lg:mb-20 lg:grid-cols-4">
                    {facts.map(({ icon: Icon, title, text }, index) => (
                        <li key={title} className="premium-card p-5">
                            <div className="flex items-center justify-between">
                                <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/15">
                                    <Icon size={20} strokeWidth={2.1} />
                                </span>
                                <span className="font-display text-2xl font-black text-primary/15">0{index + 1}</span>
                            </div>
                            <h3 className="font-display mt-5 text-[15px] font-extrabold text-foreground">{title}</h3>
                            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{text}</p>
                        </li>
                    ))}
                </ul> */}
            </div>
        </section>
    );
};

export default Hero;
