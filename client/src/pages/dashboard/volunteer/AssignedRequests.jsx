import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import Select from "../../../components/Select";
import { apiFetch } from "../../../utils/api";
import { formatDate, formatDateTime } from "../format";
import { useApiData } from "../hooks";
import {
    EmptyState,
    ErrorBanner,
    PageHeader,
    StatCard,
    StatusBadge,
} from "../components/UI";
import {
    Activity,
    AlertCircle,
    ArrowUpRight,
    BadgeCheck,
    Building2,
    CalendarClock,
    Check,
    CheckCircle2,
    ClipboardList,
    Droplets,
    Eye,
    FileText,
    LayoutGrid,
    List,
    LoaderCircle,
    MapPin,
    Phone,
    RefreshCw,
    RotateCcw,
    Search,
    ShieldCheck,
    Sparkles,
    Timer,
    UserRound,
    X,
    XCircle,
} from "lucide-react";

const STATUS_FILTERS = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "needed", label: "Needed date" },
    { value: "priority", label: "Priority" },
];

const TYPE_LABELS = {
    self: "Self-claimed",
    manual: "Assigned by staff",
    automatic: "Auto-assigned",
};

const priorityRank = { critical: 3, urgent: 2, normal: 1 };

const requestOf = (item) => item?.request || {};

function relativeTime(value) {
    if (!value) return "—";
    const diff = new Date(value).getTime() - Date.now();
    if (Number.isNaN(diff)) return "—";
    const units = [
        ["year", 31_536_000_000],
        ["month", 2_592_000_000],
        ["day", 86_400_000],
        ["hour", 3_600_000],
        ["minute", 60_000],
    ];
    const [unit, size] = units.find(([, ms]) => Math.abs(diff) >= ms) || ["minute", 60_000];
    try {
        return new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "narrow" }).format(
            Math.round(diff / size),
            unit
        );
    } catch {
        return formatDate(value);
    }
}

