import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
    ArrowUpRight,
    Bell,
    CalendarDays,
    CheckCheck,
    ClipboardList,
    Droplets,
    HeartHandshake,
    Megaphone,
    UserRound,
} from "lucide-react";
import { apiFetch } from "../../utils/api";
import { useApiData } from "./hooks";
import { formatDate, formatDateTime } from "./format";
import { EmptyState, ErrorBanner, PageHeader } from "./components/UI";

const typeConfig = {
    account: { icon: UserRound, tone: "violet", label: "Account" },
    request: { icon: Droplets, tone: "primary", label: "Request" },
    assignment: { icon: ClipboardList, tone: "info", label: "Assignment" },
    donation: { icon: HeartHandshake, tone: "success", label: "Donation" },
    campaign: { icon: Megaphone, tone: "warning", label: "Campaign" },
    system: { icon: Bell, tone: "muted", label: "System" },
};

const toneClasses = {
    primary: "bg-primary/10 text-primary ring-primary/15",
    success: "bg-success/10 text-success-deep ring-success/15",
    info: "bg-info/10 text-info ring-info/15",
    warning: "bg-warning/10 text-warning ring-warning/15",
    violet: "bg-violet/10 text-violet ring-violet/15",
    muted: "bg-muted text-muted-foreground ring-border",
};

const timeAgo = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    if (minutes < 10080) return `${Math.floor(minutes / 1440)}d ago`;
    return formatDate(value);
};

const groupLabel = (value) => {
    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return formatDate(value);
};

