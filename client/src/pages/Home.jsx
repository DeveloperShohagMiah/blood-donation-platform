import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    AlertTriangle,
    Users,
    BadgeCheck,
    Ban,
    Camera,
    ChevronLeft,
    ChevronRight,
    Clock,
    Droplets,
    HandCoins,
    MapPin,
    Phone,
    ShieldCheck,
    Stethoscope,
    X,
    InfoIcon,
    Heart,
} from "lucide-react";
import Hero from "../components/Hero";
import SectionHeader from "../components/SectionHeader";
import DonorShowcase from "../components/Donorshowcase";


const container =
    "mx-auto w-[calc(100%-2rem)] max-w-[1280px] md:w-[calc(100%-4rem)]";

/* ---------- Sample data: replace with your API responses ---------- */
const sampleEmergencies = [
    { id: 1, group: "O-", units: 2, got: 1, hospital: "City General Hospital", place: "Dhaka", time: "12 min ago", phone: "+8801000000001" },
    { id: 2, group: "A+", units: 3, got: 0, hospital: "Sadar Hospital", place: "Rajshahi", time: "38 min ago", phone: "+8801000000002" },
    { id: 3, group: "B-", units: 1, got: 0, hospital: "Central Medical College", place: "Chattogram", time: "1 hr ago", phone: "+8801000000003" },
];

/* Leave src empty to show a placeholder tile */
const galleryItems = [
    { id: 1, src: "", caption: "Community blood drive, Dhaka", tall: true },
    { id: 2, src: "", caption: "Volunteers preparing donor kits" },
    { id: 3, src: "", caption: "First-time donors with certificates" },
    { id: 4, src: "", caption: "University donation camp", tall: true },
    { id: 5, src: "", caption: "Thank-you day for regular donors" },
    { id: 6, src: "", caption: "Health check before donating" },
];

