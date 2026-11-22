import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Check,
    Droplet,
    Eye,
    HandHeart,
    Heart,
    MapPin,
    ShieldCheck,
    Target,
    Users,
} from "lucide-react";

const valueItems = [
    { key: "humanity", icon: Heart },
    { key: "trust", icon: ShieldCheck },
    { key: "community", icon: Users },
    { key: "service", icon: HandHeart },
];

const missionItems = [
    { key: "mission", icon: Target },
    { key: "vision", icon: Eye },
];

const stepItems = [
    { number: "01", key: "find" },
    { number: "02", key: "verify" },
    { number: "03", key: "coordinate" },
];

const pillarItems = [
    { key: "pillar1", icon: MapPin },
    { key: "pillar2", icon: ShieldCheck },
    { key: "pillar3", icon: Heart },
];

const SectionHeading = ({ eyebrow, title, text, centered = true }) => (
    <div
        className={`about-section-heading about-reveal${
            centered ? " about-section-heading--center" : ""
        }`}
    >
        <span className="about-section-eyebrow">{eyebrow}</span>
        <h2 className="about-section-title">{title}</h2>
        {text && <p className="about-section-text">{text}</p>}
    </div>
);

const IconBadge = ({ icon: Icon, className = "about-icon-lg", iconSize = 25 }) => (
    <span className={className}>
        <Icon size={iconSize} strokeWidth={2.1} />
    </span>
);

