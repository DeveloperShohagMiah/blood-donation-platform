import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowRight,
    ArrowUp,
    ArrowUpRight,
    Droplets,
    Mail,
    MapPin,
    Phone,
} from "lucide-react";

const socials = [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
    { label: "LinkedIn", href: "#" },
];

// Animated underline on hover, quiet colour shift
const linkClass =
    "relative inline-block py-0.5 text-sm text-background/70 transition-colors duration-200 hover:text-primary-foreground focus-visible:text-primary-foreground focus-visible:outline-none " +
    "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100";

const ColumnTitle = ({ children }) => (
    <h3 className="mb-5 border-b border-background/10 pb-3 text-sm font-semibold text-primary-foreground">
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
        <footer className="relative z-30 mt-auto border-t border-background/10 bg-foreground text-background/60">
            {/* Decorative layer: clipped to the footer box so nothing adds page height */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                <div className="absolute -top-48 left-1/2 h-96 w-3/4 max-w-4xl -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
            </div>

            {/* Emergency CTA: overlaps the top edge of the footer */}
            <div className="relative z-30 mx-auto w-[calc(100%-2rem)] max-w-6xl md:w-[calc(100%-4rem)]">
                <div className="relative isolate -translate-y-1/2 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-deep via-primary to-primary-hover px-7 py-10 shadow-2xl shadow-primary/25 ring-1 ring-inset ring-white/15 sm:px-12 sm:py-12">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border border-white/15" />
                    <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-52 rounded-full border border-white/15" />
                    <div aria-hidden="true" className="pointer-events-none absolute right-6 top-6 size-24 rounded-full border border-white/20 bg-white/5" />

                    <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center gap-2 rounded-full bg-black/20 py-1.5 pl-3 pr-4 text-xs font-medium text-primary-foreground backdrop-blur">
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex size-full rounded-full bg-white/70 motion-safe:animate-ping" />
                                    <span className="relative inline-flex size-2 rounded-full bg-white" />
                                </span>
                                {t("footer.ctaBadge", "Every second counts")}
                            </span>
                            <h2 className="font-display mt-5 text-3xl font-extrabold leading-[1.05] tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                                {t("footer.ctaTitle", "Need blood urgently?")}
                            </h2>
                            <p className="mt-4 max-w-xl text-base leading-7 text-primary-foreground/80">
                                {t("footer.ctaText", "Post a request and nearby donors with a matching blood group will see it right away.")}
                            </p>
                        </div>

                        <Link
                            to="/create-blood-requests"
                            className="group inline-flex h-14 shrink-0 items-center justify-center gap-4 self-start rounded-full bg-card pl-7 pr-2 text-sm font-bold text-primary-hover shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:translate-y-0 md:self-auto"
                        >
                            {t("footer.ctaButton", "Request blood")}
                            <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:translate-x-0.5">
                                <ArrowRight size={18} strokeWidth={2.5} />
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main */}
            <div className="relative z-10 mx-auto max-w-7xl px-6 pt-4 sm:px-8 lg:pt-10">
                <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
                    {/* Brand */}
                    <div className="lg:col-span-5">
                        <Link
                            to="/"
                            aria-label={t("navigation.home", "Home")}
                            className="inline-flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                            <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-light to-primary text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-white/20">
                                <Droplets size={22} strokeWidth={2.5} fill="var(--primary-foreground)" fillOpacity="0.18" />
                            </span>
                            <span className="font-display text-xl font-extrabold tracking-tight text-primary-foreground">
                                Blood <span className="text-brand-light">{t("text.Connect")}</span>
                            </span>
                        </Link>

                        <p className="mt-6 max-w-sm text-base leading-7 text-background/70">
                            {t(
                                "footer.about",
                                "A voluntary network that connects blood donors with people who need blood, quickly and safely."
                            )}
                        </p>

                        <p className="mt-5 inline-flex items-center gap-2 text-sm text-background/60">
                            <MapPin size={15} className="text-brand-light" />
                            {t("footer.location", "Proudly serving Tangail, Bangladesh")}
                        </p>

                        <div className="mt-10">
                            <p className="mb-3 text-sm text-background/50">
                                {t("footer.follow", "Follow our journey")}
                            </p>
                            <ul className="flex flex-wrap gap-x-6 gap-y-2">
                                {socials.map(({ label, href }) => (
                                    <li key={label}>
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group inline-flex items-center gap-1 text-sm font-medium text-background/80 transition-colors hover:text-primary-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
                                        >
                                            {label}
                                            <ArrowUpRight
                                                size={14}
                                                className="text-background/40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-light"
                                            />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7 lg:pl-8">
                        <nav aria-label={t("footer.platform", "Platform")}>
                            <ColumnTitle>{t("footer.platform", "Platform")}</ColumnTitle>
                            <ul className="space-y-3">
                                {platform.map((item) => (
                                    <li key={item.to}>
                                        <Link to={item.to} className={linkClass}>
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
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <div>
                            <ColumnTitle>{t("navigation.contact", "Contact")}</ColumnTitle>
                            <ul className="space-y-4 text-sm">
                                <li className="flex items-start gap-3 text-background/70">
                                    <MapPin size={16} className="mt-0.5 shrink-0 text-brand-light" />
                                    <span className="leading-6">{t("footer.address", "Tangail, Bangladesh")}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Phone size={16} className="mt-0.5 shrink-0 text-brand-light" />
                                    <a href="tel:+8801000000000" className="leading-6 text-background/80 transition-colors hover:text-primary-foreground">
                                        +880 1000 000000
                                    </a>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Mail size={16} className="mt-0.5 shrink-0 text-brand-light" />
                                    <a href="mailto:hello@bloodconnect.example" className="break-all leading-6 text-background/80 transition-colors hover:text-primary-foreground">
                                        hello@bloodconnect.example
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-16 flex flex-col gap-4 border-t border-background/10 py-6 text-xs text-background/50 md:flex-row md:items-center md:justify-between">
                    <p>
                        {t("footer.copyright", "© {{year}} Blood Connect. All rights reserved.", { year })}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <Link to="/privacy" className="transition-colors hover:text-primary-foreground">
                            {t("footer.privacy", "Privacy policy")}
                        </Link>
                        <Link to="/terms" className="transition-colors hover:text-primary-foreground">
                            {t("footer.terms", "Terms of use")}
                        </Link>
                        <button
                            type="button"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            aria-label={t("footer.top", "Back to top")}
                            title={t("footer.top", "Back to top")}
                            className="group grid size-9 place-items-center rounded-full border border-background/15 text-background/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                            <ArrowUp size={15} className="transition-transform group-hover:-translate-y-0.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Oversized wordmark, fades out as it is cropped by the footer edge */}
            <div aria-hidden="true" className="relative select-none overflow-hidden">
                <p className="font-display whitespace-nowrap bg-gradient-to-b from-background/20 via-background/[0.06] to-transparent bg-clip-text text-center text-[clamp(2.75rem,12.5vw,11rem)] font-extrabold leading-[0.85] tracking-tighter text-transparent">
                    Blood {t("text.Connect")}
                </p>
            </div>
        </footer>
    );
};

export default Footer;