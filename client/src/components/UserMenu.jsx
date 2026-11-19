import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    Bell,
    ChevronDown,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    ShieldCheck,
    UserRound,
    Users,
} from "lucide-react";
import { useAuth } from "../context/useAuth";

const UserMenu = ({ onNavigate, align = "right" }) => {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const onPointerDown = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        const onKeyDown = (event) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    if (!user) return null;

    const isStaff = user.role === "admin" || user.role === "moderator";
    const isVolunteer = user.role === "volunteer";
    const roleLabel = isStaff ? "Admin" : isVolunteer ? "Volunteer" : "Donor";

    const links = [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        ...(isStaff
            ? [
                  { to: "/dashboard/admin/users", label: "Users & approvals", icon: Users },
                  { to: "/dashboard/admin/requests", label: "All requests", icon: ShieldCheck },
              ]
            : isVolunteer
                ? [
                      { to: "/dashboard/assignments", label: "My assignments", icon: ClipboardList },
                      { to: "/dashboard/queue", label: "Verification queue", icon: ShieldCheck },
                  ]
                : [
                      { to: "/dashboard/profile", label: "My profile", icon: UserRound },
                      { to: "/dashboard/my-requests", label: "My requests", icon: ClipboardList },
                  ]),
        { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
    ];

    const close = () => {
        setOpen(false);
        onNavigate?.();
    };

    const handleLogout = async () => {
        await logout();
        close();
    };

    const initials = user.fullName?.slice(0, 2).toUpperCase() || "BC";

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-card pl-1 pr-2.5 text-foreground outline-none transition hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/30"
            >
                <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {initials}
                </span>
                <span className="hidden max-w-[110px] truncate text-[13px] font-semibold sm:inline">
                    {user.fullName.split(" ")[0]}
                </span>
                <ChevronDown
                    size={14}
                    className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div
                    role="menu"
                    className={`absolute top-[calc(100%+0.6rem)] z-50 w-60 rounded-2xl border border-border bg-card p-2 shadow-xl ${
                        align === "left" ? "left-0" : "right-0"
                    }`}
                >
                    <div className="border-b border-border px-3 py-2.5">
                        <p className="truncate text-sm font-bold text-foreground">{user.fullName}</p>
                        <p className="truncate text-xs capitalize text-muted-foreground">
                            {roleLabel} {user.email ? `· ${user.email}` : ""}
                        </p>
                    </div>

                    <div className="py-1">
                        {links.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                role="menuitem"
                                onClick={close}
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                            >
                                <Icon size={16} className="text-primary" />
                                {label}
                            </Link>
                        ))}
                    </div>

                    <div className="border-t border-border pt-1">
                        <button
                            type="button"
                            role="menuitem"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                        >
                            <LogOut size={16} />
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