function dueInfo(value) {
    if (!value) return { label: "No date set", tone: "neutral" };
    const time = new Date(value).getTime();
    if (Number.isNaN(time)) return { label: "No date set", tone: "neutral" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = new Date(time);
    day.setHours(0, 0, 0, 0);
    const days = Math.round((day.getTime() - today.getTime()) / 86_400_000);

    if (days < 0) return { label: `Overdue by ${Math.abs(days)}d`, tone: "danger" };
    if (days === 0) return { label: "Needed today", tone: "warning" };
    if (days === 1) return { label: "Needed tomorrow", tone: "warning" };
    return { label: `Due ${formatDate(time)}`, tone: "neutral" };
}

function locationOf(request) {
    return [request.upazila?.nameEn, request.district?.nameEn]
        .filter(Boolean)
        .join(", ") || "Location not set";
}

const toneChip = {
    danger: "bg-destructive/10 text-destructive ring-destructive/20",
    warning: "bg-warning/10 text-warning ring-warning/20",
    neutral: "bg-muted text-muted-foreground ring-border",
};

function UrgencyChip({ urgency, active }) {
    const value = String(urgency || "normal").toLowerCase();
    if (!active && value === "normal") return null;
    const tone =
        value === "critical"
            ? "bg-destructive/10 text-destructive ring-destructive/20"
            : value === "urgent"
                ? "bg-warning/10 text-warning ring-warning/20"
                : "bg-muted text-muted-foreground ring-border";
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${tone}`}>
            <span className={`size-1.5 rounded-full ${value === "critical" ? "animate-pulse bg-destructive" : value === "urgent" ? "bg-warning" : "bg-muted-foreground"}`} />
            {value || "normal"}
        </span>
    );
}

function AssignmentCard({ item, view, busy, onDetails, onStatus }) {
    const request = requestOf(item);
    const active = item.status === "active";
    const due = dueInfo(request.neededAt);
    const units = Number(request.units) || 0;
    const fulfilled = Number(request.unitsFulfilled) || 0;
    const progress = units ? Math.min(100, Math.round((fulfilled / units) * 100)) : 0;
    const isList = view === "list";
    const busyNow = Boolean(busy);

    return (
        <article
            className={[
                "group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-xl",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg",
                isList ? "sm:p-4" : "",
            ].join(" ")}
        >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/25 to-transparent" />
            <span className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-primary/8 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />

            <div className={isList ? "relative flex flex-col gap-4 lg:flex-row lg:items-center" : "relative"}>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-primary to-primary-hover text-lg font-extrabold text-primary-foreground shadow-md shadow-primary/25 ring-1 ring-background/20">
                                {request.bloodGroup || "?"}
                                {active && (String(request.urgency || "normal") === "critical" || String(request.urgency) === "urgent") && (
                                    <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-card bg-warning" />
                                )}
                            </span>
                            <div className="min-w-0">
                                <h3 className="truncate font-extrabold tracking-tight text-foreground">
                                    {request.hospitalName || "Blood request"}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    <UserRound size={11} className="mr-1 inline" />
                                    {request.patientName || "Patient not set"}
                                    <span className="mx-1.5 text-border">·</span>
                                    {relativeTime(item.createdAt)}
                                </p>
                            </div>
                        </div>
                        <StatusBadge value={item.status} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <UrgencyChip urgency={request.urgency} active={active} />
                        <StatusBadge value={request.status} />
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${toneChip[due.tone]}`}>
                            <CalendarClock size={12} /> {due.label}
                        </span>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                            {TYPE_LABELS[item.assignmentType] || "Assignment"}
                        </span>
                    </div>

                    <div className="mt-4 grid gap-3">
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                            <span className="line-clamp-1">{locationOf(request)}</span>
                        </div>
                        <div>
                            <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Droplets size={13} className="text-primary" /> Units fulfilled
                                </span>
                                <span className="font-extrabold text-foreground">
                                    {fulfilled}<span className="font-semibold text-muted-foreground"> / {units || "—"}</span>
                                </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-linear-to-r from-primary to-primary-hover transition-[width] duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        {item.notes && (
                            <p className="flex items-start gap-2 rounded-xl bg-muted/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
                                <FileText size={13} className="mt-1 shrink-0 text-primary" />
                                <span className="line-clamp-2">{item.notes}</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className={[
                    "flex shrink-0 flex-wrap gap-2 pt-4",
                    isList ? "lg:w-56 lg:flex-col lg:border-l lg:border-border lg:pl-4 lg:pt-0" : "border-t border-border/70",
                ].join(" ")}>
                    <button
                        type="button"
                        onClick={() => onDetails(item._id)}
                        className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-xs font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                        <Eye size={14} /> Details
                    </button>
                    {active ? (
                        <>
                            <button
                                type="button"
                                disabled={busyNow}
                                onClick={() => onStatus({ id: item._id, status: "completed", note: item.notes || "" })}
                                className="btn-premium inline-flex h-9 flex-1 items-center justify-center gap-1.5 px-3 text-xs disabled:opacity-60"
                            >
                                {busyNow ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />}
                                Complete
                            </button>
                            <button
                                type="button"
                                disabled={busyNow}
                                onClick={() => onStatus({ id: item._id, status: "cancelled", note: item.notes || "" })}
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-xs font-bold text-muted-foreground transition hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive disabled:opacity-60"
                            >
                                <XCircle size={14} /> Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            disabled={busyNow}
                            onClick={() => onStatus({ id: item._id, status: "active", note: item.notes || "" })}
                            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-xs font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-60"
                        >
                            {busyNow ? <LoaderCircle size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                            Reopen
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

function ModalShell({ children, onClose, labelledBy, wide = false, elevated = false }) {
    return createPortal(
        <div
            className="fixed inset-0 z-[80] overflow-y-auto bg-overlay p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                onMouseDown={(event) => event.stopPropagation()}
                className={[
                    "relative mx-auto my-4 w-full overflow-hidden rounded-3xl border border-border/70",
                    "bg-card/90 shadow-2xl backdrop-blur-2xl supports-[backdrop-filter]:bg-card/80",
                    "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px",
                    "before:bg-linear-to-r before:from-transparent before:via-primary/40 before:to-transparent",
                    wide ? "max-w-2xl sm:my-8" : "max-w-md sm:my-16",
                    elevated ? "z-[90]" : "",
                ].join(" ")}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}

function DetailRow({ icon: Icon, label, children }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                <Icon size={15} />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                <div className="mt-0.5 text-sm font-semibold text-foreground">{children}</div>
            </div>
        </div>
    );
}

function DetailsModal({ item, note, onNoteChange, onSaveNote, onClose, onStatus, busy, savingNote }) {
    const request = requestOf(item);
    const active = item.status === "active";
    const units = Number(request.units) || 0;
    const fulfilled = Number(request.unitsFulfilled) || 0;
    const progress = units ? Math.min(100, Math.round((fulfilled / units) * 100)) : 0;
    const due = dueInfo(request.neededAt);
    const dirty = note !== (item.notes || "");

    return (
        <ModalShell onClose={onClose} labelledBy="assignment-detail-title" wide>
            <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-5 sm:px-7">
                <div className="flex min-w-0 items-center gap-4">
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-primary to-primary-hover text-xl font-extrabold text-primary-foreground shadow-lg shadow-primary/25">
                        {request.bloodGroup || "?"}
                    </span>
                    <div className="min-w-0">
                        <p className="eyebrow text-[10px]">Assignment details</p>
                        <h2 id="assignment-detail-title" className="mt-1 truncate text-lg font-extrabold tracking-tight text-foreground">
                            {request.hospitalName || "Blood request"}
                        </h2>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {request.patientName || "Patient not set"} · Assigned {relativeTime(item.createdAt)}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close details"
                    className="grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                    <X size={19} />
                </button>
            </div>

            <div className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
                <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={item.status} />
                    <StatusBadge value={request.status} />
                    <UrgencyChip urgency={request.urgency} active={active} />
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${toneChip[due.tone]}`}>
                        <CalendarClock size={12} /> {due.label}
                    </span>
                </div>

                {active && ["urgent", "critical"].includes(String(request.urgency || "").toLowerCase()) && (
                    <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                        <AlertCircle size={17} className="mt-0.5 shrink-0" />
                        <p>
                            <strong className="font-bold">Priority request.</strong> Coordinate donors quickly and keep the requester updated.
                        </p>
                    </div>
                )}

                <section>
                    <h3 className="eyebrow mb-2.5 text-[10px]">Request information</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <DetailRow icon={Droplets} label="Blood needed">
                            {request.bloodGroup || "—"} · {fulfilled} of {units || "—"} units ({progress}%)
                        </DetailRow>
                        <DetailRow icon={CalendarClock} label="Needed at">
                            {formatDateTime(request.neededAt)}
                        </DetailRow>
                        <DetailRow icon={Building2} label="Hospital">
                            <span className="block">{request.hospitalName || "—"}</span>
                            {request.hospitalAddress && (
                                <span className="mt-0.5 block text-xs font-medium text-muted-foreground">{request.hospitalAddress}</span>
                            )}
                        </DetailRow>
                        <DetailRow icon={MapPin} label="Location">
                            {locationOf(request)}
                        </DetailRow>
                        <DetailRow icon={UserRound} label="Requester contact">
                            {request.contactName || "—"}
                            {request.contactPhone && (
                                <a
                                    href={`tel:${request.contactPhone}`}
                                    className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2 py-1 text-xs font-bold text-primary transition hover:bg-primary/20"
                                >
                                    <Phone size={12} /> {request.contactPhone}
                                </a>
                            )}
                        </DetailRow>
                        <DetailRow icon={ClipboardList} label="Assignment">
                            {TYPE_LABELS[item.assignmentType] || "Assignment"}
                            <span className="mt-1 block text-xs font-medium text-muted-foreground">
                                Assigned {formatDateTime(item.createdAt)}
                            </span>
                        </DetailRow>
                    </div>
                    {request.details && (
                        <div className="mt-2 rounded-xl border border-border/60 bg-background/40 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Patient details</p>
                            <p className="mt-1 text-sm leading-6 text-foreground">{request.details}</p>
                        </div>
                    )}
                </section>

                <section>
                    <h3 className="eyebrow mb-2.5 text-[10px]">My coordination notes</h3>
                    <textarea
                        value={note}
                        onChange={(event) => onNoteChange(event.target.value)}
                        maxLength={1000}
                        rows={3}
                        placeholder="Record donor outreach, handover updates, or anything the team should know…"
                        aria-label="Coordination notes"
                        className="w-full resize-y rounded-xl border border-border/70 bg-background/60 px-3.5 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-muted-foreground">{note.length}/1000</span>
                        <button
                            type="button"
                            disabled={!dirty || savingNote}
                            onClick={onSaveNote}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3.5 text-xs font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {savingNote ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />}
                            Save note
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Created</p>
                        <p className="mt-1 text-xs font-bold text-foreground">{formatDate(item.createdAt)}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Updated</p>
                        <p className="mt-1 text-xs font-bold text-foreground">{formatDate(item.updatedAt)}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Completed</p>
                        <p className="mt-1 text-xs font-bold text-foreground">{item.completedAt ? formatDate(item.completedAt) : "—"}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Request expires</p>
                        <p className="mt-1 text-xs font-bold text-foreground">{formatDate(request.expiresAt)}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/70 bg-background/30 px-5 py-4 sm:px-7">
                {active ? (
                    <>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => onStatus({ id: item._id, status: "cancelled", note })}
                            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground transition hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive disabled:opacity-50"
                        >
                            <XCircle size={15} /> Cancel assignment
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => onStatus({ id: item._id, status: "completed", note })}
                            className="btn-premium h-10 px-5 text-sm disabled:opacity-60"
                        >
                            {busy ? <LoaderCircle size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                            Mark completed
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => onStatus({ id: item._id, status: "active", note })}
                        className="btn-premium h-10 px-5 text-sm disabled:opacity-60"
                    >
                        {busy ? <LoaderCircle size={15} className="animate-spin" /> : <RotateCcw size={15} />}
                        Reopen assignment
                    </button>
                )}
            </div>
        </ModalShell>
    );
}

const CONFIRM_COPY = {
    completed: {
        icon: CheckCircle2,
        title: "Mark as completed?",
        text: "This closes your assignment and records the time of completion. The request itself stays unchanged.",
        confirm: "Yes, complete it",
    },
    cancelled: {
        icon: XCircle,
        title: "Cancel this assignment?",
        text: "You will no longer be responsible for this request. You can reopen it later if needed.",
        confirm: "Yes, cancel it",
    },
    active: {
        icon: RotateCcw,
        title: "Reopen this assignment?",
        text: "The assignment returns to active and will appear in your current work again.",
        confirm: "Yes, reopen it",
    },
};

function ConfirmModal({ action, busy, onConfirm, onClose }) {
    const copy = CONFIRM_COPY[action.status] || CONFIRM_COPY.active;
    const Icon = copy.icon;
    const destructive = action.status === "cancelled";

    return (
        <ModalShell onClose={onClose} labelledBy="assignment-confirm-title" elevated>
            <div className="px-6 py-7 text-center sm:px-8">
                <span className={`mx-auto grid size-14 place-items-center rounded-2xl ring-1 ${destructive ? "bg-destructive/10 text-destructive ring-destructive/20" : "bg-primary/10 text-primary ring-primary/20"}`}>
                    <Icon size={26} />
                </span>
                <h2 id="assignment-confirm-title" className="mt-5 text-lg font-extrabold tracking-tight text-foreground">
                    {copy.title}
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{copy.text}</p>
                {action.note && (
                    <div className="mt-4 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5 text-left">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Note to save</p>
                        <p className="mt-1 line-clamp-3 text-xs leading-5 text-foreground">{action.note}</p>
                    </div>
                )}
                <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
                    <button
                        type="button"
                        disabled={busy}
                        onClick={onConfirm}
                        className={[
                            "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold disabled:opacity-60",
                            destructive
                                ? "bg-destructive text-destructive-foreground shadow-md shadow-destructive/20 transition hover:bg-destructive/90"
                                : "btn-premium",
                        ].join(" ")}
                    >
                        {busy && <LoaderCircle size={15} className="animate-spin" />}
                        {copy.confirm}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-border px-5 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                        Keep as is
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

const AssignedRequests = () => {
    const { data, loading, error, reload } = useApiData("/assignments/me");
    const [busyId, setBusyId] = useState("");
    const [savingNote, setSavingNote] = useState(false);
    const [actionError, setActionError] = useState("");
    const [notice, setNotice] = useState("");
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("all");
    const [sort, setSort] = useState("newest");
    const [view, setView] = useState("grid");
    const [selectedId, setSelectedId] = useState("");
    const [note, setNote] = useState("");
    const [action, setAction] = useState(null);

    const items = useMemo(() => data?.items || [], [data]);

    const counts = useMemo(() => {
        const result = { all: items.length, active: 0, completed: 0, cancelled: 0, urgent: 0 };
        items.forEach((item) => {
            if (result[item.status] !== undefined) result[item.status] += 1;
            if (item.status === "active" && ["urgent", "critical"].includes(String(requestOf(item).urgency || ""))) {
                result.urgent += 1;
            }
        });
        return result;
    }, [items]);

    const visible = useMemo(() => {
        const term = query.trim().toLowerCase();
        const list = items.filter((item) => {
            const request = requestOf(item);
            if (status !== "all" && item.status !== status) return false;
            if (!term) return true;
            return [
                request.patientName,
                request.hospitalName,
                request.bloodGroup,
                request.district?.nameEn,
                request.upazila?.nameEn,
                item.status,
                item.notes,
            ].some((value) => String(value ?? "").toLowerCase().includes(term));
        });

        const time = (value) => {
            const parsed = new Date(value).getTime();
            return Number.isNaN(parsed) ? 0 : parsed;
        };

        return [...list].sort((a, b) => {
            const ra = requestOf(a);
            const rb = requestOf(b);
            if (sort === "oldest") return time(a.createdAt) - time(b.createdAt);
            if (sort === "needed") return time(ra.neededAt) - time(rb.neededAt);
            if (sort === "priority") {
                const diff = (priorityRank[rb.urgency] || 0) - (priorityRank[ra.urgency] || 0);
                if (diff) return diff;
            }
            return time(b.createdAt) - time(a.createdAt);
        });
    }, [items, query, status, sort]);

    const selected = items.find((item) => item._id === selectedId) || null;
    const hasFilters = Boolean(query) || status !== "all" || sort !== "newest";

    const clearFilters = () => {
        setQuery("");
        setStatus("all");
        setSort("newest");
    };

    const openDetails = (id) => {
        const item = items.find((entry) => entry._id === id);
        setNote(item?.notes || "");
        setSelectedId(id);
    };

    const updateStatus = useCallback(
        async (id, nextStatus, notes) => {
            setActionError("");
            setNotice("");
            setBusyId(id);
            try {
                await apiFetch(`/assignments/${id}/status`, {
                    method: "PATCH",
                    body: { status: nextStatus, notes },
                });
                setNotice(
                    nextStatus === "completed"
                        ? "Assignment marked as completed."
                        : nextStatus === "cancelled"
                            ? "Assignment cancelled."
                            : "Assignment reopened."
                );
                setAction(null);
                reload();
            } catch (err) {
                setActionError(err.message);
            } finally {
                setBusyId("");
            }
        },
        [reload]
    );

    const saveNote = async () => {
        if (!selected) return;
        setActionError("");
        setNotice("");
        setSavingNote(true);
        try {
            await apiFetch(`/assignments/${selected._id}/status`, {
                method: "PATCH",
                body: { status: selected.status, notes: note },
            });
            setNotice("Note saved.");
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setSavingNote(false);
        }
    };

    useEffect(() => {
        if (!notice) return undefined;
        const timer = setTimeout(() => setNotice(""), 5000);
        return () => clearTimeout(timer);
    }, [notice]);

    useEffect(() => {
        if (!selectedId && !action) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKeyDown = (event) => {
            if (event.key !== "Escape") return;
            if (action) setAction(null);
            else setSelectedId("");
        };
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [selectedId, action]);

    return (
        <>
            <PageHeader
                title="My assignments"
                subtitle="Requests assigned to you for coordination and verification."
                actions={
                    <Link to="/dashboard/queue" className="btn-premium h-10 px-4 text-sm">
                        <ShieldCheck size={16} /> Verification queue <ArrowUpRight size={14} />
                    </Link>
                }
            />

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard icon={Activity} label="Active now" value={counts.active} hint="Assignments in progress" tone="primary" />
                <StatCard icon={BadgeCheck} label="Completed" value={counts.completed} hint="Successfully closed" tone="success" />
                <StatCard icon={Timer} label="Needs attention" value={counts.urgent} hint="Urgent or critical requests" tone="warning" />
                <StatCard icon={ClipboardList} label="All time" value={counts.all} hint="Total assignments" tone="violet" />
            </div>

            <ErrorBanner message={error || actionError} />
            {notice && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm font-semibold text-success-deep">
                    <Sparkles size={16} /> {notice}
                </div>
            )}

            {!loading && !items.length ? (
                <EmptyState
                    icon={ClipboardList}
                    title="No assignments yet"
                    text="When an admin assigns you a request, it will appear here. You can also claim a request from the verification queue."
                    action={
                        <Link to="/dashboard/queue" className="btn-premium h-10 px-5 text-sm">
                            Open verification queue
                        </Link>
                    }
                />
            ) : (
                <>
                    <div className="mb-5 rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-card/70 sm:p-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <label className="relative block flex-1">
                                    <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="search"
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder="Search patient, hospital, group or area…"
                                        aria-label="Search assignments"
                                        className="h-11 w-full rounded-xl border border-border/70 bg-background/60 pr-4 pl-10 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    />
                                </label>
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={sort}
                                        onChange={(event) => setSort(event.target.value)}
                                        aria-label="Sort assignments"
                                        className="w-full min-w-[9.5rem] sm:w-40"
                                    >
                                        {SORT_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </Select>
                                    <button
                                        type="button"
                                        onClick={reload}
                                        disabled={loading}
                                        aria-label="Refresh assignments"
                                        title="Refresh"
                                        className="grid size-11 shrink-0 place-items-center rounded-xl border border-border/70 bg-background/60 text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:opacity-60"
                                    >
                                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                    </button>
                                    <div className="flex h-11 w-24 shrink-0 items-center gap-0.5 rounded-xl border border-border/70 bg-background/60 p-1">
                                        {[
                                            { value: "grid", icon: LayoutGrid, label: "Grid view" },
                                            { value: "list", icon: List, label: "List view" },
                                        ].map(({ value, icon: Icon, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setView(value)}
                                                aria-label={label}
                                                aria-pressed={view === value}
                                                title={label}
                                                className={`grid h-full min-w-0 flex-1 place-items-center rounded-lg transition ${view === value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                                            >
                                                <Icon size={15} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
                                    {STATUS_FILTERS.map((filter) => {
                                        const active = status === filter.value;
                                        return (
                                            <button
                                                key={filter.value}
                                                type="button"
                                                onClick={() => setStatus(filter.value)}
                                                aria-pressed={active}
                                                className={[
                                                    "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition",
                                                    active
                                                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                                                        : "border border-border/70 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                                                ].join(" ")}
                                            >
                                                {filter.label}
                                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-primary-foreground/20" : "bg-muted"}`}>
                                                    {counts[filter.value]}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                                    <span>{visible.length} {visible.length === 1 ? "result" : "results"}</span>
                                    {hasFilters && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="rounded-lg border border-border px-2.5 py-1 font-bold transition hover:border-primary hover:text-primary"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                            {[1, 2, 3, 4].map((key) => (
                                <div key={key} className="animate-pulse rounded-2xl border border-border/70 bg-card/70 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 rounded-2xl bg-muted" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3.5 w-2/3 rounded bg-muted" />
                                            <div className="h-2.5 w-1/2 rounded bg-muted" />
                                        </div>
                                    </div>
                                    <div className="mt-5 h-5 w-3/4 rounded bg-muted" />
                                    <div className="mt-3 h-2.5 w-full rounded bg-muted" />
                                    <div className="mt-6 h-9 rounded-xl bg-muted" />
                                </div>
                            ))}
                        </div>
                    ) : visible.length === 0 ? (
                        <EmptyState
                            icon={Search}
                            title="No assignments match"
                            text="Try a different search term or clear the filters to see all of your assignments."
                            action={
                                <button type="button" onClick={clearFilters} className="btn-premium h-10 px-5 text-sm">
                                    Clear filters
                                </button>
                            }
                        />
                    ) : (
                        <div className={view === "grid" ? "grid gap-4 md:grid-cols-2 2xl:grid-cols-3" : "grid gap-3"}>
                            {visible.map((item) => (
                                <AssignmentCard
                                    key={item._id}
                                    item={item}
                                    view={view}
                                    busy={busyId === item._id}
                                    onDetails={openDetails}
                                    onStatus={setAction}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {selected && (
                <DetailsModal
                    item={selected}
                    note={note}
                    onNoteChange={setNote}
                    onSaveNote={saveNote}
                    onClose={() => setSelectedId("")}
                    onStatus={(payload) => setAction(payload)}
                    busy={busyId === selected._id}
                    savingNote={savingNote}
                />
            )}

            {action && (
                <ConfirmModal
                    action={action}
                    busy={busyId === action.id}
                    onClose={() => setAction(null)}
                    onConfirm={() => updateStatus(action.id, action.status, action.note)}
                />
            )}
        </>
    );
};

export default AssignedRequests;
