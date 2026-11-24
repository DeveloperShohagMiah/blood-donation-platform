import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Clock,
    Heart,
    LoaderCircle,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
    ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";
import Select from "../components/Select";
import HeroBadge from "../ui/HeroBadge";

const contactMethods = [
    {
        key: "phone",
        icon: Phone,
        title: "Phone Support",
        description: "For direct communication and coordination.",
        value: "+880 1234 567890",
        href: "tel:+8801234567890",
    },
    {
        key: "email",
        icon: Mail,
        title: "Email Support",
        description: "Send us your questions and inquiries.",
        value: "bloodconnect@gmail.com",
        href: "mailto:bloodconnect@gmail.com",
    },
    {
        key: "location",
        icon: MapPin,
        title: "Our Location",
        description: "Our initial service area.",
        value: "Tangail, Bangladesh",
    },
    {
        key: "availability",
        icon: Clock,
        title: "Availability",
        description: "Contact our volunteer coordination team.",
        value: "Within 24 hours on weekdays",
    },
];

const inputClass = (hasError) =>
    ["input-premium mt-2 h-12 px-4", hasError ? "is-invalid" : ""]
        .filter(Boolean)
        .join(" ");

const RequiredMark = () => (
    <span className="ml-0.5 align-top text-[11px] font-bold text-destructive/70">*</span>
);

const Field = ({ label, required, error, children }) => (
    <div>
        <label className="mb-1.5 block text-sm font-bold text-foreground">
            {label}
            {required && <RequiredMark />}
        </label>
        {children}
        {error && (
            <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle size={13} /> {error.message}
            </p>
        )}
    </div>
);

