import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowRight,
    ArrowUpRight,
    BadgeCheck,
    CalendarClock,
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
 * Nothing is invented here: leave `stats` out and that block is hidden.
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
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#FFF7F6] via-white to-white py-12">
            {/* Local keyframes for the floating cards */}
            <style>{`
                @keyframes bc-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
                .bc-float { animation: bc-float 6s ease-in-out infinite }
                .bc-float-slow { animation: bc-float 8s ease-in-out -3s infinite }
                @media (prefers-reduced-motion: reduce) { .bc-float, .bc-float-slow { animation: none } }
            `}</style>

            {/* Background: dot grid + colour glows */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
                style={{
                    backgroundImage: "radial-gradient(#192623 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                    maskImage: "linear-gradient(to bottom, black 30%, transparent 85%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 85%)",
                }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute -top-48 -right-32 -z-10 size-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(230,75,90,0.2),transparent)]" />
            <div aria-hidden="true" className="pointer-events-none absolute top-40 -left-48 -z-10 size-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(47,107,82,0.1),transparent)]" />

            <div className="mx-auto w-[calc(100%-2rem)] max-w-[1280px] md:w-[calc(100%-4rem)]">
                <div className="grid items-center gap-14 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-24">
                    {/* ---------- Left ---------- */}
                    <div className="max-w-[620px]">
                        <p className="inline-flex items-center gap-2.5 rounded-full border border-white bg-white/80 py-1.5 pr-4 pl-2 text-[13px] font-semibold text-[#475650] shadow-[0_4px_16px_rgba(29,55,44,0.07)] backdrop-blur">
                            <span className="relative grid size-6 place-items-center rounded-full bg-[#FDEEF0]">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#C62838]/30 motion-reduce:animate-none" />
                                <span className="relative size-2 rounded-full bg-[#C62838]" />
                            </span>
                            {t("hero.badge", "Voluntary donors, ready to help")}
                        </p>

                        <h1 className="mt-6 text-[42px] leading-[1.04] font-extrabold tracking-tight text-[#14201C] sm:text-[54px] lg:text-[62px]">
                            {t("hero.title1", "Find a")}{" "}
                            <span className="bg-gradient-to-r from-[#DC2626] to-[#E11D48] bg-clip-text text-transparent">
                                {t("hero.titleAccent", "blood donor")}
                            </span>{" "}
                            {t("hero.title2", "before it’s too late.")}
                        </h1>

                        <p className="mt-6 max-w-[540px] text-base leading-relaxed text-[#5B6862] sm:text-lg">
                            {t(
                                "hero.subtitle",
                                "Search donors by blood group and location, or post a request and let people nearby respond. Fast, free and always voluntary."
                            )}
                        </p>

                        {/* Search card */}
                        <form
                            onSubmit={handleSearch}
                            className="mt-9 rounded-3xl border border-white bg-white/80 p-4 shadow-[0_30px_70px_rgba(29,55,44,0.12),0_2px_6px_rgba(29,55,44,0.04)] backdrop-blur-xl sm:p-5"
                        >
                            <fieldset>
                                <legend className="mb-3 flex w-full items-center justify-between text-sm font-bold text-[#14201C]">
                                    {t("hero.chooseGroup", "Blood group")}
                                    {group && (
                                        <button type="button" onClick={() => setGroup("")} className="text-xs font-semibold text-[#84918C] hover:text-[#C62838]">
                                            {t("hero.clear", "Clear")}
                                        </button>
                                    )}
                                </legend>

                                <div className="grid grid-cols-4 gap-2">
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
                                                        "grid h-12 place-items-center rounded-xl border text-[15px] font-extrabold select-none",
                                                        "transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[#C62838]/50",
                                                        selected
                                                            ? "border-transparent bg-gradient-to-br from-[#E64B5A] to-[#B91F32] text-white shadow-[0_8px_18px_rgba(198,40,56,0.3)]"
                                                            : "border-[#E9EEEB] bg-[#F8FAF9] text-[#33443D] hover:-translate-y-0.5 hover:border-[#F0BDC0] hover:bg-white hover:text-[#C62838]",
                                                    ].join(" ")}
                                                >
                                                    {item}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </fieldset>

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                <label className="relative flex-1">
                                    <span className="sr-only">{t("hero.locationLabel", "Location")}</span>
                                    <MapPin size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#84918C]" />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder={t("hero.locationPlaceholder", "City or district")}
                                        className="h-[52px] w-full rounded-xl border border-[#E9EEEB] bg-white pr-3 pl-10 text-[15px] text-[#14201C] outline-none transition placeholder:text-[#9AA6A1] focus:border-[#C62838] focus:ring-4 focus:ring-[#C62838]/10"
                                    />
                                </label>

                                <button
                                    type="submit"
                                    className="group inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#DC3545] to-[#B91F32] px-7 text-[15px] font-bold text-white shadow-[0_12px_26px_rgba(198,40,56,0.32),inset_0_1px_0_rgba(255,255,255,0.28)] outline-none transition hover:brightness-95 focus-visible:ring-4 focus-visible:ring-[#C62838]/30 active:scale-[0.98]"
                                >
                                    <Search size={18} strokeWidth={2.4} />
                                    {t("hero.search", "Find donors")}
                                    <ArrowRight size={16} strokeWidth={2.5} className="-ml-0.5 transition-transform group-hover:translate-x-0.5" />
                                </button>
                            </div>

                            <p className="mt-3.5 flex items-center gap-1.5 text-xs text-[#84918C]">
                                <ShieldCheck size={14} className="text-[#2F6B52]" />
                                {t("hero.note", "Results match your blood group and area. Donating is always free.")}
                            </p>
                        </form>

                        {/* Secondary actions */}
                        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
                            <Link to="/become-donor" className="group inline-flex items-center gap-1.5 font-bold text-[#C62838] hover:text-[#A91F30]">
                                {t("hero.becomeDonor", "Become a donor")}
                                <ArrowUpRight size={16} strokeWidth={2.4} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                            <Link to="/blood-requests" className="font-semibold text-[#475650] underline-offset-4 hover:text-[#14201C] hover:underline">
                                {t("hero.viewRequests", "See open blood requests")}
                            </Link>
                        </div>

                        {/* Optional real stats */}
                        {statItems.length > 0 && (
                            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-[#E9EEEB] pt-7">
                                {statItems.map((s) => (
                                    <div key={s.label} className="flex flex-col-reverse">
                                        <dt className="text-sm text-[#66736E]">{s.label}</dt>
                                        <dd className="text-3xl font-extrabold tracking-tight text-[#14201C]">{s.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </div>

                    {/* ---------- Right: layered visual (decorative sample content) ---------- */}
                    <div aria-hidden="true" className="relative mx-auto hidden h-[540px] w-full max-w-[540px] lg:block">
                        {/* Rings */}
                        <div className="absolute top-1/2 left-1/2 size-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#F3C9CD]/70" />
                        <div className="absolute top-1/2 left-1/2 size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#F3C9CD]" />

                        {/* Droplet */}
                        <svg viewBox="0 0 200 240" className="absolute top-1/2 left-1/2 w-[250px] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_30px_40px_rgba(185,31,50,0.35)]">
                            <defs>
                                <linearGradient id="bc-drop" x1="0.2" y1="0" x2="0.8" y2="1">
                                    <stop offset="0" stopColor="#F26A77" />
                                    <stop offset="0.55" stopColor="#DC2638" />
                                    <stop offset="1" stopColor="#A31527" />
                                </linearGradient>
                                <linearGradient id="bc-shine" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
                                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d="M100 8C100 8 28 94 28 148a72 72 0 0 0 144 0C172 94 100 8 100 8Z" fill="url(#bc-drop)" />
                            <path d="M62 150c0-30 18-58 38-84-6 30-4 60 6 82-14 18-30 18-44 2Z" fill="url(#bc-shine)" opacity="0.7" />
                            <ellipse cx="136" cy="176" rx="14" ry="22" fill="#fff" opacity="0.12" transform="rotate(25 136 176)" />
                        </svg>

                        {/* Urgent request card */}
                        <div className="bc-float absolute top-2 right-0 w-[290px] rounded-3xl border border-white bg-white/85 p-5 shadow-[0_30px_70px_rgba(29,55,44,0.16)] backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDEEF0] px-2.5 py-1 text-[11px] font-bold text-[#C62838]">
                                    <span className="size-1.5 rounded-full bg-[#C62838]" />
                                    {t("hero.sampleUrgent", "Urgent request")}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#84918C]">
                                    <Clock size={12} />
                                    {t("hero.sampleTime", "12 min ago")}
                                </span>
                            </div>
                            <div className="mt-4 flex items-center gap-3.5">
                                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#E64B5A] to-[#B91F32] text-xl font-extrabold text-white shadow-[0_8px_16px_rgba(198,40,56,0.3)]">O-</span>
                                <div>
                                    <p className="text-[15px] font-bold text-[#14201C]">{t("hero.sampleUnits", "2 units needed today")}</p>
                                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#66736E]">
                                        <MapPin size={12} />
                                        {t("hero.sampleHospital", "City General Hospital")}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#F1F5F3]">
                                <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#E64B5A] to-[#C62838]" />
                            </div>
                            <p className="mt-2 text-[11px] font-medium text-[#66736E]">{t("hero.sampleProgress", "1 of 2 donors confirmed")}</p>
                        </div>

                        {/* Donor match card */}
                        <div className="bc-float-slow absolute bottom-10 left-0 flex w-[280px] items-center gap-3 rounded-2xl border border-white bg-white/85 p-4 shadow-[0_24px_54px_rgba(29,55,44,0.15)] backdrop-blur-xl">
                            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#E8F3EE] text-sm font-bold text-[#2F6B52]">RA</span>
                            <div className="min-w-0 flex-1">
                                <p className="flex items-center gap-1 text-sm font-bold text-[#14201C]">
                                    {t("hero.sampleDonor", "Rafi A.")}
                                    <BadgeCheck size={15} className="text-[#2F6B52]" />
                                </p>
                                <p className="text-xs text-[#66736E]">{t("hero.sampleDonorMeta", "Available now · 2 km away")}</p>
                            </div>
                            <span className="rounded-lg bg-[#FDEEF0] px-2.5 py-1 text-sm font-extrabold text-[#C62838]">O-</span>
                        </div>

                        {/* Impact pill */}
                        <div className="bc-float absolute right-6 bottom-2 flex items-center gap-2.5 rounded-full bg-[#14201C] py-2.5 pr-5 pl-3 text-white shadow-[0_18px_40px_rgba(20,32,28,0.35)]">
                            <span className="grid size-8 place-items-center rounded-full bg-white/10 text-[#F6B9BF]">
                                <HeartPulse size={16} />
                            </span>
                            <span className="text-[13px] font-semibold">{t("hero.impact", "1 donation can help up to 3 people")}</span>
                        </div>
                    </div>
                </div>

                {/* ---------- Info strip ---------- */}
                <ul className="mb-14 grid gap-px overflow-hidden rounded-3xl border border-[#E9EEEB] bg-[#E9EEEB] shadow-[0_20px_50px_rgba(29,55,44,0.07)] sm:grid-cols-2 lg:mb-20 lg:grid-cols-4">
                    {facts.map(({ icon: Icon, title, text }) => (
                        <li key={title} className="flex gap-4 bg-white p-6">
                            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#FDEEF0] text-[#C62838]">
                                <Icon size={20} strokeWidth={2.1} />
                            </span>
                            <div>
                                <h3 className="text-[15px] font-bold text-[#14201C]">{title}</h3>
                                <p className="mt-1 text-[13.5px] leading-relaxed text-[#66736E]">{text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default Hero;