import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowUpRight,
    Droplets,
    HeartPulse,
    Home,
    Info,
    LogIn,
    Mail,
    Menu,
    Search,
    X,
} from "lucide-react";

const navLinks = [
    { key: "home", path: "/", end: true, icon: Home },
    { key: "findDonors", path: "/donors", icon: Search },
    { key: "bloodRequests", path: "/create-blood-requests", icon: HeartPulse },
    { key: "about", path: "/about", icon: Info },
    { key: "contact", path: "/contact", icon: Mail },
];

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hover, setHover] = useState({ left: 0, width: 0, visible: false });
    const listRef = useRef(null);
    const { pathname } = useLocation();
    const { t, i18n } = useTranslation();

    const currentLanguage = i18n.resolvedLanguage?.startsWith("bn") ? "BN" : "EN";

    const closeMenu = () => setMenuOpen(false);

    const changeLanguage = (language) => {
        i18n.changeLanguage(language === "BN" ? "bn" : "en");
    };

    /* Condense the bar once the page scrolls */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* Close the menu on route change */
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

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
            "focus-visible:ring-2 focus-visible:ring-[#C62838]/40",
            "after:absolute after:-bottom-0.5 after:left-1/2 after:size-1",
            "after:-translate-x-1/2 after:rounded-full after:bg-[#C62838]",
            "after:transition-all after:duration-300",
            isActive
                ? "text-[#192623] after:scale-100 after:opacity-100"
                : "text-[#66736E] hover:text-[#192623] after:scale-0 after:opacity-0",
        ].join(" ");

    const mobileLinkClass = ({ isActive }) =>
        [
            "group flex items-center gap-3 rounded-xl px-3 py-3",
            "text-[15px] font-semibold transition-colors duration-200",
            isActive
                ? "bg-[#FDEEF0] text-[#C62838]"
                : "text-[#33443D] hover:bg-muted",
        ].join(" ");

    return (
        <>
            <header
                className={[
                    "sticky top-0 z-50 w-full border-b backdrop-blur-xl",
                    "transition-[background-color,border-color,box-shadow] duration-300",
                    scrolled
                        ? "border-border/70 bg-white/80 shadow-[0_8px_30px_rgba(29,55,44,0.07)]"
                        : "border-transparent bg-white/95",
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
                        className="group flex shrink-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#C62838]/40"
                    >
                        <span
                            className={[
                                "relative grid place-items-center rounded-[14px]",
                                "bg-linear-to-br from-primary to-primary/80 text-white",
                                "shadow-[0_8px_18px_rgba(198,40,56,0.28),inset_0_1px_0_rgba(255,255,255,0.28)]",
                                "transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105",
                                scrolled ? "size-10" : "size-11",
                            ].join(" ")}
                        >
                            <Droplets
                                size={22}
                                strokeWidth={2.5}
                                fill="rgba(255,255,255,0.18)"
                            />
                        </span>

                        <span className="flex flex-col">
                            <span className="text-[20px] leading-none font-extrabold tracking-tight text-[#192623]">
                                Blood <span className="text-[#C62838]">Connect</span>
                            </span>
                            <span
                                className={[
                                    "overflow-hidden text-[8px] font-bold tracking-[1.5px] text-[#84918C]",
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
                            className="pointer-events-none absolute inset-y-0 my-auto h-9 rounded-full bg-[#F1F5F3] transition-[transform,width,opacity] duration-300 ease-out motion-reduce:transition-none"
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
                                    "shadow-[0_1px_4px_rgba(28,48,39,0.16)]",
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
                                        "focus-visible:ring-2 focus-visible:ring-[#C62838]/40",
                                        currentLanguage === language
                                            ? "text-muted"
                                            : "text-[#829089] hover:text-[#33443D]",
                                    ].join(" ")}
                                >
                                    {language}
                                </button>
                            ))}
                        </div>

                        {/* Desktop login */}
                        <Link
                            to="/login"
                            className="hidden rounded-full px-3.5 py-2 text-[13.5px] font-semibold text-[#475650] transition-colors bg-muted md:inline-flex"
                        >
                            {t("navigation.login")}
                        </Link>

                        {/* Desktop CTA */}
                        <Link
                            to="/become-donor"
                            className={[
                                "group/cta relative hidden px-3.5 py-2 items-center justify-center gap-1.5 overflow-hidden",
                                "rounded-full bg-gradient-to-b from-[#D6313F] to-[#B91F32] px-4 text-[13px] font-bold text-white",
                                "shadow-[0_6px_16px_rgba(198,40,56,0.28),inset_0_1px_0_rgba(255,255,255,0.25)]",
                                "ring-1 ring-[#A91F30]/60 transition-all duration-200",
                                "hover:-translate-y-px hover:shadow-[0_10px_22px_rgba(198,40,56,0.34),inset_0_1px_0_rgba(255,255,255,0.25)]",
                                "active:translate-y-0 md:inline-flex",
                            ].join(" ")}
                        >
                            {t("navigation.becomeDonor")}
                            <ArrowUpRight
                                size={15}
                                strokeWidth={2.4}
                                className="transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                            />
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-white text-[#33443D] outline-none transition-colors hover:border-[#F0BDC0] hover:text-[#C62838] focus-visible:ring-2 focus-visible:ring-[#C62838]/40 md:hidden"
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
                            "absolute inset-x-0 top-full mt-2 origin-top md:hidden",
                            "rounded-2xl border border-border/70 bg-white p-2",
                            "shadow-[0_24px_60px_rgba(26,48,39,0.18)]",
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

                        <div className="mt-2 grid gap-2 border-t border-[#EDF2EF] p-1 pt-3">
                            <Link
                                to="/login"
                                onClick={closeMenu}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/70 text-sm font-semibold text-[#33443D] transition-colors hover:bg-muted"
                            >
                                <LogIn size={16} />
                                {t("navigation.login")}
                            </Link>

                            <Link
                                to="/become-donor"
                                onClick={closeMenu}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#D6313F] to-[#B91F32] text-sm font-bold text-white shadow-[0_6px_16px_rgba(198,40,56,0.25)] transition hover:brightness-95"
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
                    "fixed inset-0 z-40 bg-[#192623]/30 backdrop-blur-[2px] md:hidden",
                    "transition-opacity duration-200",
                    menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
                ].join(" ")}
            />
        </>
    );
};

export default Navbar;