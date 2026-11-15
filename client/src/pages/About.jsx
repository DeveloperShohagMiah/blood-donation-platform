
import {
    Heart,
    Target,
    Eye,
    Users,
    ShieldCheck,
    Droplet,
    ArrowRight,
    HandHeart,
    MapPin,
    CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

const values = [
    {
        icon: <Heart />,
        title: "Humanity First",
        description:
            "We believe every person deserves access to timely blood donation support, regardless of their background.",
    },
    {
        icon: <ShieldCheck />,
        title: "Trust & Transparency",
        description:
            "We work to verify blood requests and coordinate responsibly to build a reliable donation community.",
    },
    {
        icon: <Users />,
        title: "Community Driven",
        description:
            "We bring donors, volunteers, and people in need together to make a meaningful difference.",
    },
    {
        icon: <HandHeart />,
        title: "Responsible Service",
        description:
            "We respect donor privacy, voluntary participation, and the importance of responsible coordination.",
    },
];

const About = () => {
    return (
        <main className="overflow-hidden bg-background text-foreground">
            {/* Hero */}
            <section className="relative isolate">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-red-50 via-background to-rose-100/60 dark:from-red-950/20 dark:via-background dark:to-rose-950/10" />

                <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                            <Heart size={15} />
                            About Blood Connect
                        </span>

                        <h1 className="mt-7 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            Connecting Hearts,
                            <span className="block text-red-600">
                                Saving Lives.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                            Blood Connect is a community-focused blood donation
                            initiative that connects voluntary blood donors with
                            people who need blood. Our goal is to make blood
                            donation coordination more accessible, organized,
                            and reliable.
                        </p>

                        <div className="mt-9 flex flex-wrap gap-4">
                            <Link
                                to="/become-donor"
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
                            >
                                Become a Donor
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                to="/contact"
                                className="rounded-xl border border-border bg-background px-6 py-3.5 font-semibold transition hover:bg-muted"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 rounded-[2rem] bg-red-500/10 blur-2xl" />
                        <img
                            src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1000&q=85"
                            alt="Blood donation"
                            className="relative aspect-[5/4] w-full rounded-[2rem] object-cover shadow-2xl"
                        />

                        <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-white/60 bg-white/95 p-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-zinc-900/95 sm:left-auto sm:right-5 sm:w-64">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-red-100 p-3 text-red-600 dark:bg-red-950">
                                    <Droplet size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-900 dark:text-white">
                                        Every Drop Matters
                                    </p>
                                    <p className="text-sm text-zinc-500">
                                        Give blood. Give hope.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Introduction */}
            <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                        Who We Are
                    </span>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        A Community Built Around Humanity
                    </h2>
                    <p className="mt-6 text-base leading-8 text-muted-foreground">
                        Finding a blood donor during an emergency can be
                        stressful and time-sensitive. Blood Connect aims to
                        simplify that process by creating a structured platform
                        where people can find available donors and volunteers
                        can coordinate blood requests.
                    </p>
                    <p className="mt-4 text-base leading-8 text-muted-foreground">
                        We are starting our operations in Tangail, Bangladesh,
                        with a vision to expand our support to more communities
                        across the country.
                    </p>
                </div>
            </section>

            {/* Mission and Vision */}
            <section className="bg-muted/40 py-20">
                <div className="mx-auto grid max-w-7xl gap-7 px-5 sm:px-8 md:grid-cols-2">
                    <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
                        <div className="mb-6 inline-flex rounded-2xl bg-red-100 p-4 text-red-600 dark:bg-red-950">
                            <Target size={30} />
                        </div>
                        <h3 className="text-2xl font-bold">Our Mission</h3>
                        <p className="mt-4 leading-8 text-muted-foreground">
                            To connect voluntary blood donors with people in need
                            through an organized, accessible, and responsible
                            coordination system supported by dedicated volunteers.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
                        <div className="mb-6 inline-flex rounded-2xl bg-red-100 p-4 text-red-600 dark:bg-red-950">
                            <Eye size={30} />
                        </div>
                        <h3 className="text-2xl font-bold">Our Vision</h3>
                        <p className="mt-4 leading-8 text-muted-foreground">
                            To build a trusted blood donation community across
                            Bangladesh where finding voluntary donors is easier,
                            faster, and more organized.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                        What Guides Us
                    </span>
                    <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                        Our Core Values
                    </h2>
                    <p className="mt-4 leading-7 text-muted-foreground">
                        The principles that guide how we serve our community.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {values.map((value) => (
                        <div
                            key={value.title}
                            className="rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="mb-5 inline-flex rounded-xl bg-red-50 p-3 text-red-600 dark:bg-red-950/50">
                                {value.icon}
                            </div>
                            <h3 className="text-lg font-bold">{value.title}</h3>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                {value.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How we work */}
            <section className="bg-muted/40 py-20">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                            Our Approach
                        </span>
                        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                            How Blood Connect Works
                        </h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            {
                                number: "01",
                                title: "Find Donors",
                                description:
                                    "Search for available blood donors by blood group and location.",
                            },
                            {
                                number: "02",
                                title: "Verify Requests",
                                description:
                                    "Our volunteers review and verify submitted blood requests.",
                            },
                            {
                                number: "03",
                                title: "Coordinate Support",
                                description:
                                    "Volunteers coordinate with donors and blood seekers to support the donation process.",
                            },
                        ].map((item) => (
                            <div
                                key={item.number}
                                className="rounded-2xl border border-border bg-card p-8"
                            >
                                <span className="text-4xl font-black text-red-600/20">
                                    {item.number}
                                </span>
                                <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
                                <p className="mt-3 leading-7 text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Privacy */}
            <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
                <div className="flex flex-col items-start gap-6 rounded-3xl bg-red-600 p-8 text-white sm:p-12 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold">
                            Be Part of Something Meaningful
                        </h2>
                        <p className="mt-3 max-w-2xl leading-7 text-red-100">
                            Your willingness to donate blood can make a real
                            difference. Join our community and help someone
                            find hope.
                        </p>
                    </div>

                    <Link
                        to="/become-donor"
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-red-600 transition hover:bg-red-50"
                    >
                        Join Our Community
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default About;
