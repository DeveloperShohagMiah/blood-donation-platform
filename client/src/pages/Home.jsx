import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    Ban,
    CalendarDays,
    Camera,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Clock,
    Coffee,
    Droplets,
    HandCoins,
    Heart,
    Images,
    Maximize2,
    MapPin,
    Megaphone,
    Phone,
    ShieldCheck,
    Siren,
    Stethoscope,
    X,
} from "lucide-react";
import Hero from "../components/Hero";
import SectionHeader from "../components/SectionHeader";
import DonorShowcase from "../components/Donorshowcase";
import { apiFetch } from "../utils/api";

const container =
    "mx-auto w-[calc(100%-2rem)] max-w-[1280px] md:w-[calc(100%-4rem)]";

/* Map the public API response to the shape the emergency cards expect. */
const mapPublicRequest = (item) => {
    const urgencyByStatus = {
        verified: "normal",
        matching: "urgent",
        in_progress: "critical",
    };
    const minutes = Math.max(
        1,
        Math.round((Date.now() - new Date(item.createdAt).getTime()) / 60000)
    );
    const time =
        minutes < 60
            ? `${minutes} min ago`
            : minutes < 1440
                ? `${Math.floor(minutes / 60)} hr ago`
                : `${Math.floor(minutes / 1440)} d ago`;

    return {
        id: item._id,
        group: item.bloodGroup,
        patientName: item.patientName,
        units: item.units,
        got: item.unitsFulfilled || 0,
        hospital: item.hospitalName,
        place: item.district?.nameEn || item.upazila?.nameEn || "",
        time,
        contactPerson: item.contactName || "",
        phone: item.contactPhone || "",
        verified: Boolean(item.isVerified),
        urgency: ["critical", "urgent", "normal"].includes(item.urgency)
            ? item.urgency
            : urgencyByStatus[item.status] || "normal",
    };
};

