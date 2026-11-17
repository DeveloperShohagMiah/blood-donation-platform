import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    Droplets,
    MapPin,
    Phone,
    Plus,
    ShieldCheck,
} from "lucide-react";
import { apiFetch } from "../utils/api";

const urgencyStyles = {
    critical: { dot: "bg-rose-500", pill: "bg-rose-50 text-rose-700 ring-rose-200", bar: "bg-rose-500", label: "Critical" },
    urgent: { dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800 ring-amber-200", bar: "bg-amber-500", label: "Urgent" },
    normal: { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-500", label: "Normal" },
};

const levelOf = (value) => {
    const key = String(value || "normal").toLowerCase();
    return urgencyStyles[key] ? key : "normal";
};

const timeAgo = (value) => {
    const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
    return `${Math.floor(minutes / 1440)} d ago`;
};

const BloodRequests = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [urgency, setUrgency] = useState("all");
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    useEffect(() => {
        let active = true;
        apiFetch("/blood-requests/public")
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
        const result = { all: items.length, critical: 0, urgent: 0, normal: 0, verified: 0 };
        items.forEach((item) => {
            result[levelOf(item.urgency)] += 1;
            if (item.isVerified) result.verified += 1;
        });
        return result;
    }, [items]);

    const visible = items.filter(
        (item) =>
            (urgency === "all" || levelOf(item.urgency) === urgency) &&
            (!verifiedOnly || item.isVerified)
    );

    return (
        <main className="min-h-screen bg-[#F8FAF9]">
            {/* Hero */}
            <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#FFF3F3] via-white to-[#FFF8F5] py-16 sm:py-20">
                <div className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-accent/40 blur-3xl" />
                <div className="container relative">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card px-4 py-2 text-xs font-bold tracking-wide text-primary uppercase shadow-sm">
                        <Droplets size={15} /> Community requests
                    </span>
                    <h1 className="mt-6 text-4xl leading-tight font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        All <span className="text-gradient">blood requests</span>
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                        Browse open requests from people who need blood. Verified requests show
                        contact details; pending ones are awaiting volunteer review.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            to="/create-blood-requests"
                            className="btn-premium h-12 px-6 text-sm"
                        >
                            <Plus size={17} /> Request blood
                        </Link>
                        <Link
                            to="/donors"
                            className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
                        >
                            Find donors <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* List */}
            <section className="container py-14">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                            Open requests
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {counts.all} total · {counts.verified} verified
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by urgency">
                        {[
                            { key: "all", label: "All" },
                            { key: "critical", label: "Critical" },
                            { key: "urgent", label: "Urgent" },
                            { key: "normal", label: "Normal" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setUrgency(tab.key)}
                                aria-pressed={urgency === tab.key}
                                className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-xs font-bold transition ${
                                    urgency === tab.key
                                        ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
                                }`}
                            >
                                {tab.label}
                                <span className={`grid min-w-5 place-items-center rounded-full px-1.5 text-[10px] ${urgency === tab.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                                    {counts[tab.key]}
                                </span>
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setVerifiedOnly((value) => !value)}
                            aria-pressed={verifiedOnly}
                            className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-xs font-bold transition ${
                                verifiedOnly
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                            }`}
                        >
                            <ShieldCheck size={14} /> Verified only
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Requests could not be loaded right now ({error}).
                    </p>
                )}

                {loading ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-72 animate-pulse rounded-3xl border border-border bg-card" />
                        ))}
                    </div>
                ) : visible.length === 0 ? (
                    <div className="grid place-items-center rounded-3xl border border-dashed border-primary/25 bg-gradient-to-b from-primary/5 to-transparent px-6 py-16 text-center">
                        <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                            <Droplets size={26} />
                        </span>
                        <h3 className="mt-4 font-bold text-foreground">
                            {items.length === 0 ? "No blood requests yet" : "No matching requests"}
                        </h3>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            {items.length === 0
                                ? "Be the first to post a request and let the community help."
                                : "Try a different urgency filter or turn off verified-only."}
                        </p>
                        <Link
                            to="/create-blood-requests"
                            className="btn-premium mt-5 h-10 px-4 text-sm"
                        >
                            <Plus size={15} /> Request blood
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {visible.map((item) => {
                            const level = levelOf(item.urgency);
                            const style = urgencyStyles[level];
                            return (
                                <article key={item._id} className="premium-card flex flex-col overflow-hidden">
                                    <div className={`h-1 w-full ${style.bar}`} />
                                    <div className="flex flex-1 flex-col p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-xl font-extrabold text-white shadow-lg shadow-primary/25">
                                                {item.bloodGroup}
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${style.pill}`}>
                                                <span className={`size-2 rounded-full ${style.dot}`} />
                                                {style.label}
                                            </span>
                                        </div>

                                        <h3 className="mt-4 text-lg font-extrabold text-foreground">
                                            {item.hospitalName}
                                        </h3>
                                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin size={13} /> {item.district?.nameEn || item.location || "Location not set"}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock size={13} /> {timeAgo(item.createdAt)}
                                            </span>
                                        </p>

                                        <div className="mt-4 rounded-xl border-l-2 border-primary bg-primary/5 px-3.5 py-2.5">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Patient</p>
                                            <p className="text-sm font-bold text-primary">{item.patientName}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {item.isVerified
                                                    ? `Contact: ${item.contactName || "—"}`
                                                    : "Awaiting volunteer verification"}
                                            </p>
                                        </div>

                                        <div className="mt-4">
                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                <span className="inline-flex items-center gap-1.5 text-foreground">
                                                    <Droplets size={14} className="text-primary" /> {item.units} unit{item.units > 1 ? "s" : ""} needed
                                                </span>
                                                <span className="text-muted-foreground">{item.unitsFulfilled || 0}/{item.units}</span>
                                            </div>
                                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/15">
                                                <div
                                                    className="h-full rounded-full bg-primary"
                                                    style={{ width: `${Math.min(100, ((item.unitsFulfilled || 0) / item.units) * 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-auto flex gap-2 pt-5">
                                            {item.isVerified ? (
                                                <>
                                                    <Link
                                                        to="/dashboard/matching"
                                                        className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95"
                                                    >
                                                        <CheckCircle2 size={14} /> I can donate
                                                    </Link>
                                                    {item.contactPhone && (
                                                        <a
                                                            href={`tel:${item.contactPhone}`}
                                                            aria-label="Call requester"
                                                            className="grid size-10 place-items-center rounded-xl border border-border text-foreground transition hover:border-primary hover:text-primary"
                                                        >
                                                            <Phone size={16} />
                                                        </a>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-border bg-muted/40 text-xs font-bold text-muted-foreground">
                                                    Pending review
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
};

export default BloodRequests;
