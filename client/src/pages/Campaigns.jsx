import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    CalendarDays,
    Check,
    Clock,
    Droplets,
    MapPin,
    Megaphone,
    X,
} from "lucide-react";
import { apiFetch } from "../utils/api";

const tone = {
    published: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
    draft: "bg-slate-500/10 text-slate-600 ring-slate-500/20",
    completed: "bg-sky-500/10 text-sky-700 ring-sky-500/20",
    cancelled: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
};

const StatusPill = ({ status, label }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${tone[status] || tone.draft}`}>
        {label || status}
    </span>
);

const timelineStatus = (item) => {
    const now = Date.now();
    const start = new Date(item.startAt).getTime();
    const end = new Date(item.endAt).getTime();
    if (item.status === "completed" || end < now) return "completed";
    if (start <= now && end >= now) return "ongoing";
    return "upcoming";
};

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "—";

const formatTime = (value) =>
    value
        ? new Date(value).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "";

const formatDateTime = (value) =>
    value ? `${formatDate(value)} · ${formatTime(value)}` : "—";

const Campaigns = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [viewing, setViewing] = useState(null);

    useEffect(() => {
        let active = true;
        apiFetch("/campaigns")
            .then((data) => {
                if (active) setItems(data?.items || []);
            })
            .catch((err) => {
                if (active) setError(err.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const counts = useMemo(() => {
        const result = { all: items.length, upcoming: 0, ongoing: 0, completed: 0 };
        items.forEach((item) => {
            result[timelineStatus(item)] += 1;
        });
        return result;
    }, [items]);

    const visible = items.filter(
        (item) => filter === "all" || timelineStatus(item) === filter
    );

    return (
        <main className="min-h-screen bg-[#F8FAF9]">
            {/* Hero */}
            <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#FFF3F3] via-white to-[#FFF8F5] py-16 sm:py-20">
                <div className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-accent/40 blur-3xl" />
                <div className="container relative text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card px-4 py-2 text-xs font-bold tracking-wide text-primary uppercase shadow-sm">
                        <Megaphone size={15} /> Blood Connect Community
                    </span>
                    <h1 className="mt-6 text-4xl leading-tight font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        Donation <span className="text-gradient">campaigns</span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                        Join a blood drive near you, or find out when our volunteers will be
                        in your community. Every drop counts.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="container py-14">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                            Upcoming &amp; active drives
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Published by the Blood Connect team.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter campaigns">
                        {[
                            { key: "all", label: "All" },
                            { key: "upcoming", label: "Upcoming" },
                            { key: "ongoing", label: "Ongoing" },
                            { key: "completed", label: "Completed" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setFilter(tab.key)}
                                aria-pressed={filter === tab.key}
                                className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-xs font-bold transition ${filter === tab.key
                                        ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
                                    }`}
                            >
                                {tab.label}
                                <span className={`grid min-w-5 place-items-center rounded-full px-1.5 text-[10px] ${filter === tab.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                                    {counts[tab.key]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Campaigns could not be loaded right now ({error}).
                    </p>
                )}

                {loading ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-80 animate-pulse rounded-3xl border border-border bg-card" />
                        ))}
                    </div>
                ) : visible.length === 0 ? (
                    <div className="grid place-items-center rounded-3xl border border-dashed border-primary/25 bg-gradient-to-b from-primary/5 to-transparent px-6 py-16 text-center">
                        <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                            <Megaphone size={26} />
                        </span>
                        <h3 className="mt-4 font-bold text-foreground">
                            {filter === "all" ? "No campaigns scheduled yet" : `No ${filter} campaigns`}
                        </h3>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            New donation drives will appear here as soon as they are published.
                        </p>
                        <Link
                            to="/donors"
                            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white"
                        >
                            Find donors instead <ArrowRight size={15} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {visible.map((item) => {
                            const state = timelineStatus(item);
                            const start = new Date(item.startAt);
                            return (
                                <article key={item._id} className="premium-card flex flex-col overflow-hidden">
                                    <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[#7F1D1D] via-primary to-[#E11D48]">
                                        <div className="absolute -top-10 -right-8 size-40 rounded-full border-[18px] border-white/10" />
                                        <div className="absolute -bottom-16 -left-8 size-40 rounded-full border-[18px] border-white/10" />
                                        <div className="absolute top-4 left-5 grid size-11 place-items-center rounded-xl bg-white/15 text-white backdrop-blur-md ring-1 ring-white/20">
                                            <Droplets size={20} />
                                        </div>
                                        <div className="absolute top-4 right-5">
                                            <StatusPill
                                                status={state === "ongoing" ? "published" : state}
                                                label={state === "completed" ? "Completed" : state === "ongoing" ? "Ongoing" : "Upcoming"}
                                            />
                                        </div>
                                        <div className="absolute bottom-4 left-5 flex items-center gap-2 rounded-xl bg-black/20 px-3 py-1.5 text-white backdrop-blur-md">
                                            <CalendarDays size={14} />
                                            <span className="text-xs font-bold">
                                                {Number.isNaN(start.getTime())
                                                    ? "—"
                                                    : `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · ${formatTime(item.startAt)}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-1 flex-col p-5">
                                        <h3 className="line-clamp-1 text-lg font-extrabold tracking-tight text-foreground">
                                            {item.title}
                                        </h3>
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            {item.venue && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPin size={13} className="text-primary" /> {item.venue}
                                                </span>
                                            )}
                                            {item.location && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPin size={13} className="text-primary" /> {item.location}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                            {item.description}
                                        </p>
                                        <div className="mt-4 rounded-xl bg-muted/50 px-3.5 py-2.5 text-xs text-muted-foreground">
                                            <Clock size={12} className="mr-1 inline text-primary" />
                                            <span className="font-semibold text-foreground">Duration:</span>{" "}
                                            {formatDateTime(item.startAt)} — {formatDateTime(item.endAt)}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setViewing(item)}
                                            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 text-sm font-bold text-primary transition hover:bg-primary/10"
                                        >
                                            View details <ArrowRight size={15} />
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Detail modal */}
            {viewing && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setViewing(null)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                        <div className="relative h-28 bg-gradient-to-br from-[#7F1D1D] via-primary to-[#E11D48]">
                            <div className="absolute -top-8 -right-6 size-32 rounded-full border-4 border-white/10" />
                            <div className="absolute bottom-3 left-5 flex items-center gap-2 text-white">
                                <Megaphone size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Campaign details</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewing(null)}
                                aria-label="Close"
                                className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
                            >
                                <X size={17} />
                            </button>
                        </div>
                        <div className="p-6">
                            <h2 className="text-xl font-extrabold text-foreground">{viewing.title}</h2>
                            <p className="mt-3 leading-7 text-muted-foreground">{viewing.description}</p>
                            <dl className="mt-5 grid gap-3 rounded-xl bg-muted/50 p-4 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Starts</dt>
                                    <dd className="mt-1 font-semibold text-foreground">{formatDateTime(viewing.startAt)}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Ends</dt>
                                    <dd className="mt-1 font-semibold text-foreground">{formatDateTime(viewing.endAt)}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Venue</dt>
                                    <dd className="mt-1 font-semibold text-foreground">{viewing.venue || "—"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Location</dt>
                                    <dd className="mt-1 font-semibold text-foreground">{viewing.location || "—"}</dd>
                                </div>
                            </dl>
                            <div className="mt-6 flex flex-wrap gap-2">
                                <Link to="/donors" className="btn-premium h-10 flex-1 px-4 text-sm">
                                    <Check size={15} /> Find a donor
                                </Link>
                                <button type="button" onClick={() => setViewing(null)} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Campaigns;
