import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    Bell,
    CalendarDays,
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
            <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25">
                    <Droplets size={19} strokeWidth={2.5} />
                </span>
                {(!collapsed || mobile) && (
                    <span className="text-[17px] font-extrabold tracking-tight whitespace-nowrap">
                        Blood <span className="text-[#F26A77]">Connect</span>
                    </span>
                )}
                {mobile && (
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close menu"
                        className="ml-auto grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                <div>
                    {(!collapsed || mobile) && (
                        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
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
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                                                isActive
                                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                                    : "text-white/65 hover:bg-white/10 hover:text-white",
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

            <div className="border-t border-white/10 p-3">
                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
                        {user?.fullName?.slice(0, 2).toUpperCase() || "BC"}
                    </span>
                    {(!collapsed || mobile) && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-white">{user?.fullName}</p>
                            <p className="text-[11px] capitalize text-white/50">{roleLabel}</p>
                        </div>
                    )}
                    {(!collapsed || mobile) && (
                        <button
                            type="button"
                            onClick={handleLogout}
                            title="Log out"
                            aria-label="Log out"
                            className="grid size-8 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
                        >
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-[#F7F8FA]">
            <aside
                className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/10 bg-[#101827] text-white transition-[width] duration-300 lg:flex ${collapsed ? "w-[76px]" : "w-[260px]"}`}
            >
                {sidebarContent()}
                <button
                    type="button"
                    onClick={() => setCollapsed((value) => !value)}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="absolute -right-3 top-20 grid size-6 place-items-center rounded-full border border-white/10 bg-[#101827] text-white/70 shadow-md transition hover:text-white"
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
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />
                    <aside className="absolute inset-y-0 left-0 flex w-[270px] flex-col bg-[#101827] text-white shadow-2xl">
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
                                <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                                    {unread > 9 ? "9+" : unread}
                                </span>
                            )}
                        </Link>
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