/* Leave src empty to show a placeholder tile */
const galleryItems = [
    { id: 1, src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", caption: "Community blood drive, Dhaka", tall: true },
    { id: 2, src: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", caption: "Volunteers preparing donor kits" },
    { id: 3, src: "https://plus.unsplash.com/premium_photo-1733306621909-1d63c088a93e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", caption: "First-time donors with certificates" },
    { id: 4, src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", caption: "University donation camp", tall: true },
    { id: 5, src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", caption: "Thank-you day for regular donors" },
    { id: 6, src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D", caption: "Health check before donating" },
];

/* Urgency styling. Values are matched case-insensitively. */
const urgencyStyles = {
    critical: {
        rank: 0,
        dot: "bg-rose-500",
        pill: "bg-rose-50 text-rose-700 ring-rose-200",
        bar: "bg-rose-500",
        card: "ring-1 ring-rose-200/80",
        pulse: true,
    },
    urgent: {
        rank: 1,
        dot: "bg-amber-500",
        pill: "bg-amber-50 text-amber-800 ring-amber-200",
        bar: "bg-amber-500",
        card: "",
        pulse: false,
    },
    normal: {
        rank: 2,
        dot: "bg-emerald-500",
        pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        bar: "bg-emerald-500",
        card: "",
        pulse: false,
    },
};
const levelOf = (value) => {
    const key = String(value || "normal").toLowerCase();
    return urgencyStyles[key] ? key : "normal";
};

/* Defined outside Home so images don't remount on every state change */
const Tile = ({ item, className = "" }) =>
    item.src ? (
        <img src={item.src} alt={item.caption} loading="lazy" className={`size-full object-cover ${className}`} />
    ) : (
        <div className={`grid size-full place-items-center bg-linear-to-br from-primary/10 via-primary/3 to-emerald-50 ${className}`}>
            <Camera size={28} className="text-primary/40" aria-hidden="true" />
        </div>
    );

const Home = () => {
    const { t } = useTranslation();

    /* ---------------- Emergency requests ---------------- */
    const [urgencyFilter, setUrgencyFilter] = useState("all");
    const [emergencies, setEmergencies] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [requestsError, setRequestsError] = useState("");
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        let active = true;
        apiFetch("/blood-requests/public")
            .then((data) => {
                if (active) setEmergencies((data?.items || []).map(mapPublicRequest));
            })
            .catch((error) => {
                if (active) setRequestsError(error.message);
            })
            .finally(() => {
                if (active) setRequestsLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        apiFetch("/campaigns")
            .then((data) => {
                if (active) setCampaigns(data?.items || []);
            })
            .catch(() => {
                // Campaigns are optional on the home page.
            });
        return () => {
            active = false;
        };
    }, []);

    const counts = useMemo(() => {
        const c = { all: emergencies.length, critical: 0, urgent: 0, normal: 0 };
        emergencies.forEach((r) => (c[levelOf(r.urgency)] += 1));
        return c;
    }, [emergencies]);

    const visibleRequests = useMemo(
        () =>
            emergencies
                .filter((r) => urgencyFilter === "all" || levelOf(r.urgency) === urgencyFilter)
                .sort((a, b) => urgencyStyles[levelOf(a.urgency)].rank - urgencyStyles[levelOf(b.urgency)].rank),
        [urgencyFilter, emergencies]
    );

    const urgencyTabs = [
        { key: "all", label: t("home.emergency.all", "All") },
        { key: "critical", label: t("home.emergency.critical", "Critical") },
        { key: "urgent", label: t("home.emergency.urgent", "Urgent") },
        { key: "normal", label: t("home.emergency.normal", "Normal") },
    ];

    /* ---------------- Tips tabs ---------------- */
    const [tab, setTab] = useState("before");
    const tipTabs = [
        {
            key: "before",
            icon: ClipboardCheck,
            label: t("home.tips.before", "Before"),
            hint: t("home.tips.beforeHint", "Get ready"),
            items: [
                t("home.tips.b1", "Drink an extra 500 ml of water in the hour before you donate."),
                t("home.tips.b2", "Eat a normal meal with iron-rich food such as meat, lentils or spinach."),
                t("home.tips.b3", "Sleep well the night before and avoid alcohol for 24 hours."),
                t("home.tips.b4", "Carry a valid ID and a list of any medicines you take."),
            ],
        },
        {
            key: "during",
            icon: Droplets,
            label: t("home.tips.during", "During"),
            hint: t("home.tips.duringHint", "At the centre"),
            items: [
                t("home.tips.d1", "A whole-blood donation itself takes around 10 minutes."),
                t("home.tips.d2", "Relax, breathe normally and look away if needles bother you."),
                t("home.tips.d3", "Tell the staff at once if you feel dizzy, cold or unwell."),
                t("home.tips.d4", "Keep your arm still and squeeze the ball if you’re asked to."),
            ],
        },
        {
            key: "after",
            icon: Coffee,
            label: t("home.tips.after", "After"),
            hint: t("home.tips.afterHint", "Recover"),
            items: [
                t("home.tips.a1", "Rest for 10 to 15 minutes and have a snack and a drink before leaving."),
                t("home.tips.a2", "Drink more fluids than usual for the next day."),
                t("home.tips.a3", "Skip heavy lifting and hard exercise for the rest of the day."),
                t("home.tips.a4", "Keep the bandage on for several hours. Lie down if you feel faint."),
            ],
        },
    ];
    const activeTips = tipTabs.find((x) => x.key === tab);

    const onTabKeyDown = (e) => {
        const i = tipTabs.findIndex((x) => x.key === tab);
        let next = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % tipTabs.length;
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + tipTabs.length) % tipTabs.length;
        if (next === null) return;
        e.preventDefault();
        setTab(tipTabs[next].key);
        document.getElementById(`tab-${tipTabs[next].key}`)?.focus();
    };

    /* ---------------- Safety content ---------------- */
    const safetyRules = [
        {
            icon: HandCoins,
            title: t("home.safety.r1", "Never pay for blood"),
            text: t("home.safety.r1t", "Blood donation is voluntary. If someone asks for money, do not continue and report the profile."),
        },
        {
            icon: MapPin,
            title: t("home.safety.r2", "Meet at a hospital or blood bank"),
            text: t("home.safety.r2t", "Donate only at a medical facility. Avoid meeting in private places."),
        },
        {
            icon: BadgeCheck,
            title: t("home.safety.r3", "Confirm the request first"),
            text: t("home.safety.r3t", "Call the hospital to check the patient and blood group before you travel."),
        },
        {
            icon: Ban,
            title: t("home.safety.r4", "Share only what’s needed"),
            text: t("home.safety.r4t", "Give your phone number to the requester only. Never share bank or card details."),
        },
    ];
    const [featuredRule, ...otherRules] = safetyRules;
    const FeaturedIcon = featuredRule.icon;

    const notDonateIf = [
        t("home.safety.n1", "You have a fever, cold or infection"),
        t("home.safety.n2", "You donated whole blood in the last 3 to 4 months"),
        t("home.safety.n3", "You had surgery, a tattoo or piercing recently"),
        t("home.safety.n4", "You are pregnant or breastfeeding"),
        t("home.safety.n5", "You take medicines that your doctor says affect donation"),
    ];

    /* ---------------- Gallery lightbox ---------------- */
    const [lightbox, setLightbox] = useState(null);
    useEffect(() => {
        if (lightbox === null) return;
        const onKey = (e) => {
            if (e.key === "Escape") setLightbox(null);
            if (e.key === "ArrowRight") setLightbox((i) => (i + 1) % galleryItems.length);
            if (e.key === "ArrowLeft") setLightbox((i) => (i - 1 + galleryItems.length) % galleryItems.length);
        };
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [lightbox]);

    const glassBtn =
        "grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none";

    return (
        <main>
            <Hero />

            <DonorShowcase />

            {/* 2. Emergency requests */}
            <section
                aria-labelledby="emergency-heading"
                className="relative overflow-hidden border-t border-primary/10 bg-primary/3 py-16 md:py-24"
            >
                <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(220,38,38,0.08),transparent)]" />

                <div className={`${container} relative`}>
                    <SectionHeader
                        id="emergency-heading"
                        tone="dark"
                        title={t("home.emergency.title", "Emergency blood requests")}
                        subtitle={t(
                            "home.emergency.subtitle",
                            "Real requests from people nearby. Verified requests show contact details; pending ones are awaiting volunteer review."
                        )}
                        label="Emergency requests"
                        icon={<Siren size={14} />}
                    />

                    {/* Filter tabs */}
                    <div role="group" aria-label={t("home.emergency.filter", "Filter by urgency")} className="mt-8 flex flex-wrap gap-2">
                        {urgencyTabs.map((f) => {
                            const active = urgencyFilter === f.key;
                            return (
                                <button
                                    key={f.key}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => setUrgencyFilter(f.key)}
                                    className={[
                                        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold outline-none transition-all",
                                        "focus-visible:ring-2 focus-visible:ring-primary/50",
                                        active
                                            ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                                            : "border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
                                    ].join(" ")}
                                >
                                    {f.label}
                                    <span className={`grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold ${active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                                        {counts[f.key]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {requestsError && (
                        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Requests could not be loaded right now ({requestsError}).
                        </p>
                    )}

                    {requestsLoading ? (
                        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
                            ))}
                        </div>
                    ) : visibleRequests.length > 0 ? (
                        <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            {visibleRequests.map((r) => {
                                const level = levelOf(r.urgency);
                                const s = urgencyStyles[level];
                                const segmented = r.units <= 8;
                                return (
                                    <li
                                        key={r.id}
                                        className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${s.card}`}
                                    >
                                        <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${s.bar}`} />

                                        <div className="flex items-start justify-between gap-2">
                                            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-primary to-primary/80 text-xl font-extrabold text-white shadow-lg shadow-primary/30">
                                                {r.group}
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${s.pill}`}>
                                                <span className="relative flex size-2">
                                                    {s.pulse && <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none ${s.dot}`} />}
                                                    <span className={`relative size-2 rounded-full ${s.dot}`} />
                                                </span>
                                                {t(`home.emergency.${level}`, level)}
                                            </span>
                                        </div>

                                        <h3 className="mt-4 text-[17px] leading-snug font-bold text-foreground">{r.hospital}</h3>
                                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                                            <span className="inline-flex items-center gap-1"><MapPin size={13} />{r.place}</span>
                                            <span className="inline-flex items-center gap-1"><Clock size={13} />{r.time}</span>
                                        </p>

                                        <div className="mt-4 rounded-xl border-l-2 border-primary bg-primary/5 px-3.5 py-2.5">
                                            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                {t("home.emergency.patient", "Patient")}
                                            </p>
                                            <p className="text-sm font-bold text-primary">{r.patientName}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {r.verified
                                                    ? `${t("home.emergency.contact", "Contact")}: ${r.contactPerson}`
                                                    : t("home.emergency.pending", "Awaiting volunteer verification")}
                                            </p>
                                        </div>

                                        {/* Progress */}
                                        <div className="mt-5">
                                            <div className="flex items-center justify-between text-[13px] font-semibold">
                                                <span className="inline-flex items-center gap-1.5 text-foreground">
                                                    <Droplets size={14} className="text-primary" />
                                                    {t("home.emergency.units", "{{count}} units needed", { count: r.units })}
                                                </span>
                                                <span className="text-muted-foreground">{r.got}/{r.units}</span>
                                            </div>

                                            {segmented ? (
                                                <div className="mt-2.5 flex gap-1.5" role="img" aria-label={`${r.got} of ${r.units}`}>
                                                    {Array.from({ length: r.units }).map((_, i) => (
                                                        <span key={i} className={`h-2 flex-1 rounded-full ${i < r.got ? "bg-primary" : "bg-primary/15"}`} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-primary/15">
                                                    <div className="h-full rounded-full bg-primary" style={{ width: `${(r.got / r.units) * 100}%` }} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto flex gap-2.5 pt-6">
                                            <Link
                                                to={r.verified ? "/dashboard/matching" : "/create-blood-requests"}
                                                className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-bold text-white shadow-md shadow-primary/25 transition hover:brightness-95 active:scale-[0.98]"
                                            >
                                                {r.verified
                                                    ? t("home.emergency.respond", "I can donate")
                                                    : t("home.emergency.pendingShort", "Pending review")}
                                                <ArrowRight size={15} />
                                            </Link>
                                            {r.verified && r.phone && (
                                                <a
                                                    href={`tel:${r.phone}`}
                                                    aria-label={t("home.emergency.call", "Call requester")}
                                                    className="grid size-11 place-items-center rounded-xl border border-border text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                                                >
                                                    <Phone size={17} />
                                                </a>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="mt-8 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
                            {urgencyFilter === "all"
                                ? t("home.emergency.noRequests", "No blood requests have been posted yet. Check back soon.")
                                : t("home.emergency.empty", "No requests at this urgency level right now.")}
                        </p>
                    )}

                    <div className="mt-8 text-center">
                        <Link
                            to="/dashboard/matching"
                            className="group inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
                        >
                            {t("home.emergency.viewAll", "View all requests")}
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2b. Upcoming campaigns */}
            {campaigns.length > 0 && (
                <section aria-labelledby="campaigns-heading" className="border-t border-primary/10 bg-primary/3 py-16 md:py-20">
                    <div className={container}>
                        <SectionHeader
                            id="campaigns-heading"
                            tone="dark"
                            title={t("home.campaigns.title", "Upcoming donation drives")}
                            subtitle={t(
                                "home.campaigns.subtitle",
                                "Meet our team at a campaign near you and give blood on the spot."
                            )}
                            label="Campaigns"
                            icon={<Megaphone size={14} />}
                        />

                        <div className="mt-8 grid gap-5 md:grid-cols-3">
                            {campaigns.slice(0, 3).map((item) => {
                                const start = new Date(item.startAt);
                                return (
                                    <article key={item._id} className="premium-card overflow-hidden">
                                        <div className="relative h-24 bg-gradient-to-br from-[#7F1D1D] via-primary to-[#E11D48]">
                                            <div className="absolute -top-8 -right-6 size-28 rounded-full border-[14px] border-white/10" />
                                            <div className="absolute bottom-3 left-4 flex items-center gap-2 rounded-xl bg-black/20 px-3 py-1.5 text-white backdrop-blur-md">
                                                <CalendarDays size={13} />
                                                <span className="text-xs font-bold">
                                                    {Number.isNaN(start.getTime())
                                                        ? "—"
                                                        : start.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="line-clamp-1 font-extrabold text-foreground">{item.title}</h3>
                                            <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <MapPin size={13} className="text-primary" />
                                                {item.venue || item.location?.nameEn || "Location to be announced"}
                                            </p>
                                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <div className="mt-8 text-center">
                            <Link
                                to="/campaigns"
                                className="group inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
                            >
                                {t("home.campaigns.viewAll", "View all campaigns")}
                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Safety and advisory */}
            <section aria-labelledby="safety-heading" className="border-t border-primary/10 py-16 md:py-24">
                <div className={container}>
                    <SectionHeader
                        id="safety-heading"
                        title={t("home.safety.title", "Safety and advisory")}
                        subtitle={t("home.safety.subtitle", "Simple rules that keep donors and patients safe.")}
                        label="Safety first"
                        icon={<ShieldCheck size={14} />}
                    />

                    <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
                        {/* Bento rules */}
                        <ul className="grid gap-5 sm:grid-cols-2">
                            <li className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-primary/80 p-7 text-white shadow-xl shadow-primary/20 sm:col-span-2">
                                <FeaturedIcon aria-hidden="true" size={150} strokeWidth={1.2} className="absolute -right-6 -bottom-8 text-white/10" />
                                <span className="grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                                    <FeaturedIcon size={22} strokeWidth={2.1} />
                                </span>
                                <h3 className="mt-5 text-2xl font-extrabold tracking-tight">{featuredRule.title}</h3>
                                <p className="mt-2 max-w-[460px] text-[15px] leading-relaxed text-white/85">{featuredRule.text}</p>
                            </li>

                            {otherRules.map((rule, i) => {
                                const Icon = rule.icon;
                                return (
                                    <li
                                        key={rule.title}
                                        className={`rounded-2xl border border-border/70 bg-card p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 ${i === otherRules.length - 1 && otherRules.length % 2 === 1 ? "sm:col-span-2" : ""}`}
                                    >
                                        <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                                            <Icon size={20} strokeWidth={2.1} />
                                        </span>
                                        <h3 className="mt-4 font-bold text-foreground">{rule.title}</h3>
                                        <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{rule.text}</p>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Do not donate if */}
                        <aside className="rounded-3xl border border-amber-200 bg-linear-to-b from-amber-50 to-amber-50/40 p-7">
                            <h3 className="flex items-center gap-2.5 text-lg font-extrabold text-amber-900">
                                <span className="grid size-9 place-items-center rounded-xl bg-amber-100">
                                    <AlertTriangle size={18} />
                                </span>
                                {t("home.safety.notTitle", "Do not donate if")}
                            </h3>
                            <ul className="mt-5 space-y-3">
                                {notDonateIf.map((line) => (
                                    <li key={line} className="flex gap-3 rounded-xl bg-white/70 px-3.5 py-3 text-[14.5px] leading-snug text-amber-950/85 ring-1 ring-amber-100">
                                        <X size={16} className="mt-0.5 shrink-0 text-amber-600" />
                                        {line}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-5 flex gap-2 text-xs leading-relaxed text-amber-900/70">
                                <Stethoscope size={16} className="mt-0.5 shrink-0" />
                                {t("home.safety.disclaimer", "This is general advice, not medical advice. Staff at the blood bank make the final decision.")}
                            </p>
                        </aside>
                    </div>
                </div>
            </section>

            {/* 4. Tips and guidelines */}
            <section aria-labelledby="tips-heading" className="border-t border-primary/10 bg-primary/3 py-16 md:py-24">
                <div className={container}>
                    <SectionHeader
                        id="tips-heading"
                        title={t("home.tips.title", "Blood donation tips and guidelines")}
                        subtitle={t("home.tips.subtitle", "What to do before, during and after you donate.")}
                        label="Health & Education"
                        icon={<Heart size={14} />}
                    />

                    <div className="mt-10 grid gap-5 lg:grid-cols-[300px_1fr]">
                        {/* Tabs */}
                        <div
                            role="tablist"
                            aria-orientation="vertical"
                            aria-label={t("home.tips.title", "Blood donation tips and guidelines")}
                            onKeyDown={onTabKeyDown}
                            className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
                        >
                            {tipTabs.map((x, i) => {
                                const Icon = x.icon;
                                const active = tab === x.key;
                                return (
                                    <button
                                        key={x.key}
                                        role="tab"
                                        type="button"
                                        id={`tab-${x.key}`}
                                        aria-selected={active}
                                        aria-controls="tips-panel"
                                        tabIndex={active ? 0 : -1}
                                        onClick={() => setTab(x.key)}
                                        className={[
                                            "flex items-center gap-4 rounded-2xl border p-4 text-left outline-none transition-all duration-200",
                                            "focus-visible:ring-2 focus-visible:ring-primary/50",
                                            active
                                                ? "border-primary/30 bg-card shadow-lg shadow-primary/10"
                                                : "border-transparent hover:bg-card/70",
                                        ].join(" ")}
                                    >
                                        <span className={`grid size-12 shrink-0 place-items-center rounded-xl transition-colors ${active ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                                            <Icon size={21} strokeWidth={2.1} />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                                                {t("home.tips.step", "Step")} {i + 1}
                                            </span>
                                            <span className="block text-base font-extrabold text-foreground">{x.label}</span>
                                            <span className="block text-[13px] text-muted-foreground">{x.hint}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Panel */}
                        <div
                            id="tips-panel"
                            role="tabpanel"
                            aria-labelledby={`tab-${tab}`}
                            className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8"
                        >
                            <div className="flex items-center justify-between border-b border-border pb-5">
                                <h3 className="text-xl font-extrabold text-foreground">
                                    {activeTips.label} <span className="text-muted-foreground">·</span>{" "}
                                    <span className="text-primary">{activeTips.hint}</span>
                                </h3>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                    {activeTips.items.length} {t("home.tips.tips", "tips")}
                                </span>
                            </div>

                            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                                {activeTips.items.map((tip, i) => (
                                    <li key={tip} className="relative overflow-hidden rounded-2xl bg-muted/50 p-5 pl-6">
                                        <span aria-hidden="true" className="absolute top-2 right-4 text-5xl font-extrabold text-primary/10">
                                            {i + 1}
                                        </span>
                                        <p className="relative text-[15px] leading-relaxed text-foreground/85">{tip}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Gallery */}
            <section aria-labelledby="gallery-heading" className="border-t border-primary/10 py-16 md:py-24">
                <div className={container}>
                    <SectionHeader
                        id="gallery-heading"
                        title={t("home.gallery.title", "Moments from our community")}
                        subtitle={t("home.gallery.subtitle", "Drives, camps and the donors who show up.")}
                        label="Activities, Events & photos"
                        icon={<Images size={14} />}
                    />

                    <ul className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-3 md:gap-4">
                        {galleryItems.map((item, i) => (
                            <li key={item.id} className={item.tall ? "row-span-2" : ""}>
                                <button
                                    type="button"
                                    onClick={() => setLightbox(i)}
                                    aria-label={t("home.gallery.open", "Open photo: {{caption}}", { caption: item.caption })}
                                    className="group relative block size-full overflow-hidden rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
                                >
                                    <Tile item={item} className="transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none" />

                                    <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-80 transition-opacity group-hover:opacity-100" />

                                    <span aria-hidden="true" className="absolute top-3 right-3 grid size-9 scale-90 place-items-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-md transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
                                        <Maximize2 size={15} />
                                    </span>

                                    <span className="absolute inset-x-3 bottom-3 rounded-xl border border-white/20 bg-black/10 px-3.5 py-2.5 text-left text-[13px] leading-snug font-semibold text-white backdrop-blur-xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                                        {item.caption}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {lightbox !== null && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={galleryItems[lightbox].caption}
                        className="fixed inset-0 z-[60] grid place-items-center bg-[#0B1210]/92 p-4 backdrop-blur-md"
                        onClick={() => setLightbox(null)}
                    >
                        <span className="absolute top-5 left-5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
                            {lightbox + 1} / {galleryItems.length}
                        </span>

                        <button type="button" autoFocus onClick={() => setLightbox(null)} aria-label={t("home.gallery.close", "Close")} className={`absolute top-4 right-4 ${glassBtn}`}>
                            <X size={22} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + galleryItems.length) % galleryItems.length); }} aria-label={t("home.gallery.prev", "Previous photo")} className={`absolute left-3 md:left-6 ${glassBtn}`}>
                            <ChevronLeft size={24} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % galleryItems.length); }} aria-label={t("home.gallery.next", "Next photo")} className={`absolute right-3 md:right-6 ${glassBtn}`}>
                            <ChevronRight size={24} />
                        </button>

                        <figure className="w-full max-w-[920px]" onClick={(e) => e.stopPropagation()}>
                            <div className="aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-black/50 ring-1 ring-white/10">
                                <Tile item={galleryItems[lightbox]} />
                            </div>
                            <figcaption className="mt-4 text-center text-sm font-medium text-white/85">
                                {galleryItems[lightbox].caption}
                            </figcaption>
                        </figure>
                    </div>
                )}
            </section>
        </main>
    );
};

export default Home;