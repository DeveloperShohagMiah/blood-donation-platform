import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";
import UserMenu from "./UserMenu";
import LoginDialog from "./LoginDialog";
import {
    ArrowUpRight,
    Droplets,
    HeartPulse,
    Home,
    Info,
    LogIn,
    LogOut,
    Mail,
    Megaphone,
    Menu,
    Monitor,
    Moon,
    Palette,
    Search,
    Sun,
    X,
} from "lucide-react";

const navLinks = [
    { key: "home", path: "/", end: true, icon: Home },
    { key: "findDonors", path: "/donors", icon: Search },
    { key: "allRequests", path: "/blood-requests", icon: HeartPulse },
    { key: "campaigns", path: "/campaigns", icon: Megaphone },
    { key: "about", path: "/about", icon: Info },
    { key: "contact", path: "/contact", icon: Mail },
];

const THEME_MODES = [
    { key: "light", icon: Sun },
    { key: "dark", icon: Moon },
    { key: "system", icon: Monitor },
];

const ThemeSwitch = ({
    mode,
    onChange,
    label,
    lightLabel,
    darkLabel,
    systemLabel,
    className = "",
}) => {
    const activeIndex = Math.max(0, THEME_MODES.findIndex((item) => item.key === mode));
    const labels = { light: lightLabel, dark: darkLabel, system: systemLabel };

    return (
        <div
            role="group"
            aria-label={label}
            className={`relative grid h-9 w-[6.5rem] flex-none grid-cols-3 items-center rounded-full border border-border bg-[color-mix(in_srgb,var(--muted)_70%,var(--card))] p-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] ${className}`.trim()}
        >
            <span
                aria-hidden="true"
                className="absolute top-[3px] bottom-[3px] left-[3px] w-[calc((100%-6px)/3)] rounded-full bg-gradient-to-br from-[color-mix(in_srgb,var(--primary)_90%,#ffffff)] to-primary-hover shadow-[0_3px_10px_-3px_color-mix(in_srgb,var(--primary)_80%,transparent)] transition-[translate] duration-[380ms] ease-[var(--ease-premium)]"
                style={{ translate: `${activeIndex * 100}% 0` }}
            />

            {THEME_MODES.map(({ key, icon: Icon }) => (
                <button
                    key={key}
                    type="button"
                    aria-pressed={mode === key}
                    aria-label={labels[key]}
                    title={labels[key]}
                    onClick={() => onChange(key)}
                    className="relative z-10 grid size-full place-items-center rounded-full text-muted-foreground outline-none transition-colors duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-pressed:text-primary-foreground"
                >
                    <Icon size={15} strokeWidth={2.3} />
                </button>
            ))}
        </div>
    );
};

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hover, setHover] = useState({ left: 0, width: 0, visible: false });
    const listRef = useRef(null);
    const { t, i18n } = useTranslation();
    const { user, isAuthenticated, logout } = useAuth();
    const { mode, setMode } = useTheme();

    const currentLanguage = i18n.resolvedLanguage?.startsWith("bn") ? "BN" : "EN";

    const closeMenu = () => setMenuOpen(false);

    const changeLanguage = (language) => {
        const next = language === "BN" ? "bn" : "en";
        if (next === i18n.language) return;
        try {
            localStorage.setItem("bc:language", next);
        } catch {
            // Private browsing may block storage; the switch still applies this session.
        }
        i18n.changeLanguage(next).then(() => window.location.reload());
    };

    /* Condense the bar once the page scrolls */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* Escape to close, close when resized up to desktop */
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
        const onResize = () => window.innerWidth >= 768 && setMenuOpen(false);
        window.addEventListener("keydown", onKey);
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    /* Lock page scroll while the mobile menu is open */
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    /* Hover pill follows the pointer / keyboard focus */
    const moveHighlight = (e) => {
        const list = listRef.current?.getBoundingClientRect();
        const item = e.currentTarget.getBoundingClientRect();
        if (!list) return;
        setHover({ left: item.left - list.left, width: item.width, visible: true });
    };
    const hideHighlight = () => setHover((h) => ({ ...h, visible: false }));

    const desktopLinkClass = ({ isActive }) =>
        [
            "relative z-10 rounded-full px-3.5 py-2 text-[13.5px] font-semibold",
            "transition-colors duration-200 outline-none",
            "focus-visible:ring-2 focus-visible:ring-primary/40",
            "after:absolute after:-bottom-0.5 after:left-1/2 after:size-1",
            "after:-translate-x-1/2 after:rounded-full after:bg-primary",
            "after:transition-all after:duration-300",
            isActive
                ? "bg-primary/5 text-primary after:scale-100 after:opacity-100"
                : "text-muted-foreground hover:text-foreground after:scale-0 after:opacity-0",
        ].join(" ");

    const mobileLinkClass = ({ isActive }) =>
        [
            "group flex items-center gap-3 rounded-xl px-3 py-3",
            "text-[15px] font-semibold transition-colors duration-200",
            isActive
                ? "bg-primary/5 text-primary"
                : "text-foreground hover:bg-muted",
        ].join(" ");

    return (
        <>
            <header
                className={[
                    "sticky top-0 z-50 w-full border-b backdrop-blur-xl",
                    "transition-[background-color,border-color,box-shadow] duration-300",
                    scrolled
                        ? "border-border/70 bg-card/75 shadow-md supports-[backdrop-filter]:bg-card/70"
                        : "border-transparent bg-card",
                ].join(" ")}
            >
                <nav
                    className={[
                        "relative mx-auto flex w-[calc(100%-2rem)] max-w-[1280px]",
                        "items-center justify-between gap-4 md:w-[calc(100%-4rem)]",
                        "transition-[height] duration-300 motion-reduce:transition-none",
                        scrolled ? "h-16" : "h-[76px]",
                    ].join(" ")}
                    aria-label={t("navigation.mainNavigation")}
                >
                    {/* Brand */}
                    <Link
                        to="/"
                        onClick={closeMenu}
                        aria-label={t("navigation.home")}
                        className="group flex shrink-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <span
                            className={[
                                "relative grid place-items-center rounded-[14px]",
                                "bg-linear-to-br from-primary to-primary/80 text-primary-foreground",
                                "shadow-md ring-1 ring-background/25",
                                "transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105",
                                scrolled ? "size-10" : "size-11",
                            ].join(" ")}
                        >
                            <Droplets
                                size={22}
                                strokeWidth={2.5}
                                fill="var(--primary-foreground)" fillOpacity="0.18"
                            />
                        </span>

                        <span className="flex flex-col">
                            <span className="text-[20px] leading-none font-extrabold tracking-tight text-foreground">
                                Blood <span className="text-primary">{t("text.Connect")}</span>
                            </span>
                            <span
                                className={[
                                    "overflow-hidden text-[8px] font-bold tracking-[1.5px] text-muted-foreground",
                                    "transition-all duration-300",
                                    scrolled ? "mt-0 max-h-0 opacity-0" : "mt-1.5 max-h-3 opacity-100",
                                ].join(" ")}
                            >
                                {t("navigation.tagline")}
                            </span>
                        </span>
                    </Link>

                    {/* Desktop links */}
                    <div
                        ref={listRef}
                        onMouseLeave={hideHighlight}
                        onBlur={hideHighlight}
                        className="relative mx-auto hidden items-center gap-0.5 md:flex"
                    >
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 my-auto h-9 rounded-full bg-muted/40 transition-[transform,width,opacity] duration-300 ease-out motion-reduce:transition-none"
                            style={{
                                width: hover.width,
                                transform: `translateX(${hover.left}px)`,
                                opacity: hover.visible ? 1 : 0,
                            }}
                        />

                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.end}
                                onMouseEnter={moveHighlight}
                                onFocus={moveHighlight}
                                className={desktopLinkClass}
                            >
                                {t(`navigation.${link.key}`)}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right actions */}
                    <div className="ml-auto flex shrink-0 items-center gap-2.5 md:ml-0 md:gap-3">
                        {/* Language switcher */}
                        <div
                            className="relative grid h-9 w-[78px] grid-cols-2 items-center rounded-full border border-border/70 p-[3px]"
                            role="group"
                            aria-label={t("navigation.chooseLanguage")}
                        >
                            <span
                                aria-hidden="true"
                                className={[
                                    "pointer-events-none absolute top-[3px] bottom-[3px] left-[3px]",
                                    "w-[calc(50%-3px)] rounded-lg bg-primary",
                                    "shadow-sm",
                                    "transition-transform duration-300 ease-out motion-reduce:transition-none",
                                    currentLanguage === "BN" ? "translate-x-full" : "",
                                ].join(" ")}
                            />
                            {["EN", "BN"].map((language) => (
                                <button
                                    key={language}
                                    type="button"
                                    onClick={() => changeLanguage(language)}
                                    aria-pressed={currentLanguage === language}
                                    className={[
                                        "relative z-10 h-full cursor-pointer rounded-full border-0 bg-transparent p-0",
                                        "text-[11px] font-bold outline-none transition-colors",
                                        "focus-visible:ring-2 focus-visible:ring-primary/40",
                                        currentLanguage === language
                                            ? "text-muted"
                                            : "text-muted-foreground hover:text-foreground",
                                    ].join(" ")}
                                >
                                    {language}
                                </button>
                            ))}
                        </div>

                        {/* Theme switcher */}
                        <ThemeSwitch
                            className="hidden md:grid"
                            mode={mode}
                            onChange={setMode}
                            label={t("navigation.chooseTheme")}
                            lightLabel={t("navigation.light")}
                            darkLabel={t("navigation.dark")}
                            systemLabel={t("navigation.system")}
                        />

                        {/* Theme settings */}
                        {/* <Link
                            to="/dashboard/settings"
                            aria-label={t("navigation.themeSettings", "Theme settings")}
                            title={t("navigation.themeSettings", "Theme settings")}
                            className="hidden size-9 place-items-center rounded-full border border-border/70 text-muted-foreground transition hover:border-primary/40 hover:text-primary md:grid"
                        >
                            <Palette size={16} />
                        </Link> */}

                        {/* Desktop account dropdown / login */}
                        {isAuthenticated ? (
                            <div className="hidden md:block">
                                <UserMenu onNavigate={closeMenu} />
                            </div>
                        ) : (
                            <LoginDialog>
                                <button
                                    type="button"
                                    className="btn-premium hidden rounded-full px-3.5 py-2 text-[13.5px] font-semibold md:inline-flex"
                                >
                                    {t("navigation.login")}
                                </button>
                            </LoginDialog>
                        )}

                        {/* Desktop CTA */}
                        {/* <Link
                            to="/become-donor"
                            className={[
                                "group/cta relative hidden px-3.5 py-2 items-center justify-center gap-1.5 overflow-hidden",
                                "rounded-full bg-gradient-to-b from-primary to-primary-hover px-4 text-[13px] font-bold text-primary-foreground",
                                "shadow-md",
                                "ring-1 ring-primary-hover/60 transition-all duration-200",
                                "hover:-translate-y-px hover:shadow-md",
                                "active:translate-y-0 md:inline-flex",
                            ].join(" ")}
                        >
                            {t("navigation.becomeDonor")}
                            <ArrowUpRight
                                size={15}
                                strokeWidth={2.4}
                                className="transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                            />
                        </Link> */}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-card text-foreground outline-none transition-colors hover:border-primary/30 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 md:hidden"
                        aria-label={
                            menuOpen ? t("navigation.closeMenu") : t("navigation.openMenu")
                        }
                        aria-expanded={menuOpen}
                        aria-controls="primary-navigation"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <span className="relative grid size-5 place-items-center">
                            <Menu
                                size={20}
                                className={[
                                    "absolute transition-all duration-200",
                                    menuOpen ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100",
                                ].join(" ")}
                            />
                            <X
                                size={20}
                                className={[
                                    "absolute transition-all duration-200",
                                    menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0",
                                ].join(" ")}
                            />
                        </span>
                    </button>

                    {/* Mobile panel */}
                    <div
                        id="primary-navigation"
                        className={[
                            "absolute inset-x-0 top-full mt-2 origin-top overflow-hidden md:hidden",
                            "rounded-2xl border border-border/70 bg-card/95 p-2",
                            "shadow-xl backdrop-blur-xl backdrop-saturate-150",
                            "supports-[backdrop-filter]:bg-card/90",
                            "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px",
                            "before:bg-linear-to-r before:from-transparent before:via-foreground/15 before:to-transparent",
                            "transition-all duration-200 ease-out motion-reduce:transition-none",
                            menuOpen
                                ? "visible translate-y-0 scale-100 opacity-100"
                                : "invisible -translate-y-2 scale-[0.98] opacity-0",
                        ].join(" ")}
                    >
                        <div className="flex flex-col gap-0.5">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <NavLink
                                        key={link.path}
                                        to={link.path}
                                        end={link.end}
                                        onClick={closeMenu}
                                        className={mobileLinkClass}
                                    >
                                        <Icon size={18} strokeWidth={2.1} />
                                        {t(`navigation.${link.key}`)}
                                    </NavLink>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between gap-4 px-4 pt-[0.55rem] pb-[0.15rem]">
                            <span className="inline-flex items-center gap-2.5 text-[0.85rem] font-bold text-foreground [&>svg]:text-primary">
                                <Moon size={16} />
                                {t("navigation.theme")}
                            </span>

                            <ThemeSwitch
                                mode={mode}
                                onChange={setMode}
                                label={t("navigation.chooseTheme")}
                                lightLabel={t("navigation.light")}
                                darkLabel={t("navigation.dark")}
                                systemLabel={t("navigation.system")}
                            />
                        </div>

                        <div className="mt-2 grid gap-2 border-t border-border/60 p-1 pt-3">
                            {isAuthenticated && user && (
                                <div className="flex items-center gap-2.5 px-2 pb-1">
                                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                                        {user.fullName.slice(0, 2).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-foreground">{user.fullName}</p>
                                        <p className="truncate text-xs capitalize text-muted-foreground">{user.role}</p>
                                    </div>
                                </div>
                            )}
                            {isAuthenticated && (
                                <Link
                                    to="/dashboard"
                                    onClick={closeMenu}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-bold text-primary-foreground"
                                >
                                    Dashboard
                                </Link>
                            )}
                            {isAuthenticated && (
                                <Link
                                    to="/dashboard/settings"
                                    onClick={closeMenu}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/70 text-sm font-semibold text-foreground transition-colors hover:bg-primary/5"
                                >
                                    <Palette size={16} />
                                    {t("navigation.themeSettings", "Theme settings")}
                                </Link>
                            )}
                            {isAuthenticated ? (
                                <button
                                    type="button"
                                    onClick={() => { logout(); closeMenu(); }}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/70 text-sm font-semibold text-foreground transition-colors hover:bg-primary/5"
                                >
                                    <LogOut size={16} />
                                    {t("navigation.logout", "Log out")}
                                </button>
                            ) : (
                                <LoginDialog>
                                    <button
                                        type="button"
                                        onClick={closeMenu}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/70 text-sm font-semibold text-foreground transition-colors hover:bg-primary/5"
                                    >
                                        <LogIn size={16} />
                                        {t("navigation.login")}
                                    </button>
                                </LoginDialog>
                            )}

                            <Link
                                to="/become-donor"
                                onClick={closeMenu}
                                className="btn-premium min-h-11 text-sm"
                            >
                                {t("navigation.becomeDonor")}
                                <ArrowUpRight size={16} />
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Backdrop (outside the header so backdrop-filter doesn't trap it) */}
            <div
                aria-hidden="true"
                onClick={closeMenu}
                className={[
                    "fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px] md:hidden",
                    "transition-opacity duration-200",
                    menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
                ].join(" ")}
            />
        </>
    );
};

export default Navbar;