const Home = () => {
    const { t } = useTranslation();

    /* Tips tabs */
    const [tab, setTab] = useState("before");
    const tipTabs = [
        {
            key: "before",
            label: t("home.tips.before", "Before"),
            items: [
                t("home.tips.b1", "Drink an extra 500 ml of water in the hour before you donate."),
                t("home.tips.b2", "Eat a normal meal with iron-rich food such as meat, lentils or spinach."),
                t("home.tips.b3", "Sleep well the night before and avoid alcohol for 24 hours."),
                t("home.tips.b4", "Carry a valid ID and a list of any medicines you take."),
            ],
        },
        {
            key: "during",
            label: t("home.tips.during", "During"),
            items: [
                t("home.tips.d1", "A whole-blood donation itself takes around 10 minutes."),
                t("home.tips.d2", "Relax, breathe normally and look away if needles bother you."),
                t("home.tips.d3", "Tell the staff at once if you feel dizzy, cold or unwell."),
                t("home.tips.d4", "Keep your arm still and squeeze the ball if you’re asked to."),
            ],
        },
        {
            key: "after",
            label: t("home.tips.after", "After"),
            items: [
                t("home.tips.a1", "Rest for 10 to 15 minutes and have a snack and a drink before leaving."),
                t("home.tips.a2", "Drink more fluids than usual for the next day."),
                t("home.tips.a3", "Skip heavy lifting and hard exercise for the rest of the day."),
                t("home.tips.a4", "Keep the bandage on for several hours. Lie down if you feel faint."),
            ],
        },
    ];
    const activeTips = tipTabs.find((x) => x.key === tab);

    /* Safety content */
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

    const notDonateIf = [
        t("home.safety.n1", "You have a fever, cold or infection"),
        t("home.safety.n2", "You donated whole blood in the last 3 to 4 months"),
        t("home.safety.n3", "You had surgery, a tattoo or piercing recently"),
        t("home.safety.n4", "You are pregnant or breastfeeding"),
        t("home.safety.n5", "You take medicines that your doctor says affect donation"),
    ];

    /* Gallery lightbox */
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

    const Tile = ({ item, className = "" }) =>
        item.src ? (
            <img src={item.src} alt={item.caption} loading="lazy" className={`size-full object-cover ${className}`} />
        ) : (
            <div className={`grid size-full place-items-center bg-gradient-to-br from-[#FDEEF0] via-[#F7FAF8] to-[#E8F3EE] ${className}`}>
                <Camera size={28} className="text-[#C9A0A5]" aria-hidden="true" />
            </div>
        );

    return (
        <main>
            <Hero />

            <DonorShowcase />

            {/* 2. Emergency requests */}
            <section aria-labelledby="emergency-heading" className="py-16 md:py-24 bg-primary/3">
                <div className={container}>
                    <SectionHeader
                        id="emergency-heading"
                        tone="dark"
                        title={t("home.emergency.title", "Emergency blood requests")}
                        subtitle={t(
                            "home.emergency.subtitle",
                            "These patients need blood today. Call the hospital to confirm, then go if you match."
                        )}
                        label="Emergency requests"
                        icon={<InfoIcon size={14} />}
                    />

                    <ul className="mt-10 grid gap-5 lg:grid-cols-3">
                        {sampleEmergencies.map((r) => (
                            <li key={r.id} className="flex flex-col rounded-lg card p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                                <div className="flex items-start justify-between">
                                    <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#E64B5A] to-[#B91F32] text-2xl font-extrabold text-white shadow-[0_8px_18px_rgba(198,40,56,0.35)]">
                                        {r.group}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDEEF0] px-2.5 py-1 text-xs font-bold text-[#C62838]">
                                        <span className="relative flex size-2">
                                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#C62838]/50 motion-reduce:animate-none" />
                                            <span className="relative size-2 rounded-full bg-[#C62838]" />
                                        </span>
                                        {t("home.emergency.urgent", "Urgent")}
                                    </span>
                                </div>

                                <h3 className="mt-4 text-lg font-bold text-[#192623]">{r.hospital}</h3>
                                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#66736E]">
                                    <span className="inline-flex items-center gap-1"><MapPin size={14} />{r.place}</span>
                                    <span className="inline-flex items-center gap-1"><Clock size={14} />{r.time}</span>
                                </p>

                                <div className="mt-5">
                                    <div className="flex items-center justify-between text-sm font-semibold text-[#33443D]">
                                        <span className="inline-flex items-center gap-1"><Droplets size={14} className="text-[#C62838]" />{t("home.emergency.units", "{{count}} units needed", { count: r.units })}</span>
                                        <span className="text-[#66736E]">{r.got}/{r.units}</span>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F1F5F3]">
                                        <div className="h-full rounded-full bg-[#C62838]" style={{ width: `${(r.got / r.units) * 100}%` }} />
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-2.5">
                                    <Link to="/blood-requests" className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-gradient-to-b from-[#D6313F] to-[#B91F32] text-sm font-bold text-white transition hover:brightness-95">
                                        {t("home.emergency.respond", "I can donate")}
                                    </Link>
                                    <a href={`tel:${r.phone}`} aria-label={t("home.emergency.call", "Call requester")} className="grid size-11 place-items-center rounded-xl border border-[#E4EBE7] text-[#33443D] transition-colors hover:border-[#C62838] hover:text-[#C62838]">
                                        <Phone size={18} />
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* 3. Safety and advisory */}
            <section aria-labelledby="safety-heading" className="py-16 md:py-24">
                <div className={container}>
                    <SectionHeader
                        id="safety-heading"
                        title={t("home.safety.title", "Safety and advisory")}
                        subtitle={t("home.safety.subtitle", "Simple rules that keep donors and patients safe.")}
                    />

                    <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                        <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                            {safetyRules.map((rule) => {
                                const Icon = rule.icon;
                                return (
                                    <li key={rule.title} className="flex gap-4">
                                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#E8F3EE] text-[#2F6B52]">
                                            <Icon size={20} strokeWidth={2.1} />
                                        </span>
                                        <div>
                                            <h3 className="font-bold text-[#192623]">{rule.title}</h3>
                                            <p className="mt-1 text-[15px] leading-relaxed text-[#66736E]">{rule.text}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <aside className="rounded-2xl border border-[#F0D9A8] bg-[#FFF9EB] p-6">
                            <h3 className="flex items-center gap-2 font-bold text-[#7A5A12]">
                                <AlertTriangle size={20} />
                                {t("home.safety.notTitle", "Do not donate if")}
                            </h3>
                            <ul className="mt-4 space-y-2.5">
                                {notDonateIf.map((line) => (
                                    <li key={line} className="flex gap-2.5 text-[15px] leading-snug text-[#5E4A17]">
                                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#C9962B]" />
                                        {line}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-5 flex gap-2 border-t border-[#F0D9A8] pt-4 text-xs leading-relaxed text-[#7A6A3A]">
                                <Stethoscope size={16} className="mt-0.5 shrink-0" />
                                {t("home.safety.disclaimer", "This is general advice, not medical advice. Staff at the blood bank make the final decision.")}
                            </p>
                        </aside>
                    </div>
                </div>
            </section>

            {/* 4. Tips and guidelines */}
            <section aria-labelledby="tips-heading" className="bg-primary/3 border-b border-primary/20 py-16 md:py-24">
                <div className={container}>
                    <SectionHeader
                        id="tips-heading"
                        title={t("home.tips.title", "Blood donation tips and guidelines")}
                        subtitle={t("home.tips.subtitle", "What to do before, during and after you donate.")}
                        label={"Health & Education"}
                        icon={<Heart size={14} />}
                    />

                    <div className="mt-10 rounded-3xl border border-[#E4EBE7] bg-white p-5 shadow-[0_24px_60px_rgba(29,55,44,0.07)] sm:p-8">
                        <div role="tablist" aria-label={t("home.tips.title", "Blood donation tips and guidelines")} className="inline-flex rounded-full bg-[#F1F5F3] p-1">
                            {tipTabs.map((x) => (
                                <button
                                    key={x.key}
                                    role="tab"
                                    type="button"
                                    id={`tab-${x.key}`}
                                    aria-selected={tab === x.key}
                                    aria-controls="tips-panel"
                                    onClick={() => setTab(x.key)}
                                    className={[
                                        "h-10 rounded-full px-5 text-sm font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#C62838]/50",
                                        tab === x.key ? "bg-white text-[#C62838] shadow-[0_1px_4px_rgba(28,48,39,0.15)]" : "text-[#66736E] hover:text-[#192623]",
                                    ].join(" ")}
                                >
                                    {x.label}
                                </button>
                            ))}
                        </div>

                        <ul id="tips-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-6 grid gap-4 sm:grid-cols-2">
                            {activeTips.items.map((tip, i) => (
                                <li key={tip} className="flex gap-3.5 rounded-xl bg-[#F9FBFA] p-4">
                                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#192623] text-xs font-bold text-white">{i + 1}</span>
                                    <span className="text-[15px] leading-relaxed text-[#33443D]">{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* 5. Gallery */}
            <section aria-labelledby="gallery-heading" className="py-16 md:py-24">
                <div className={container}>
                    <SectionHeader
                        id="gallery-heading"
                        title={t("home.gallery.title", "Moments from our community")}
                        subtitle={t("home.gallery.subtitle", "Drives, camps and the donors who show up.")}
                    />

                    <ul className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-3 md:grid-cols-3 md:auto-rows-[220px] md:gap-4">
                        {galleryItems.map((item, i) => (
                            <li key={item.id} className={item.tall ? "row-span-2" : ""}>
                                <button
                                    type="button"
                                    onClick={() => setLightbox(i)}
                                    aria-label={t("home.gallery.open", "Open photo: {{caption}}", { caption: item.caption })}
                                    className="group relative block size-full overflow-hidden rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-[#C62838]/40"
                                >
                                    <Tile item={item} className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
                                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-left text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
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
                        className="fixed inset-0 z-[60] grid place-items-center bg-[#0E1714]/90 p-4 backdrop-blur-sm"
                        onClick={() => setLightbox(null)}
                    >
                        <button type="button" autoFocus onClick={() => setLightbox(null)} aria-label={t("home.gallery.close", "Close")} className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                            <X size={22} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + galleryItems.length) % galleryItems.length); }} aria-label={t("home.gallery.prev", "Previous photo")} className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:left-6">
                            <ChevronLeft size={24} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % galleryItems.length); }} aria-label={t("home.gallery.next", "Next photo")} className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:right-6">
                            <ChevronRight size={24} />
                        </button>

                        <figure className="w-full max-w-[900px]" onClick={(e) => e.stopPropagation()}>
                            <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                                <Tile item={galleryItems[lightbox]} />
                            </div>
                            <figcaption className="mt-3 text-center text-sm font-medium text-white/85">
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