const StatPill = ({ value, label, tone = "primary", icon: Icon }) => (
    <div className="premium-card flex items-center gap-3 p-4">
        <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ring-1 ring-inset ${toneClasses[tone] || toneClasses.primary}`}>
            <Icon size={20} strokeWidth={2.1} />
        </span>
        <div className="min-w-0">
            <p className="font-display text-2xl leading-none font-extrabold tracking-tight text-foreground">
                {value}
            </p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
        </div>
    </div>
);

const Notifications = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data, loading, error, reload } = useApiData("/notifications");
    const [busy, setBusy] = useState(false);
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");
    const [readIds, setReadIds] = useState([]);
    const [filter, setFilter] = useState("all");

    const items = data?.items || [];
    const isRead = (item) => Boolean(item.readAt) || readIds.includes(item._id);
    const unreadCount = items.filter((item) => !isRead(item)).length;

    const filters = [
        { key: "all", label: t("text.All", "All"), count: items.length },
        { key: "unread", label: t("text.Unread", "Unread"), count: unreadCount },
        ...Object.entries(typeConfig).map(([key, config]) => ({
            key,
            label: config.label,
            count: items.filter((item) => item.type === key).length,
        })),
    ];

    const visible = useMemo(() => {
        if (filter === "all") return items;
        if (filter === "unread")
            return items.filter((item) => !item.readAt && !readIds.includes(item._id));
        return items.filter((item) => item.type === filter);
    }, [items, filter, readIds]);

    const groups = useMemo(() => {
        const result = [];
        visible.forEach((item) => {
            const label = groupLabel(item.createdAt);
            const existing = result.find((group) => group.label === label);
            if (existing) existing.items.push(item);
            else result.push({ label, items: [item] });
        });
        return result;
    }, [visible]);

    const markOne = async (id) => {
        setBusyId(id);
        setActionError("");
        try {
            await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
            setReadIds((current) => [...new Set([...current, id])]);
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    const markAll = async () => {
        setBusy(true);
        setActionError("");
        try {
            await apiFetch("/notifications/read-all", { method: "PATCH" });
            setReadIds(items.map((item) => item._id));
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const open = async (item) => {
        if (!isRead(item)) await markOne(item._id);
        if (item.link) navigate(item.link);
    };

    return (
        <>
            <PageHeader
                title={t("text.Notifications", "Notifications")}
                subtitle={t(
                    "text.Notifications subtitle",
                    "Updates about your requests, donations and assignments."
                )}
                actions={
                    unreadCount > 0 ? (
                        <button
                            type="button"
                            onClick={markAll}
                            disabled={busy}
                            className="btn-premium h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <CheckCheck size={16} />
                            {busy ? t("text.Updating…", "Updating…") : t("text.Mark all read", "Mark all read")}
                        </button>
                    ) : null
                }
            />

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <StatPill
                    value={unreadCount}
                    label={t("text.Unread", "Unread")}
                    tone="primary"
                    icon={Bell}
                />
                <StatPill
                    value={items.length}
                    label={t("text.Total", "Total")}
                    tone="info"
                    icon={CheckCheck}
                />
                <StatPill
                    value={groups.length || 0}
                    label={t("text.Days active", "Days active")}
                    tone="violet"
                    icon={CalendarDays}
                />
            </div>

            <ErrorBanner message={error || actionError} />

            {!loading && !items.length ? (
                <EmptyState
                    icon={Bell}
                    title={t("text.All caught up", "You're all caught up")}
                    text={t(
                        "text.Notifications empty",
                        "Notifications about your activity will show up here."
                    )}
                />
            ) : (
                <>
                    <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                        {filters.map((chip) => (
                            <button
                                key={chip.key}
                                type="button"
                                onClick={() => setFilter(chip.key)}
                                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-bold transition ${
                                    filter === chip.key
                                        ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                }`}
                            >
                                {chip.label}
                                <span
                                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                                        filter === chip.key
                                            ? "bg-white/20 text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {chip.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-card" />
                            ))}
                        </div>
                    ) : visible.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
                            {t("text.No notifications here", "No notifications in this category yet.")}
                        </div>
                    ) : (
                        <div className="space-y-7">
                            {groups.map((group) => (
                                <section key={group.label}>
                                    <div className="mb-3 flex items-center gap-3">
                                        <span className="eyebrow text-[10px]">{group.label}</span>
                                        <span className="h-px flex-1 bg-border" />
                                    </div>
                                    <div className="space-y-2.5">
                                        {group.items.map((item) => {
                                            const config = typeConfig[item.type] || typeConfig.system;
                                            const Icon = config.icon;
                                            const read = isRead(item);
                                            return (
                                                <article
                                                    key={item._id}
                                                    className={`premium-card group relative flex items-start gap-4 p-4 sm:p-5 ${
                                                        read ? "" : "border-primary/30 bg-primary/[0.02]"
                                                    }`}
                                                >
                                                    {!read && (
                                                        <span className="absolute right-4 top-4 size-2 rounded-full bg-primary ring-4 ring-primary/10" />
                                                    )}
                                                    <span
                                                        className={`grid size-11 shrink-0 place-items-center rounded-2xl ring-1 ring-inset ${toneClasses[config.tone] || toneClasses.muted}`}
                                                    >
                                                        <Icon size={20} strokeWidth={2.1} />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                            <h3 className="text-sm font-extrabold text-foreground">
                                                                {item.title}
                                                            </h3>
                                                            <Badge variant="secondary" className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                                                {config.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                            {item.message}
                                                        </p>
                                                        <div className="mt-2.5 flex flex-wrap items-center gap-3">
                                                            <span
                                                                className="text-[11px] font-medium text-muted-foreground"
                                                                title={formatDateTime(item.createdAt)}
                                                            >
                                                                {timeAgo(item.createdAt)}
                                                            </span>
                                                            {item.link && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => open(item)}
                                                                    className="inline-flex items-center gap-1 text-xs font-bold text-primary transition hover:gap-1.5"
                                                                >
                                                                    {t("text.View details", "View details")}
                                                                    <ArrowUpRight size={13} />
                                                                </button>
                                                            )}
                                                            {!read && (
                                                                <button
                                                                    type="button"
                                                                    disabled={busyId === item._id}
                                                                    onClick={() => markOne(item._id)}
                                                                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground transition hover:text-foreground disabled:opacity-50"
                                                                >
                                                                    <CheckCheck size={13} />
                                                                    {busyId === item._id
                                                                        ? t("text.Updating…", "Updating…")
                                                                        : t("text.Mark read", "Mark read")}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default Notifications;