const About = () => {
    const { t } = useTranslation();

    return (
        <div className="about-page">

            {/* ---------- Hero ---------- */}
            <section className="about-hero">
                <div className="about-hero-glow-a" aria-hidden="true" />
                <div className="about-hero-glow-b" aria-hidden="true" />

                <div className="about-container about-hero-inner">
                    <div className="about-reveal">
                        <span className="about-hero-badge">
                            <Heart size={14} />
                            {t("about.badge", "About Blood Connect")}
                        </span>

                        <h1 className="about-hero-title">
                            {t("about.heading1", "Connecting Hearts,")}
                            <span>{t("about.heading2", "Saving Lives.")}</span>
                        </h1>

                        <p className="about-hero-text">
                            {t(
                                "about.intro",
                                "Blood Connect is a community-focused blood donation initiative that connects voluntary blood donors with people who need blood. Our goal is to make blood donation coordination more accessible, organized, and reliable."
                            )}
                        </p>

                        <div className="about-hero-actions">
                            <Link to="/become-donor" className="btn-premium about-btn-primary">
                                {t("about.becomeDonor", "Become a Donor")}
                                <ArrowRight size={17} />
                            </Link>
                            <Link to="/contact" className="about-btn-secondary">
                                {t("about.contact", "Contact Us")}
                            </Link>
                        </div>

                        <div className="about-hero-stats">
                            <div className="about-hero-stat">
                                <strong>24/7</strong>
                                <span>{t("about.statOnline", "Always online")}</span>
                            </div>
                            <div className="about-hero-stat">
                                <strong>100%</strong>
                                <span>{t("about.statVoluntary", "Voluntary donors")}</span>
                            </div>
                            <div className="about-hero-stat">
                                <strong>Tangail</strong>
                                <span>{t("about.statBase", "Based in Tangail")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="about-hero-visual about-reveal">
                        <div className="about-hero-frame">
                            <img
                                src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1000&q=85"
                                alt={t("about.imageAlt", "Blood donation")}
                                className="about-hero-image"
                            />
                            <div className="about-hero-shade" aria-hidden="true" />
                        </div>

                        <div className="about-float-card">
                            <span className="about-float-icon">
                                <Droplet size={23} />
                            </span>
                            <div>
                                <p className="about-float-title">
                                    {t("about.everyDrop", "Every Drop Matters")}
                                </p>
                                <p className="about-float-subtitle">
                                    {t("about.giveHope", "Give blood. Give hope.")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Who we are ---------- */}
            <section className="about-section">
                <div className="about-container about-who-grid">
                    <div className="about-reveal">
                        <SectionHeading
                            eyebrow={t("about.whoHeading", "Who We Are")}
                            title={t("about.whoTitle", "A Community Built Around Humanity")}
                            centered={false}
                        />
                        <p className="about-who-lead">
                            {t(
                                "about.whoText1",
                                "Finding a blood donor during an emergency can be stressful and time-sensitive. Blood Connect aims to simplify that process by creating a structured platform where people can find available donors and volunteers can coordinate blood requests."
                            )}
                        </p>
                    </div>

                    <div className="about-reveal">
                        <div className="about-who-body">
                            <p>
                                {t(
                                    "about.whoText2",
                                    "We are starting our operations in Tangail, Bangladesh, with a vision to expand our support to more communities across the country."
                                )}
                            </p>
                        </div>

                        <div className="about-pillars">
                            {pillarItems.map(({ key, icon: Icon }) => (
                                <div className="about-pillar" key={key}>
                                    <span className="about-pillar-icon">
                                        <Icon size={17} />
                                    </span>
                                    {t(`about.${key}`)}
                                    <Check size={16} aria-hidden="true" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Mission & vision ---------- */}
            <section className="about-section about-section--tinted">
                <div className="about-container">
                    <div className="about-mv-grid">
                        {missionItems.map(({ key, icon: Icon }, index) => (
                            <article className="about-mv-card about-reveal" key={key}>
                                <span className="about-mv-index">0{index + 1}</span>
                                <IconBadge icon={Icon} />
                                <h3 className="about-mv-title">
                                    {t(`about.${key}.title`)}
                                </h3>
                                <p className="about-mv-text">
                                    {t(`about.${key}.text`)}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- Values ---------- */}
            <section className="about-section">
                <div className="about-container">
                    <SectionHeading
                        eyebrow={t("about.guideHeading", "What Guides Us")}
                        title={t("about.valuesTitle", "Our Core Values")}
                        text={t(
                            "about.valuesText",
                            "The principles that guide how we serve our community."
                        )}
                    />

                    <div className="about-values-grid">
                        {valueItems.map(({ key, icon: Icon }, index) => (
                            <article className="about-value-card" key={key}>
                                <div className="about-value-top">
                                    <IconBadge
                                        icon={Icon}
                                        className="about-value-icon"
                                        iconSize={20}
                                    />
                                    <span className="about-value-number">
                                        0{index + 1}
                                    </span>
                                </div>
                                <h3 className="about-value-title">
                                    {t(`about.values.${key}.title`)}
                                </h3>
                                <p className="about-value-text">
                                    {t(`about.values.${key}.text`)}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- How we work ---------- */}
            <section className="about-section about-section--tinted">
                <div className="about-container">
                    <SectionHeading
                        eyebrow={t("about.approach", "Our Approach")}
                        title={t("about.howTitle", "How Blood Connect Works")}
                    />

                    <div className="about-steps-grid">
                        <div className="about-steps-line" aria-hidden="true" />

                        {stepItems.map(({ number, key }) => (
                            <article className="about-step" key={number}>
                                <span className="about-step-number">{number}</span>
                                <h3 className="about-step-title">
                                    {t(`about.steps.${key}.title`)}
                                </h3>
                                <p className="about-step-text">
                                    {t(`about.steps.${key}.text`)}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- Community CTA ---------- */}
            <section className="about-cta-section">
                <div className="about-container">
                    <div className="about-cta">
                        <div className="about-cta-inner">
                            <div>
                                <span className="about-cta-badge">
                                    <Heart size={13} />
                                    {t("about.badge", "About Blood Connect")}
                                </span>
                                <h2 className="about-cta-title">
                                    {t("about.ctaTitle", "Be Part of Something Meaningful")}
                                </h2>
                                <p className="about-cta-text">
                                    {t(
                                        "about.ctaText",
                                        "Your willingness to donate blood can make a real difference. Join our community and help someone find hope."
                                    )}
                                </p>
                            </div>

                            <Link to="/become-donor" className="about-cta-btn">
                                {t("about.join", "Join Our Community")}
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
