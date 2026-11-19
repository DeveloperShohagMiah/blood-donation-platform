import { t } from "../../utils/tr.js";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    Bell,
    CalendarDays,
    ExternalLink,
    ChevronLeft,
    ClipboardList,
    Droplets,
    FileClock,
    HeartHandshake,
    Images,
    LayoutDashboard,
    LogOut,
    Menu,
    Megaphone,
    ShieldCheck,
    UserCog,
    UserRound,
    Users,
    X,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { apiFetch } from "../../utils/api";
import UserMenu from "../../components/UserMenu";

const donorNav = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/profile", label: "My profile", icon: UserRound },
    { to: "/dashboard/my-requests", label: "My requests", icon: Droplets },
    { to: "/dashboard/matching", label: "Matching requests", icon: HeartHandshake },
    { to: "/dashboard/donations", label: "Donation history", icon: CalendarDays },
    { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const volunteerNav = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/assignments", label: "My assignments", icon: ClipboardList },
    { to: "/dashboard/queue", label: "Verification queue", icon: ShieldCheck },
    { to: "/dashboard/volunteer-profile", label: "Volunteer profile", icon: UserCog },
    { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const adminNav = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/admin/users", label: "Users & approvals", icon: Users },
    { to: "/dashboard/admin/requests", label: "All requests", icon: Droplets },
    { to: "/dashboard/admin/contact-requests", label: "Contact requests", icon: HeartHandshake },
    { to: "/dashboard/admin/campaigns", label: "Campaigns", icon: Megaphone },
    { to: "/dashboard/admin/gallery", label: "Gallery", icon: Images },
    { to: "/dashboard/admin/donations", label: "Donations", icon: CalendarDays },
    { to: "/dashboard/admin/audit", label: "Audit log", icon: FileClock },
    { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [unread, setUnread] = useState(0);

    const isAdmin = user?.role === "admin" || user?.role === "moderator";
    const isVolunteer = user?.role === "volunteer";
    const navItems = isAdmin ? adminNav : isVolunteer ? volunteerNav : donorNav;
    const roleLabel = isAdmin ? "Admin" : isVolunteer ? "Volunteer" : "Donor";

    const activeLabel =
        navItems.find((item) =>
            item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to)
        )?.label || "Dashboard";

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await apiFetch("/notifications");
                if (active) {
                    setUnread((data?.items || []).filter((n) => !n.readAt).length);
                }
            } catch {
                // Notifications are non-critical for the shell.
            }
        })();
        return () => {
            active = false;
        };
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const sidebarContent = (mobile = false) => (
        <>
            <div className="flex h-16 items-center gap-2.5 border-b border-background/10 px-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <Droplets size={19} strokeWidth={2.5} />
                </span>
                {(!collapsed || mobile) && (
                    <span className="text-[17px] font-extrabold tracking-tight whitespace-nowrap">
                        Blood <span className="text-brand-light">{t("text.Connect")}</span>
                    </span>
                )}
                {mobile && (
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close menu"
                        className="ml-auto grid size-9 place-items-center rounded-lg text-primary-foreground/70 hover:bg-card/10"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                <div>
                    {(!collapsed || mobile) && (
                        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground/40">
                            {roleLabel} workspace
                        </p>
                    )}
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        end={item.end}
                                        onClick={() => setMobileOpen(false)}
                                        title={collapsed && !mobile ? item.label : undefined}
                                        className={({ isActive }) =>
                                            [
                                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/30",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                                    : "text-primary-foreground/65 hover:bg-card/10 hover:text-primary-foreground",
                                            ].join(" ")
                                        }
                                    >
                                        <Icon size={18} className="shrink-0" />
                                        {(!collapsed || mobile) && (
                                            <span className="truncate">{item.label}</span>
                                        )}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>

            <div className="border-t border-background/10 p-3">
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={collapsed && !mobile ? "View website" : undefined}
                    className="mb-2 flex items-center gap-2.5 rounded-xl border border-background/10 px-3 py-2.5 text-sm font-semibold text-primary-foreground/75 transition hover:border-primary/40 hover:bg-card/5 hover:text-primary-foreground"
                >
                    <ExternalLink size={16} className="shrink-0" />
                    {(!collapsed || mobile) && "View website"}
                </a>
                <div className="flex items-center gap-3 rounded-xl bg-card/5 p-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card/10 text-xs font-bold text-primary-foreground">
                        {user?.fullName?.slice(0, 2).toUpperCase() || "BC"}
                    </span>
                    {(!collapsed || mobile) && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-primary-foreground">{user?.fullName}</p>
                            <p className="text-[11px] capitalize text-primary-foreground/50">{roleLabel}</p>
                        </div>
                    )}
                    {(!collapsed || mobile) && (
                        <button
                            type="button"
                            onClick={handleLogout}
                            title="Log out"
                            aria-label="Log out"
                            className="grid size-8 place-items-center rounded-lg text-primary-foreground/60 transition hover:bg-card/10 hover:text-primary-foreground"
                        >
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-surface-alt">
            <aside
                className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-background/10 bg-foreground text-primary-foreground transition-[width] duration-300 lg:flex ${collapsed ? "w-[76px]" : "w-[260px]"}`}
            >
                {sidebarContent()}
                <button
                    type="button"
                    onClick={() => setCollapsed((value) => !value)}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="absolute -right-3 top-20 grid size-6 place-items-center rounded-full border border-background/10 bg-foreground text-primary-foreground/70 shadow-md transition hover:text-primary-foreground"
                >
                    <ChevronLeft size={14} className={collapsed ? "rotate-180" : ""} />
                </button>
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setMobileOpen(false)}
                        className="absolute inset-0 bg-overlay backdrop-blur-sm"
                    />
                    <aside className="absolute inset-y-0 left-0 flex w-[270px] flex-col bg-foreground text-primary-foreground shadow-2xl">
                        {sidebarContent(true)}
                    </aside>
                </div>
            )}

            <div className={`transition-[padding] duration-300 ${collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"}`}>
                <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur sm:px-6">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                        className="grid size-10 place-items-center rounded-lg text-foreground transition hover:bg-muted lg:hidden"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {roleLabel} dashboard
                        </p>
                        <h2 className="truncate text-base font-extrabold text-foreground">
                            {activeLabel}
                        </h2>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Link
                            to="/dashboard/notifications"
                            aria-label="Notifications"
                            className="relative grid size-10 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                            <Bell size={19} />
                            {unread > 0 && (
                                <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                                    {unread > 9 ? "9+" : unread}
                                </span>
                            )}
                        </Link>
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="View website (opens in new tab)"
                            title="View website"
                            className="hidden size-10 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-primary sm:grid"
                        >
                            <ExternalLink size={18} />
                        </a>
                        <UserMenu />
                    </div>
                </header>

                <main className="animate-rise mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
