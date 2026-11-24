import { t } from "../../utils/tr.js";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    ArrowUpRight,
    BarChart3,
    Bell,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ClipboardList,
    Droplets,
    ExternalLink,
    FileClock,
    HeartHandshake,
    Images,
    LayoutDashboard,
    LogOut,
    Megaphone,
    Menu,
    Palette,
    Settings2,
    ShieldCheck,
    UserCog,
    UserRound,
    Users,
    X,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { apiFetch } from "../../utils/api";
import UserMenu from "../../components/UserMenu";

const settingsItems = [
    { to: "/dashboard/settings", label: "Appearance", icon: Palette },
    { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const donorSections = [
    {
        label: "Workspace",
        items: [
            { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
            { to: "/dashboard/my-requests", label: "My requests", icon: Droplets },
            { to: "/dashboard/matching", label: "Matching requests", icon: HeartHandshake },
            { to: "/dashboard/donations", label: "Donation history", icon: CalendarDays },
        ],
    },
    { label: "Account", items: [{ to: "/dashboard/profile", label: "My profile", icon: UserRound }] },
    { label: "Settings", icon: Settings2, children: settingsItems },
];

const volunteerSections = [
    {
        label: "Workspace",
        items: [
            { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
            { to: "/dashboard/assignments", label: "My assignments", icon: ClipboardList },
            { to: "/dashboard/queue", label: "Verification queue", icon: ShieldCheck },
        ],
    },
    { label: "Account", items: [{ to: "/dashboard/volunteer-profile", label: "Volunteer profile", icon: UserCog }] },
    { label: "Settings", icon: Settings2, children: settingsItems },
];

const adminSections = [
    {
        label: "Workspace",
        items: [
            { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
            { to: "/dashboard/admin/requests", label: "All requests", icon: Droplets },
            { to: "/dashboard/admin/contact-requests", label: "Contact requests", icon: HeartHandshake },
            { to: "/dashboard/admin/campaigns", label: "Campaigns", icon: Megaphone },
            { to: "/dashboard/admin/gallery", label: "Gallery", icon: Images },
            { to: "/dashboard/admin/donations", label: "Donations", icon: CalendarDays },
        ],
    },
    {
        label: "Manage",
        items: [
            { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
            { to: "/dashboard/admin/users", label: "Users & approvals", icon: Users },
            { to: "/dashboard/admin/audit", label: "Audit log", icon: FileClock },
        ],
    },
    { label: "Settings", icon: Settings2, children: settingsItems },
];

const navLinkClass = ({ isActive }) =>
    [
        "relative flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold",
        "text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        "[&.is-active_svg]:text-primary",
        isActive ? "is-active bg-muted font-bold text-foreground" : "",
    ].join(" ");

const subLinkClass = ({ isActive }) =>
    [
        "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold",
        "text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground",
        "[&.is-active_svg]:text-primary",
        isActive ? "is-active bg-muted font-bold text-foreground" : "",
    ].join(" ");

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const [openGroups, setOpenGroups] = useState({
        Workspace: true,
        Manage: true,
        Account: true,
        Settings: false,
    });

    const isAdmin = user?.role === "admin" || user?.role === "moderator";
    const isVolunteer = user?.role === "volunteer";
    const sections = isAdmin ? adminSections : isVolunteer ? volunteerSections : donorSections;
    const navItems = sections
        .flatMap((section) => section.children || (section.items || []).map((item) => item.children || item))
        .flat();
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

    useEffect(() => {
        if (!mobileOpen) return undefined;
        const onKey = (event) => event.key === "Escape" && setMobileOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [mobileOpen]);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const toggleGroup = (label) =>
        setOpenGroups((current) => ({ ...current, [label]: !current[label] }));

    const sidebarContent = (mobile = false) => {
        const showLabels = !collapsed || mobile;

        return (
            <div className="flex h-full min-h-0 flex-col">
                {/* Brand */}
                <Link
                    to="/"
                    title="Blood Connect"
                    className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4"
                >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-lg shadow-primary/25">
                        <Droplets size={18} strokeWidth={2.5} />
                    </span>
                    {showLabels && (
                        <span className="min-w-0 font-display text-sm font-extrabold tracking-tight text-foreground">
                            Blood <span className="text-primary">{t("text.Connect")}</span>
                            <span className="mt-0.5 block text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                {roleLabel} workspace
                            </span>
                        </span>
                    )}
                    {mobile && (
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            aria-label="Close menu"
                            className="ml-auto grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <X size={17} />
                        </button>
                    )}
                </Link>

                {/* Navigation */}
                <nav
                    aria-label="Dashboard navigation"
                    className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
                >
                    {sections.map((section, index) => {
                        const open = openGroups[section.label] !== false;
                        const SectionIcon = section.icon;

                        return (
                            <div key={section.label} className={index > 0 ? "mt-4" : ""}>
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(section.label)}
                                    aria-expanded={open}
                                    className="flex h-8 w-full items-center justify-between rounded-lg px-3 text-[10px] font-extrabold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
                                >
                                    <span>{showLabels ? section.label : "•••"}</span>
                                    {showLabels && (
                                        <ChevronDown
                                            size={12}
                                            className={`transition-transform duration-200 ${
                                                open ? "" : "-rotate-90"
                                            }`}
                                        />
                                    )}
                                </button>

                                {open && section.children && (
                                    <ul className="mt-1 grid gap-0.5">
                                        <li className="flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-foreground">
                                            <SectionIcon size={17} className="shrink-0 text-primary" />
                                            {showLabels && (
                                                <span className="min-w-0 flex-1 truncate">
                                                    {section.label}
                                                </span>
                                            )}
                                        </li>
                                    </ul>
                                )}

                                {open && section.children && (
                                    <ul className="mt-1 grid gap-0.5 ml-5 border-l border-border pl-3">
                                        {section.children.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <li key={item.to}>
                                                    <NavLink
                                                        to={item.to}
                                                        onClick={() => setMobileOpen(false)}
                                                        title={showLabels ? undefined : item.label}
                                                        className={subLinkClass}
                                                    >
                                                        <Icon size={15} className="shrink-0" />
                                                        {showLabels && (
                                                            <span className="min-w-0 flex-1 truncate">
                                                                {item.label}
                                                            </span>
                                                        )}
                                                    </NavLink>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}

                                {open && !section.children && (
                                    <ul className="mt-1 grid gap-0.5">
                                        {section.items.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <li key={item.to}>
                                                    <NavLink
                                                        to={item.to}
                                                        end={item.end}
                                                        onClick={() => setMobileOpen(false)}
                                                        title={showLabels ? undefined : item.label}
                                                        className={navLinkClass}
                                                    >
                                                        <Icon size={17} className="shrink-0" />
                                                        {showLabels && (
                                                            <span className="min-w-0 flex-1 truncate">
                                                                {item.label}
                                                            </span>
                                                        )}
                                                        {showLabels && item.badge && unread > 0 && (
                                                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                                                                {unread > 9 ? "9+" : unread}
                                                            </span>
                                                        )}
                                                    </NavLink>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="shrink-0 border-t border-border p-3">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={showLabels ? undefined : "View website"}
                        className="flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <ExternalLink size={16} className="shrink-0" />
                        {showLabels && <span className="min-w-0 flex-1">View website</span>}
                        {showLabels && <ArrowUpRight size={13} className="shrink-0" />}
                    </a>

                    <div className="mt-1 flex items-center gap-3 rounded-xl border border-border bg-muted p-2">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-[11px] font-extrabold text-primary">
                            {user?.fullName?.slice(0, 2).toUpperCase() || "BC"}
                        </span>
                        {showLabels && (
                            <>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[13px] font-bold text-foreground">
                                        {user?.fullName}
                                    </span>
                                    <span className="block text-[11px] text-muted-foreground capitalize">
                                        {roleLabel}
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    title="Log out"
                                    aria-label="Log out"
                                    className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-destructive"
                                >
                                    <LogOut size={15} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-surface-alt">
            <aside
                className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-card text-foreground transition-[width] duration-300 lg:flex ${
                    collapsed ? "w-[76px]" : "w-[250px]"
                }`}
            >
                {sidebarContent()}
                <button
                    type="button"
                    onClick={() => setCollapsed((value) => !value)}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="absolute -right-3 top-[4.6rem] z-10 grid size-6 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:text-primary"
                >
                    <ChevronLeft size={13} className={collapsed ? "rotate-180" : ""} />
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
                    <aside className="absolute inset-y-0 left-0 flex w-[270px] flex-col bg-card text-foreground shadow-2xl">
                        {sidebarContent(true)}
                    </aside>
                </div>
            )}

            <div
                className={`transition-[padding] duration-300 ${
                    collapsed ? "lg:pl-[76px]" : "lg:pl-[250px]"
                }`}
            >
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