const Contact = () => {
    const { t } = useTranslation();
    const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
        },
        mode: "onBlur",
    });

    const submitForm = async (values) => {
        setSubmitStatus({ type: "", message: "" });
        try {
            const result = await apiFetch("/contact", {
                method: "POST",
                body: values,
            });
            setSubmitStatus({
                type: "success",
                message: result?.message || "Your message has been submitted successfully.",
            });
            reset();
        } catch (error) {
            setSubmitStatus({
                type: "error",
                message: error?.message || "Something went wrong. Please try again.",
            });
        }
    };

    return (
        <div className="overflow-hidden bg-background text-foreground">
            {/* Hero */}
            <section className="relative isolate overflow-hidden">
                <div aria-hidden="true" className="pointer-events-none absolute -top-48 left-1/3 -z-10 size-[560px] rounded-full bg-primary/10 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 -z-10 size-[520px] rounded-full bg-success/10 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-t from-background to-transparent" />

                <div className="relative mx-auto max-w-7xl px-5 py-20 text-center sm:px-8 lg:py-24">
                    <HeroBadge
                        icon={<MessageCircle size={13} fill="currentColor" fillOpacity={0.25} />}
                        label={t("contact.badge", "Contact Us")}
                    />
                    <h1 className="font-display mx-auto mt-7 max-w-4xl text-[clamp(2.6rem,6vw,4.4rem)] leading-[1.05] font-extrabold tracking-[-0.055em]">
                        {t("contact.heading1", "Let's Start a")}
                        <span className="mt-1 block bg-gradient-to-r from-primary via-primary-hover to-brand-deep bg-clip-text text-transparent">
                            {t("contact.heading2", "Conversation.")}
                        </span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                        {t(
                            "contact.intro",
                            "Have a question, want to volunteer, or need information about Blood Connect? Send us a message — our team will do its best to assist you."
                        )}
                    </p>
                </div>
            </section>

            {/* Contact methods + Form */}
            <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-20 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
                        <span className="eyebrow">{t("contact.infoEyebrow", "Contact Information")}</span>
                    </div>
                    <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight">
                        {t("contact.infoTitle", "We'd Love to Hear From You")}
                    </h2>
                    <p className="mt-3 leading-8 text-muted-foreground">
                        {t(
                            "contact.infoText",
                            "Whether you are a blood donor, volunteer, patient, or someone who wants to support our initiative, feel free to reach out."
                        )}
                    </p>

                    <div className="mt-8 space-y-3">
                        {contactMethods.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.key} className="premium-card flex items-start gap-4 p-4">
                                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/15">
                                        <Icon size={19} strokeWidth={2.1} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-display text-sm font-extrabold text-foreground">
                                            {t(`contact.methods.${item.key}.title`, item.title)}
                                        </h3>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {t(`contact.methods.${item.key}.description`, item.description)}
                                        </p>
                                        {item.href ? (
                                            <a
                                                href={item.href}
                                                className="mt-1.5 inline-block break-all text-sm font-bold text-primary transition hover:underline"
                                            >
                                                {item.value}
                                            </a>
                                        ) : (
                                            <p className="mt-1.5 text-sm font-bold text-foreground">
                                                {item.value}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative isolate mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-deep via-primary to-primary p-6 text-primary-foreground shadow-lg shadow-primary/20">
                        <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 size-52 rounded-full border-[20px] border-white/10" />
                        <div className="relative flex items-center gap-3">
                            <span className="grid size-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                                <Heart size={21} />
                            </span>
                            <h3 className="font-display text-xl font-extrabold">
                                {t("contact.urgentTitle", "Need Blood Urgently?")}
                            </h3>
                        </div>
                        <p className="relative mt-3 text-sm leading-7 text-primary-foreground/85">
                            {t(
                                "contact.urgentText",
                                "If someone needs blood, submit a blood request through our dedicated system so volunteers can review and coordinate it."
                            )}
                        </p>
                        <Link
                            to="/create-blood-requests"
                            className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-card px-5 py-3 text-sm font-extrabold text-primary-hover shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                        >
                            {t("contact.submitRequest", "Submit Blood Request")}
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                </div>

                {/* Form */}
                <div className="premium-card h-fit p-5 sm:p-8">
                    <div className="mb-7 flex items-start gap-3 border-b border-border/70 pb-5">
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/15">
                            <Send size={20} strokeWidth={2.1} />
                        </span>
                        <div>
                            <h2 className="font-display text-xl font-extrabold tracking-tight">
                                {t("text.Send Us a Message", "Send Us a Message")}
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t(
                                    "contact.formSubtitle",
                                    "Complete the form below and our team will get back to you."
                                )}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(submitForm)} noValidate className="space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label={t("contact.fullName", "Full Name")} required error={errors.fullName}>
                                <input
                                    {...register("fullName", {
                                        required: t("contact.errors.nameRequired", "Full name is required."),
                                        minLength: {
                                            value: 2,
                                            message: t("contact.errors.nameLength", "Name must contain at least 2 characters."),
                                        },
                                    })}
                                    placeholder={t("contact.placeholders.name", "Enter your full name")}
                                    className={inputClass(errors.fullName)}
                                />
                            </Field>

                            <Field label={t("contact.email", "Email Address")} error={errors.email}>
                                <input
                                    type="email"
                                    {...register("email", {
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: t("contact.errors.emailInvalid", "Enter a valid email address."),
                                        },
                                    })}
                                    placeholder="you@example.com"
                                    className={inputClass(errors.email)}
                                />
                            </Field>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label={t("contact.phone", "Phone Number")} error={errors.phone}>
                                <input
                                    type="tel"
                                    {...register("phone", {
                                        pattern: {
                                            value: /^\+?[0-9\s()-]{8,20}$/,
                                            message: t("contact.errors.phoneInvalid", "Enter a valid phone number."),
                                        },
                                    })}
                                    placeholder="+8801XXXXXXXXX"
                                    className={inputClass(errors.phone)}
                                />
                            </Field>

                            <Field label={t("contact.subject", "Subject")} required error={errors.subject}>
                                <Select
                                    {...register("subject", {
                                        required: t("contact.errors.subjectRequired", "Please select a subject."),
                                    })}
                                    value={watch("subject")}
                                    size="lg"
                                    defaultValue=""
                                    invalid={Boolean(errors.subject)}
                                    className="mt-4"
                                >
                                    <option value="" disabled>
                                        {t("contact.placeholders.subject", "Select a subject")}
                                    </option>
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Become a Volunteer">Become a Volunteer</option>
                                    <option value="Donation Support">Donation Support</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="Other">{t("text.Other", "Other")}</option>
                                </Select>
                            </Field>
                        </div>

                        <Field label={t("contact.message", "Your Message")} required error={errors.message}>
                            <textarea
                                rows={6}
                                {...register("message", {
                                    required: t("contact.errors.messageRequired", "Please enter your message."),
                                    minLength: {
                                        value: 10,
                                        message: t("contact.errors.messageLength", "Message must contain at least 10 characters."),
                                    },
                                    maxLength: {
                                        value: 2000,
                                        message: t("contact.errors.messageMax", "Message cannot exceed 2000 characters."),
                                    },
                                })}
                                placeholder={t("contact.placeholders.message", "Write your message here...")}
                                className={`${inputClass(errors.message)} resize-y py-3.5`}
                            />
                        </Field>

                        {submitStatus.message && (
                            <div
                                role="status"
                                className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${submitStatus.type === "success"
                                    ? "border-success/25 bg-success-soft text-success-deep"
                                    : "border-destructive/25 bg-destructive/10 text-destructive"
                                    }`}
                            >
                                {submitStatus.type === "success" ? (
                                    <CheckCircle2 size={18} className="shrink-0" />
                                ) : (
                                    <AlertCircle size={18} className="shrink-0" />
                                )}
                                <p>{submitStatus.message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-premium w-full py-3.5 text-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoaderCircle size={18} className="animate-spin" />
                                    {t("contact.sending", "Sending...")}
                                </>
                            ) : (
                                <>
                                    {t("contact.send", "Send Message")}
                                    <Send size={17} />
                                </>
                            )}
                        </button>

                        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                            <ShieldCheck size={13} />
                            {t(
                                "contact.privacyNote",
                                "Your contact information will only be used to respond to your inquiry."
                            )}
                        </p>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default Contact;
