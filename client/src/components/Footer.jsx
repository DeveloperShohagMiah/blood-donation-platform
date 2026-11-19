import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowUp,
    ArrowUpRight,
    Droplets,
    Mail,
    MapPin,
    Phone,
} from "lucide-react";

/* Replace "#" with your real profile URLs */
const socials = [
    { label: "Facebook", href: "#", icon: "#" },
    { label: "Instagram", href: "#", icon: "#" },
    { label: "YouTube", href: "#", icon: "#" },
    { label: "LinkedIn", href: "#", icon: "#" },
];

const linkClass =
    "text-[14px] text-background/70 transition-colors hover:text-primary focus-visible:text-primary-foreground focus-visible:outline-none";

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

    /* Plain anchors so the browser jumps to the section on the Home page */
    const resources = [
        { label: t("footer.safety", "Safety and advisory"), href: "/#safety-heading" },
        { label: t("footer.tips", "Donation tips and guidelines"), href: "/#tips-heading" },
        { label: t("footer.gallery", "Gallery"), href: "/#gallery-heading" },
        { label: t("navigation.about", "About"), href: "/about" },
    ];

    return (
        <footer className="relative bg-foreground mt-32 text-background/60 border-t border-background/10 ">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-70 pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-40 bg-gradient-to-b from-primary/25 via-primary/5 to-transparent blur-3xl pointer-events-none"></div>
            {/* Emergency strip */}
            <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl md:w-[calc(100%-4rem)] ">
                <div className="-translate-y-1/2 rounded-3xl z-[999] bg-gradient-to-r from-primary to-primary-hover px-6 py-7 shadow-lg sm:px-10">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-4xl">
                            <h2 className="text-2xl font-extrabold text-primary-foreground tracking-tight sm:text-3xl">
                                {t("footer.ctaTitle", "Need blood urgently?")}
                            </h2>
                            <p className="mt-1.5 text-[15px] text-primary-foreground/85">
                                {t("footer.ctaText", "Post a request and nearby donors with a matching blood group will see it right away.")}
                            </p>
                        </div>
                        <Link
                            to="/create-blood-requests"
                            className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-card px-6 text-[15px] font-bold text-primary-hover transition hover:bg-primary/5 active:scale-[0.98]"
                        >
                            {t("footer.ctaButton", "Request blood")}
                            <ArrowUpRight
                                size={17}
                                strokeWidth={2.5}
                                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main columns */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch mb-8">
                    {/* Brand */}
                    <div className="lg:col-span-4 bg-gradient-to-b from-foreground/90 via-foreground/70 to-foreground/90 border border-background/10 hover:border-primary/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all duration-300">
                        <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
                        <Link
                            to="/"
                            aria-label={t("navigation.home", "Home")}
                            className="inline-flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-background/40"
                        >
                            <span className="grid size-11 place-items-center rounded-[14px] bg-linear-to-br from-brand-light to-primary-hover text-primary-foreground shadow-md">
                                <Droplets size={22} strokeWidth={2.5} fill="var(--primary-foreground)" fillOpacity="0.18" />
                            </span>
                            <span className="text-[21px] leading-none font-extrabold tracking-tight">
                                Blood <span className="text-brand-light">{t("text.Connect")}</span>
                            </span>
                            <span></span>
                        </Link>

                        <p className="mt-5 text-[15px] leading-relaxed text-background/70">
                            {t(
                                "footer.about",
                                "A voluntary network that connects blood donors with people who need blood, quickly and safely."
                            )}
                        </p>

                        <div className="mt-8 pt-6 border-t border-background/10 flex flex-wrap items-center justify-between gap-3">
                            <h6 className="text-sm text-primary-foreground">Stay in touch!</h6>
                            <ul className="flex gap-2.5">
                                {socials.map(({ label, href, icon }) => (
                                    <li key={label}>
                                        <a
                                            href={href}
                                            aria-label={label}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="grid size-10 place-items-center rounded-md bg-foreground border border-foreground/80 text-background/70 transition-colors hover:border-brand-light hover:bg-brand-light hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-background/40 focus-visible:outline-none"
                                        >
                                            {icon}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-foreground/30 border border-background/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">

                            {/* Platform */}
                            <nav aria-label={t("footer.platform", "Platform")}>
                                <h3 className="text-xs font-black uppercase tracking-wider text-primary-foreground mb-4">{t("footer.platform", "Platform")}</h3>
                                <ul className="mt-5 space-y-3">
                                    {platform.map((item) => (
                                        <li key={item.to}>
                                            <Link to={item.to} className={linkClass}>
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            {/* Resources */}
                            <nav aria-label={t("footer.resources", "Resources")}>
                                <h3 className="text-xs font-black uppercase tracking-wider text-primary-foreground mb-4">{t("footer.resources", "Resources")}</h3>
                                <ul className="mt-5 space-y-3">
                                    {resources.map((item) => (
                                        <li key={item.href}>
                                            <a href={item.href} className={linkClass}>
                                                {item.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            {/* Contact */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-primary-foreground mb-4">
                                    {t("navigation.contact", "Contact")}
                                </h3>
                                <ul className="mt-5 space-y-4 text-[15px] text-background/70">
                                    <li className="flex gap-3">
                                        <MapPin size={18} className="mt-0.5 shrink-0 text-brand-light" />
                                        <span>{t("footer.address", "House 00, Road 00, Dhaka, Bangladesh")}</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <Phone size={18} className="mt-0.5 shrink-0 text-brand-light" />
                                        <a href="tel:+8801000000000" className="transition-colors hover:text-primary-foreground">
                                            +880 1000 000000
                                        </a>
                                    </li>
                                    <li className="flex gap-3">
                                        <Mail size={18} className="mt-0.5 shrink-0 text-brand-light" />
                                        <a href="mailto:hello@bloodconnect.example" className="break-all transition-colors hover:text-primary-foreground">
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
            <div className="border-t border-background/10">
                <div className="mx-auto flex w-[calc(100%-2rem)] max-w-[1280px] flex-col gap-4 py-6 text-sm text-muted-foreground md:w-[calc(100%-4rem)] md:flex-row md:items-center md:justify-between">
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
                            className="inline-flex items-center gap-1.5 rounded-full border border-background/15 px-3.5 py-1.5 font-semibold text-background/70 transition-colors hover:border-background/40 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-background/40 focus-visible:outline-none"
                        >
                            <ArrowUp size={15} />
                            {t("footer.top", "Back to top")}
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;