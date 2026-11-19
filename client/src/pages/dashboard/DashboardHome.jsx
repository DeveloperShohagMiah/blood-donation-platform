import { t } from "../../utils/tr.js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Bell,
    CalendarDays,
    ClipboardList,
    Droplets,
    HeartHandshake,
    ShieldCheck,
    UserRound,
    Users,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { apiFetch } from "../../utils/api";
import { EmptyState, ErrorBanner, PageHeader, StatCard } from "./components/UI";
import { formatDate } from "./format";

const quickLinks = {
    donor: [
        { to: "/dashboard/profile", label: "Edit my profile", icon: UserRound },
        { to: "/dashboard/matching", label: "Find matching requests", icon: HeartHandshake },
        { to: "/create-blood-requests", label: "Create a request", icon: Droplets },
    ],
    volunteer: [
        { to: "/dashboard/assignments", label: "My assignments", icon: ClipboardList },
        { to: "/dashboard/queue", label: "Verification queue", icon: ShieldCheck },
        { to: "/dashboard/volunteer-profile", label: "Availability settings", icon: UserRound },
    ],
    admin: [
        { to: "/dashboard/admin/users", label: "Review accounts", icon: Users },
        { to: "/dashboard/admin/requests", label: "Manage requests", icon: Droplets },
        { to: "/dashboard/admin/campaigns", label: "Campaigns", icon: CalendarDays },
    ],
};

const DashboardHome = () => {
    const { user } = useAuth();
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isAdmin = user?.role === "admin" || user?.role === "moderator";
    const isVolunteer = user?.role === "volunteer";
    const role = isAdmin ? "admin" : isVolunteer ? "volunteer" : "donor";

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                if (isAdmin) {
                    const stats = await apiFetch("/admin/stats");
                    if (active) setData({ stats });
                } else if (isVolunteer) {
                    const [assignments, requests, notifications] = await Promise.all([
                        apiFetch("/assignments/me"),
                        apiFetch("/blood-requests"),
                        apiFetch("/notifications"),
                    ]);
                    if (active) {
                        setData({
                            assignments: assignments?.items || [],
                            requests: requests?.items || [],
                            notifications: notifications?.items || [],
                        });
                    }
                } else {
                    const [profile, requests, donations, notifications] = await Promise.all([
                        apiFetch("/donors/me"),
                        apiFetch("/blood-requests"),
                        apiFetch("/donations/me"),
                        apiFetch("/notifications"),
                    ]);
                    if (active) {
                        setData({
                            profile: profile?.profile || null,
                            requests: requests?.items || [],
                            donations: donations?.items || [],
                            notifications: notifications?.items || [],
                        });
                    }
                }
            } catch (err) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [isAdmin, isVolunteer]);

    const stats = data.stats;
    const cards = isAdmin
        ? [
            {
                label: "Total users",
                value: stats?.users?.total,
                hint: `${stats?.users?.byStatus?.pending || 0} awaiting approval`,
                icon: Users,
                tone: "primary",
            },
            {
                label: "Blood requests",
                value: stats?.requests?.total,
                hint: `${stats?.requests?.byStatus?.submitted || 0} submitted`,
                icon: Droplets,
                tone: "info",
            },
            {
                label: "Available donors",
                value: stats?.availableDonors,
                icon: HeartHandshake,
                tone: "success",
            },
            {
                label: "Active assignments",
                value: stats?.activeAssignments,
                icon: ClipboardList,
                tone: "violet",
            },
        ]
        : isVolunteer
            ? [
                {
                    label: "My assignments",
                    value: data.assignments?.length,
                    hint: "Requests assigned to you",
                    icon: ClipboardList,
                    tone: "primary",
                },
                {
                    label: "Open requests",
                    value: (data.requests || []).filter((r) =>
                        ["verified", "matching", "in_progress"].includes(r.status)
                    ).length,
                    icon: Droplets,
                    tone: "info",
                },
                {
                    label: "Unread alerts",
                    value: (data.notifications || []).filter((n) => !n.readAt).length,
                    icon: Bell,
                    tone: "warning",
                },
            ]
            : [
                {
                    label: "My requests",
                    value: data.requests?.length,
                    icon: Droplets,
                    tone: "primary",
                },
                {
                    label: "Donations made",
                    value: data.donations?.length,
                    icon: HeartHandshake,
                    tone: "success",
                },
                {
                    label: "Unread alerts",
                    value: (data.notifications || []).filter((n) => !n.readAt).length,
                    icon: Bell,
                    tone: "warning",
                },
            ];

    const recent = (data.notifications || []).slice(0, 4);
    const showProfileWarning = !isAdmin && !isVolunteer && !loading && !data.profile;

    return (
        <>
            <PageHeader
                title={`Welcome back, ${user?.fullName?.split(" ")[0] || "there"}`}
                subtitle="Here's what's happening across Blood Connect today."
            />

            <ErrorBanner message={error} />

            {showProfileWarning && (
                <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-bold text-warning">{t("text.Complete your donor profile")}</p>
                        <p className="mt-1 text-sm text-warning">
                            Add your blood group and location so people nearby can find you.
                        </p>
                    </div>
                    <Link
                        to="/dashboard/profile"
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-warning px-4 text-sm font-bold text-primary-foreground transition hover:bg-warning"
                    >
                        Set up profile <ArrowRight size={15} />
                    </Link>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <StatCard key={card.label} {...card} />
                ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                    <h3 className="font-extrabold text-foreground">{t("text.Quick actions")}</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {quickLinks[role].map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="group flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                                >
                                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                                        <Icon size={19} />
                                    </span>
                                    <span className="text-sm font-bold text-foreground">
                                        {link.label}
                                    </span>
                                    <ArrowRight
                                        size={15}
                                        className="text-muted-foreground transition-transform group-hover:translate-x-1"
                                    />
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-foreground">{t("text.Recent activity")}</h3>
                        <Link
                            to="/dashboard/notifications"
                            className="text-xs font-bold text-primary hover:underline"
                        >
                            View all
                        </Link>
                    </div>

                    {recent.length ? (
                        <ul className="mt-4 space-y-3">
                            {recent.map((item) => (
                                <li key={item._id} className="flex gap-3 rounded-xl bg-muted/40 p-3">
                                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                                        <Bell size={15} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-foreground">{item.title}</p>
                                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                            {item.message}
                                        </p>
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            {formatDate(item.createdAt)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="mt-4">
                            <EmptyState
                                icon={Bell}
                                title="Nothing new yet"
                                text="Updates about your requests and profile will appear here."
                            />
                        </div>
                    )}
                </section>
            </div>
        </>
    );
};

export default DashboardHome;
