
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    MessageCircle,
    Heart,
    ArrowRight,
    CheckCircle2,
    LoaderCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const contactMethods = [
    {
        icon: Phone,
        title: "Phone Support",
        description: "For direct communication and coordination.",
        value: "Add your official phone number",
    },
    {
        icon: Mail,
        title: "Email Support",
        description: "Send us your questions and inquiries.",
        value: "Add your official email address",
    },
    {
        icon: MapPin,
        title: "Our Location",
        description: "Our initial service area.",
        value: "Tangail, Bangladesh",
    },
    {
        icon: Clock,
        title: "Availability",
        description: "Contact our volunteer coordination team.",
        value: "Add your official support hours",
    },
];

const Contact = ({ onSubmit }) => {
    const [submitStatus, setSubmitStatus] = useState({
        type: "",
        message: "",
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
        },
    });

    const submitForm = async (values) => {
        setSubmitStatus({ type: "", message: "" });

        try {
            if (!onSubmit) {
                throw new Error("Contact form service is not connected yet.");
            }

            await onSubmit(values);

            setSubmitStatus({
                type: "success",
                message: "Your message has been submitted successfully.",
            });

            reset();
        } catch (error) {
            setSubmitStatus({
                type: "error",
                message:
                    error?.message ||
                    "Something went wrong. Please try again.",
            });
        }
    };

    const inputClass =
        "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-red-500 focus:ring-4 focus:ring-red-500/10";

    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-background to-rose-100/60 py-20 dark:from-red-950/20 dark:via-background ">
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-8">
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 ">
                        <MessageCircle size={16} />
                        Get in Touch
                    </span>

                    <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                        Let's Start a
                        <span className="block text-red-600">
                            Conversation.
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                        Have a question, want to volunteer, or need information
                        about Blood Connect? Send us a message. Our team will
                        do its best to assist you.
                    </p>
                </div>
            </section>

            {/* Contact methods + Form */}
            <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
                {/* Left side */}
                <div>
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                        Contact Information
                    </span>

                    <h2 className="mt-4 text-3xl font-bold">
                        We'd Love to Hear From You
                    </h2>

                    <p className="mt-4 leading-8 text-muted-foreground">
                        Whether you are a blood donor, volunteer, patient, or
                        someone who wants to support our initiative, feel free
                        to reach out.
                    </p>

                    <div className="mt-9 space-y-5">
                        {contactMethods.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.title}
                                    className="flex gap-4 rounded-2xl border border-border bg-card p-5"
                                >
                                    <div className="h-fit rounded-xl bg-red-100 p-3 text-red-600">
                                        <Icon size={22} />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="font-bold">{item.title}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                        <p className="mt-2 break-words text-sm font-semibold">
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 rounded-2xl bg-red-50 p-6 dark:bg-red-950/30">
                        <div className="flex items-center gap-3">
                            <Heart className="text-red-600" size={23} />
                            <h3 className="font-bold">Need Blood Urgently?</h3>
                        </div>

                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                            If someone needs blood, please submit a blood request
                            through our dedicated request system so our volunteers
                            can review and coordinate it.
                        </p>

                        <Link
                            to="/blood-requests"
                            className="mt-5 inline-flex items-center gap-2 font-bold text-red-600 transition hover:gap-3"
                        >
                            Submit Blood Request
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                </div>

                {/* Right side: Form */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-9">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold">Send Us a Message</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Complete the form below and our team will get back
                            to you.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit(submitForm)}
                        className="space-y-5"
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Full Name *
                                </label>
                                <input
                                    {...register("fullName", {
                                        required: "Full name is required.",
                                        minLength: {
                                            value: 2,
                                            message: "Name must contain at least 2 characters.",
                                        },
                                    })}
                                    placeholder="Enter your full name"
                                    className={inputClass}
                                />
                                {errors.fullName && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    {...register("email", {
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Enter a valid email address.",
                                        },
                                    })}
                                    placeholder="you@example.com"
                                    className={inputClass}
                                />
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    {...register("phone", {
                                        required: "Phone number is required.",
                                        pattern: {
                                            value: /^\+?[0-9\s()-]{8,20}$/,
                                            message: "Enter a valid phone number.",
                                        },
                                    })}
                                    placeholder="+8801XXXXXXXXX"
                                    className={inputClass}
                                />
                                {errors.phone && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Subject *
                                </label>
                                <select
                                    {...register("subject", {
                                        required: "Please select a subject.",
                                    })}
                                    className={inputClass}
                                    defaultValue=""
                                >
                                    <option value="" disabled>
                                        Select a subject
                                    </option>
                                    <option value="General Inquiry">
                                        General Inquiry
                                    </option>
                                    <option value="Become a Volunteer">
                                        Become a Volunteer
                                    </option>
                                    <option value="Donation Support">
                                        Donation Support
                                    </option>
                                    <option value="Technical Support">
                                        Technical Support
                                    </option>
                                    <option value="Partnership">
                                        Partnership
                                    </option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.subject && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.subject.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Your Message *
                            </label>
                            <textarea
                                rows={6}
                                {...register("message", {
                                    required: "Please enter your message.",
                                    minLength: {
                                        value: 10,
                                        message: "Message must contain at least 10 characters.",
                                    },
                                    maxLength: {
                                        value: 2000,
                                        message: "Message cannot exceed 2000 characters.",
                                    },
                                })}
                                placeholder="Write your message here..."
                                className={`${inputClass} resize-y`}
                            />
                            {errors.message && (
                                <p className="mt-1.5 text-xs text-red-600">
                                    {errors.message.message}
                                </p>
                            )}
                        </div>

                        {submitStatus.message && (
                            <div
                                role="status"
                                className={`flex items-start gap-3 rounded-xl p-4 text-sm ${submitStatus.type === "success"
                                    ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                    : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                    }`}
                            >
                                {submitStatus.type === "success" ? (
                                    <CheckCircle2 size={19} />
                                ) : (
                                    <MessageCircle size={19} />
                                )}
                                <p>{submitStatus.message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-4 font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoaderCircle className="animate-spin" size={19} />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    Send Message
                                    <Send size={18} />
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs leading-6 text-muted-foreground">
                            Your contact information will only be used to respond
                            to your inquiry.
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default Contact;
