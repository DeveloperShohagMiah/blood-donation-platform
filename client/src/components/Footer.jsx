import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowRight,
    ArrowUp,
    Droplets,
    Mail,
    MapPin,
    Phone,
} from "lucide-react";

const socials = [
    { label: "Facebook", href: "#", mark: "f" },
    { label: "Instagram", href: "#", mark: "◎" },
    { label: "YouTube", href: "#", mark: "▶" },
    { label: "LinkedIn", href: "#", mark: "in" },
];

const linkClass =
    "group inline-flex items-center gap-1.5 text-sm text-background/65 transition-colors hover:text-primary-foreground focus-visible:text-primary-foreground focus-visible:outline-none";

const ColumnTitle = ({ children }) => (
    <h3 className="mb-5 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary-foreground">
        <span className="h-3 w-0.5 rounded-full bg-primary" />
        {children}
    </h3>
);

const Footer = () => {
    const { t } = useTranslation();
    const year = new Date().getFullYear();

    const platform = [
        { label: t("navigation.findDonors", "Find donors"), to: "/donors" },
        { label: t("navigation.becomeDonor", "Become a donor"), to: "/become-donor" },
        { label: t("navigation.allRequests", "All requests"), to: "/blood-requests" },
        { label: t("navigation.campaigns", "Campaigns"), to: "/campaigns" },
        { label: t("navigation.login", "Log in"), to: "/login" },
    ];

    const resources = [
        { label: t("footer.safety", "Safety and advisory"), href: "/#safety-heading" },
        { label: t("footer.tips", "Donation tips and guidelines"), href: "/#tips-heading" },
        { label: t("footer.gallery", "Gallery"), href: "/#gallery-heading" },
        { label: t("navigation.about", "About"), href: "/about" },
    ];

    return (
        <footer className="relative mt-16 overflow-hidden border-t border-background/10 bg-foreground text-background/60">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
            <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-80 w-3/4 max-w-5xl -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-success/10 blur-3xl" />

            {/* Emergency CTA strip */}
            <div className="relative z-20 mx-auto w-[calc(100%-2rem)] max-w-6xl md:w-[calc(100%-4rem)]">
                <div className="relative isolate mt-10 overflow-hidden rounded-3xl border border-primary-foreground/15 bg-gradient-to-r from-brand-deep via-primary to-primary-hover px-6 py-8 shadow-2xl shadow-primary/20 sm:px-10">
                    <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-10 size-56 rounded-full border-[22px] border-white/10" />
                    <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/4 size-56 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-3xl">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-primary-foreground backdrop-blur">
                                <Droplets size={12} />
                                {t("footer.ctaBadge", "Every second counts")}
                            </span>
                            <h2 className="font-display mt-3 text-2xl font-extrabold tracking-tight text-primary-foreground sm:text-3xl">
                                {t("footer.ctaTitle", "Need blood urgently?")}
                            </h2>
                            <p className="mt-1.5 text-sm leading-7 text-primary-foreground/85 sm:text-[15px]">
                                {t("footer.ctaText", "Post a request and nearby donors with a matching blood group will see it right away.")}
                            </p>
                        </div>
                        <Link
                            to="/create-blood-requests"
                            className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-card px-6 text-sm font-extrabold text-primary-hover shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                        >
                            {t("footer.ctaButton", "Request blood")}
                            <ArrowRight
                                size={17}
                                strokeWidth={2.5}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid gap-5 lg:grid-cols-[1.05fr_1.95fr] lg:gap-6">
                    {/* Brand panel */}
                    <div className="relative isolate overflow-hidden rounded-3xl border border-background/10 bg-background/[0.04] p-6 backdrop-blur-xl sm:p-8">
                        <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-52 rounded-full bg-primary/15 blur-2xl" />
                        <Link
                            to="/"
                            aria-label={t("navigation.home", "Home")}
                            className="relative inline-flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-light to-primary text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-white/20">
                                <Droplets size={23} strokeWidth={2.5} fill="var(--primary-foreground)" fillOpacity="0.18" />
                            </span>
                            <span className="font-display text-xl font-extrabold tracking-tight text-primary-foreground">
                                Blood <span className="text-brand-light">{t("text.Connect")}</span>
                            </span>
                        </Link>

                        <p className="relative mt-5 max-w-sm text-sm leading-7 text-background/65">
                            {t(
                                "footer.about",
                                "A voluntary network that connects blood donors with people who need blood, quickly and safely."
                            )}
                        </p>

                        <div className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-background/10 bg-background/5 px-3 py-1.5 text-xs font-semibold text-background/70">
                            <MapPin size={13} className="text-brand-light" />
                            {t("footer.location", "Proudly serving Tangail, Bangladesh")}
                        </div>

                        <div className="relative mt-7 border-t border-background/10 pt-6">
                            <p className="eyebrow mb-3 text-[10px] text-background/45">
                                {t("footer.follow", "Follow our journey")}
                            </p>
                            <ul className="flex flex-wrap gap-2">
                                {socials.map(({ label, href, mark }) => (
                                    <li key={label}>
                                        <a
                                            href={href}
                                            aria-label={label}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="grid size-10 place-items-center rounded-xl border border-background/10 bg-background/5 text-background/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                                        >
                                            <span className="text-sm font-extrabold leading-none">{mark}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Links panel */}
                    <div className="rounded-3xl border border-background/10 bg-background/[0.025] p-6 backdrop-blur-xl sm:p-8">
                        <div className="grid gap-8 sm:grid-cols-3">
                            <nav aria-label={t("footer.platform", "Platform")}>
                                <ColumnTitle>{t("footer.platform", "Platform")}</ColumnTitle>
                                <ul className="space-y-3">
                                    {platform.map((item) => (
                                        <li key={item.to}>
                                            <Link to={item.to} className={linkClass}>
                                                <span className="size-1 rounded-full bg-primary/0 transition-colors group-hover:bg-primary" />
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            <nav aria-label={t("footer.resources", "Resources")}>
                                <ColumnTitle>{t("footer.resources", "Resources")}</ColumnTitle>
                                <ul className="space-y-3">
                                    {resources.map((item) => (
                                        <li key={item.href}>
                                            <a href={item.href} className={linkClass}>
                                                <span className="size-1 rounded-full bg-primary/0 transition-colors group-hover:bg-primary" />
                                                {item.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            <div>
                                <ColumnTitle>{t("navigation.contact", "Contact")}</ColumnTitle>
                                <ul className="space-y-4 text-sm text-background/65">
                                    <li className="flex gap-3">
                                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-brand-light ring-1 ring-primary/15">
                                            <MapPin size={15} />
                                        </span>
                                        <span className="pt-1.5 leading-6">
                                            {t("footer.address", "Tangail, Bangladesh")}
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-brand-light ring-1 ring-primary/15">
                                            <Phone size={15} />
                                        </span>
                                        <a href="tel:+8801000000000" className="pt-1.5 font-semibold text-background/80 transition-colors hover:text-primary-foreground">
                                            +880 1000 000000
                                        </a>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-brand-light ring-1 ring-primary/15">
                                            <Mail size={15} />
                                        </span>
                                        <a href="mailto:hello@bloodconnect.example" className="break-all pt-1.5 font-semibold text-background/80 transition-colors hover:text-primary-foreground">
                                            hello@bloodconnect.example
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="relative z-10 mt-10 border-t border-background/10">
                <div className="mx-auto flex w-[calc(100%-2rem)] max-w-[1280px] flex-col gap-4 py-6 text-xs text-background/50 md:w-[calc(100%-4rem)] md:flex-row md:items-center md:justify-between">
                    <p>
                        {t("footer.copyright", "© {{year}} Blood Connect. All rights reserved.", { year })}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <Link to="/privacy" className="transition-colors hover:text-primary-foreground">
                            {t("footer.privacy", "Privacy policy")}
                        </Link>
                        <Link to="/terms" className="transition-colors hover:text-primary-foreground">
                            {t("footer.terms", "Terms of use")}
                        </Link>
                        <button
                            type="button"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="group inline-flex items-center gap-1.5 rounded-full border border-background/15 px-3.5 py-1.5 font-semibold text-background/70 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                            <ArrowUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
                            {t("footer.top", "Back to top")}
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
