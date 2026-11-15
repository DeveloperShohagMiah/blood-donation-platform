import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    Eye,
    EyeOff,
    HeartHandshake,
    Loader2,
    Lock,
    ShieldCheck,
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { bdLocations } from "../utils/BDLocations";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const genders = ["Male", "Female", "Other"];

const initialForm = {
    fullName: "",
    phone: "",
    email: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    weight: "",
    neverDonated: false,
    lastDonation: "",
    division: "",
    district: "",
    upazila: "",
    available: true,
    password: "",
    agreeHealth: false,
    agreeContact: false,
};

const todayISO = () => new Date().toISOString().split("T")[0];

const ageFrom = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
};

const daysSince = (iso) =>
    Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

/* Bangladesh mobile: 01XXXXXXXXX, +8801XXXXXXXXX or 8801XXXXXXXXX */
const phoneOk = (v) => /^(?:\+?88)?01[3-9]\d{8}$/.test(v.replace(/[\s-]/g, ""));

const inputClass = (error, extra = "") =>
    [
        "h-12 w-full rounded-xl border bg-[#F4F7F9] px-4 text-[15px] font-medium text-[#192623] outline-none transition",
        "placeholder:font-normal placeholder:text-[#9AA6A1] focus:bg-white focus:ring-4",
        error
            ? "border-[#E11D48] focus:border-[#E11D48] focus:ring-[#E11D48]/10"
            : "border-[#E4EBE7] focus:border-[#C62838] focus:ring-[#C62838]/10",
        extra,
    ].join(" ");

/* Label + control + hint/error wrapper */
const Field = ({ id, label, required, hint, error, children, className = "" }) => (
    <div className={className}>
        <label htmlFor={id} className="mb-2 block text-sm font-bold text-[#192623]">
            {label}
            {required ? (
                <span className="text-[#C62838]" aria-hidden="true"> *</span>
            ) : (
                <span className="ml-1.5 text-xs font-medium text-[#84918C]">(optional)</span>
            )}
        </label>
        {children}
        {error ? (
            <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[#E11D48]">
                <AlertCircle size={14} /> {error}
            </p>
        ) : (
            hint && (
                <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-[#84918C]">
                    {hint}
                </p>
            )
        )}
    </div>
);

const describedBy = (id, error, hint) =>
    error ? `${id}-error` : hint ? `${id}-hint` : undefined;

const StepTitle = ({ n, title }) => (
    <div className="mb-6 flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-[#192623] text-sm font-bold text-white">
            {n}
        </span>
        <h3 className="text-lg font-extrabold text-[#192623]">{title}</h3>
    </div>
);

const BecomeDonor = () => {
    const { t } = useTranslation();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const divisions = Object.keys(bdLocations);
    const districts = form.division ? Object.keys(bdLocations[form.division]) : [];
    const upazilas = form.division && form.district ? bdLocations[form.division][form.district] : [];

    const update = (key, value) => {
        setForm((f) => {
            const next = { ...f, [key]: value };
            if (key === "division") {
                next.district = "";
                next.upazila = "";
            }
            if (key === "district") next.upazila = "";
            if (key === "neverDonated" && value) next.lastDonation = "";
            return next;
        });
        setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
    };

    const onText = (key) => (e) => update(key, e.target.value);

    const recentDonation = useMemo(
        () => !form.neverDonated && form.lastDonation && daysSince(form.lastDonation) < 90,
        [form.neverDonated, form.lastDonation]
    );

    const validate = () => {
        const e = {};
        const age = ageFrom(form.dob);

        if (form.fullName.trim().length < 3) e.fullName = t("register.err.name", "Enter your full name.");
        if (!phoneOk(form.phone)) e.phone = t("register.err.phone", "Enter a valid mobile number, e.g. 01712345678.");
        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = t("register.err.email", "Enter a valid email address.");
        if (!form.gender) e.gender = t("register.err.gender", "Select your gender.");
        if (!form.dob) e.dob = t("register.err.dob", "Select your date of birth.");
        else if (age < 18 || age > 60) e.dob = t("register.err.age", "Donors must be between 18 and 60 years old.");
        if (!form.bloodGroup) e.bloodGroup = t("register.err.group", "Select your blood group.");
        if (!form.weight) e.weight = t("register.err.weightReq", "Enter your weight in kg.");
        else if (Number(form.weight) < 50) e.weight = t("register.err.weight", "You need to weigh at least 50 kg to donate.");
        if (!form.neverDonated && !form.lastDonation) e.lastDonation = t("register.err.last", "Pick a date or tick “I have never donated”.");
        if (!form.division) e.division = t("register.err.division", "Select your division.");
        if (!form.district) e.district = t("register.err.district", "Select your district.");
        if (!form.upazila) e.upazila = t("register.err.upazila", "Select your area.");
        if (form.password.length < 8) e.password = t("register.err.password", "Use at least 8 characters.");
        if (!form.agreeHealth) e.agreeHealth = t("register.err.health", "Please confirm this to continue.");
        if (!form.agreeContact) e.agreeContact = t("register.err.contact", "Please confirm this to continue.");

        return e;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const found = validate();
        setErrors(found);

        const firstKey = Object.keys(found)[0];
        if (firstKey) {
            document.getElementById(firstKey)?.focus();
            return;
        }

        setSubmitting(true);
        try {
            /* TODO: replace with your API call, e.g.
               await fetch("/api/donors", {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                   body: JSON.stringify(form),
               });
            */
            await new Promise((r) => setTimeout(r, 900));
            setDone(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
            setErrors({ form: t("register.err.submit", "Something went wrong. Please try again.") });
        } finally {
            setSubmitting(false);
        }
    };

    const selectField = (id, label, options, placeholder, disabled) => (
        <Field id={id} label={label} required error={errors[id]}>
            <span className="relative block">
                <select
                    id={id}
                    value={form[id]}
                    onChange={onText(id)}
                    disabled={disabled}
                    aria-invalid={!!errors[id]}
                    aria-describedby={describedBy(id, errors[id])}
                    className={inputClass(errors[id], `appearance-none pr-10 ${disabled ? "cursor-not-allowed opacity-60" : ""}`)}
                >
                    <option value="">{placeholder}</option>
                    {options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[#84918C]" />
            </span>
        </Field>
    );

    /* ---------- Success state ---------- */
    if (done) {
        return (
            <main className="grid min-h-[70vh] place-items-center bg-[#F8FAFB] px-4 py-20">
                <div className="w-full max-w-[520px] rounded-3xl bg-white p-8 text-center shadow-[0_24px_60px_rgba(11,16,32,0.1)] sm:p-12">
                    <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#E7F7EF] text-[#1E8E5A]">
                        <CheckCircle2 size={34} />
                    </span>
                    <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#192623]">
                        {t("register.doneTitle", "You’re a registered donor")}
                    </h1>
                    <p className="mt-3 text-[15px] leading-relaxed text-[#66736E]">
                        {t("register.doneText", "Thank you, {{name}}. People searching for {{group}} in {{place}} can now find you.", {
                            name: form.fullName.split(" ")[0],
                            group: form.bloodGroup,
                            place: form.district,
                        })}
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link to="/blood-requests" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#DC2626] px-6 text-sm font-bold text-white transition hover:bg-[#B91C1C]">
                            {t("register.seeRequests", "See open requests")}
                            <ArrowRight size={16} />
                        </Link>
                        <Link to="/" className="inline-flex h-12 items-center justify-center rounded-full border border-[#E4EBE7] px-6 text-sm font-bold text-[#192623] transition hover:border-[#C62838] hover:text-[#C62838]">
                            {t("register.goHome", "Back to home")}
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    /* ---------- Form ---------- */
    return (
        <main className="bg-[#F8FAFB] pb-20">
            {/* Page header */}
            <div className="bg-[#0B1020] pt-14 pb-28 sm:pt-16">
                <div className="mx-auto w-[calc(100%-2rem)] max-w-[1280px] md:w-[calc(100%-4rem)]">
                    <SectionHeader
                        tone="dark"
                        badge={{ icon: HeartHandshake, label: t("register.badge", "Become a donor") }}
                        title={t("register.title", "Register as a blood donor")}
                        subtitle={t("register.subtitle", "It takes about two minutes. Tell us your blood group and where you live so people nearby can reach you when it matters.")}
                    />
                </div>
            </div>

            <div className="mx-auto -mt-16 grid w-[calc(100%-2rem)] max-w-[1280px] items-start gap-8 md:w-[calc(100%-4rem)] lg:grid-cols-[1fr_340px]">
                {/* Form card */}
                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(11,16,32,0.12)] sm:p-9"
                >
                    {/* 1. Personal */}
                    <fieldset>
                        <StepTitle n={1} title={t("register.s1", "About you")} />
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field id="fullName" label={t("register.fullName", "Full name")} required error={errors.fullName} className="sm:col-span-2">
                                <input id="fullName" type="text" autoComplete="name" value={form.fullName} onChange={onText("fullName")} aria-invalid={!!errors.fullName} aria-describedby={describedBy("fullName", errors.fullName)} placeholder="e.g. Rafi Ahmed" className={inputClass(errors.fullName)} />
                            </Field>

                            <Field id="phone" label={t("register.phone", "Mobile number")} required error={errors.phone} hint={t("register.phoneHint", "Requesters will call this number.")}>
                                <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={onText("phone")} aria-invalid={!!errors.phone} aria-describedby={describedBy("phone", errors.phone, true)} placeholder="01XXXXXXXXX" className={inputClass(errors.phone)} />
                            </Field>

                            <Field id="email" label={t("register.email", "Email")} error={errors.email}>
                                <input id="email" type="email" autoComplete="email" value={form.email} onChange={onText("email")} aria-invalid={!!errors.email} aria-describedby={describedBy("email", errors.email)} placeholder="you@example.com" className={inputClass(errors.email)} />
                            </Field>

                            <Field id="gender" label={t("register.gender", "Gender")} required error={errors.gender}>
                                <div role="radiogroup" aria-label={t("register.gender", "Gender")} className="grid grid-cols-3 gap-2">
                                    {genders.map((g, i) => (
                                        <label key={g} className="cursor-pointer">
                                            <input
                                                id={i === 0 ? "gender" : undefined}
                                                type="radio"
                                                name="gender"
                                                value={g}
                                                checked={form.gender === g}
                                                onChange={() => update("gender", g)}
                                                className="peer sr-only"
                                            />
                                            <span className="grid h-12 place-items-center rounded-xl border border-[#E4EBE7] bg-[#F4F7F9] text-sm font-bold text-[#475650] transition peer-checked:border-[#192623] peer-checked:bg-[#192623] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#C62838]/50">
                                                {t(`register.${g.toLowerCase()}`, g)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </Field>

                            <Field id="dob" label={t("register.dob", "Date of birth")} required error={errors.dob}>
                                <input id="dob" type="date" autoComplete="bday" max={todayISO()} value={form.dob} onChange={onText("dob")} aria-invalid={!!errors.dob} aria-describedby={describedBy("dob", errors.dob)} className={inputClass(errors.dob)} />
                            </Field>
                        </div>
                    </fieldset>

                    <hr className="my-9 border-[#EEF1F4]" />

                    {/* 2. Blood and health */}
                    <fieldset>
                        <StepTitle n={2} title={t("register.s2", "Blood and health")} />

                        <Field id="bloodGroup" label={t("register.bloodGroup", "Blood group")} required error={errors.bloodGroup}>
                            <div role="radiogroup" aria-label={t("register.bloodGroup", "Blood group")} className="grid grid-cols-4 gap-2 sm:gap-3">
                                {bloodGroups.map((g, i) => (
                                    <label key={g} className="cursor-pointer">
                                        <input
                                            id={i === 0 ? "bloodGroup" : undefined}
                                            type="radio"
                                            name="bloodGroup"
                                            value={g}
                                            checked={form.bloodGroup === g}
                                            onChange={() => update("bloodGroup", g)}
                                            className="peer sr-only"
                                        />
                                        <span className="grid h-12 place-items-center rounded-xl border border-[#E4EBE7] bg-[#F4F7F9] text-base font-extrabold text-[#33443D] transition hover:border-[#F0BDC0] peer-checked:border-[#DC2626] peer-checked:bg-[#DC2626] peer-checked:text-white peer-checked:shadow-[0_8px_18px_rgba(220,38,38,0.3)] peer-focus-visible:ring-2 peer-focus-visible:ring-[#C62838]/50">
                                            {g}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </Field>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <Field id="weight" label={t("register.weight", "Weight (kg)")} required error={errors.weight} hint={t("register.weightHint", "Minimum 50 kg to donate.")}>
                                <input id="weight" type="number" inputMode="decimal" min="1" max="250" value={form.weight} onChange={onText("weight")} aria-invalid={!!errors.weight} aria-describedby={describedBy("weight", errors.weight, true)} placeholder="e.g. 65" className={inputClass(errors.weight)} />
                            </Field>

                            <div>
                                <Field id="lastDonation" label={t("register.last", "Last donation date")} required={!form.neverDonated} error={errors.lastDonation}>
                                    <input id="lastDonation" type="date" max={todayISO()} disabled={form.neverDonated} value={form.lastDonation} onChange={onText("lastDonation")} aria-invalid={!!errors.lastDonation} aria-describedby={describedBy("lastDonation", errors.lastDonation)} className={inputClass(errors.lastDonation, form.neverDonated ? "cursor-not-allowed opacity-50" : "")} />
                                </Field>
                                <label className="mt-2.5 inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-[#33443D]">
                                    <input type="checkbox" checked={form.neverDonated} onChange={(e) => update("neverDonated", e.target.checked)} className="size-4 accent-[#C62838]" />
                                    {t("register.never", "I have never donated")}
                                </label>
                            </div>
                        </div>

                        {recentDonation && (
                            <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#FFF9EB] p-3.5 text-sm leading-relaxed text-[#7A5A12]">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                {t("register.recent", "You donated less than 3 months ago. You can still register, but you may not be able to donate yet.")}
                            </p>
                        )}
                    </fieldset>

                    <hr className="my-9 border-[#EEF1F4]" />

                    {/* 3. Location */}
                    <fieldset>
                        <StepTitle n={3} title={t("register.s3", "Where you live")} />
                        <div className="grid gap-5 sm:grid-cols-3">
                            {selectField("division", t("register.division", "Division"), divisions, t("register.selectDivision", "Select division"), false)}
                            {selectField("district", t("register.district", "District"), districts, t("register.selectDistrict", "Select district"), !form.division)}
                            {selectField("upazila", t("register.upazila", "Area / Upazila"), upazilas, t("register.selectArea", "Select area"), !form.district)}
                        </div>

                        <label className="mt-6 flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-[#E4EBE7] bg-[#F8FAFB] p-4">
                            <span>
                                <span className="block text-[15px] font-bold text-[#192623]">
                                    {t("register.available", "I’m available to donate now")}
                                </span>
                                <span className="mt-0.5 block text-sm text-[#66736E]">
                                    {t("register.availableHint", "You can switch this off any time from your profile.")}
                                </span>
                            </span>
                            <span className="relative mt-0.5 shrink-0">
                                <input type="checkbox" role="switch" checked={form.available} onChange={(e) => update("available", e.target.checked)} className="peer sr-only" />
                                <span className="block h-7 w-12 rounded-full bg-[#C9D3CE] transition-colors peer-checked:bg-[#1E8E5A] peer-focus-visible:ring-4 peer-focus-visible:ring-[#1E8E5A]/25" />
                                <span className="absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                            </span>
                        </label>
                    </fieldset>

                    <hr className="my-9 border-[#EEF1F4]" />

                    {/* 4. Account */}
                    <fieldset>
                        <StepTitle n={4} title={t("register.s4", "Secure your profile")} />
                        <Field id="password" label={t("register.password", "Password")} required error={errors.password} hint={t("register.passwordHint", "At least 8 characters. You’ll use it to log in and edit your profile.")}>
                            <span className="relative block">
                                <Lock size={17} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#84918C]" />
                                <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={onText("password")} aria-invalid={!!errors.password} aria-describedby={describedBy("password", errors.password, true)} className={inputClass(errors.password, "pr-12 pl-11")} />
                                <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? t("register.hide", "Hide password") : t("register.show", "Show password")} className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[#66736E] hover:bg-[#EEF1F4]">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </span>
                        </Field>

                        <div className="mt-6 space-y-3.5">
                            {[
                                ["agreeHealth", t("register.agreeHealth", "I confirm the details above are true and I meet the basic health requirements to donate blood.")],
                                ["agreeContact", t("register.agreeContact", "I agree that my name, blood group, area and phone number can be shown to people searching for donors.")],
                            ].map(([key, label]) => (
                                <div key={key}>
                                    <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-[#33443D]">
                                        <input id={key} type="checkbox" checked={form[key]} onChange={(e) => update(key, e.target.checked)} aria-invalid={!!errors[key]} className="mt-0.5 size-[18px] shrink-0 accent-[#C62838]" />
                                        {label}
                                    </label>
                                    {errors[key] && (
                                        <p role="alert" className="mt-1 ml-[30px] flex items-center gap-1.5 text-[13px] font-medium text-[#E11D48]">
                                            <AlertCircle size={14} /> {errors[key]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </fieldset>

                    {errors.form && (
                        <p role="alert" className="mt-6 rounded-xl bg-[#FFF1F2] p-3.5 text-sm font-medium text-[#E11D48]">
                            {errors.form}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DC2626] to-[#E11D48] text-[15px] font-extrabold text-white shadow-[0_12px_26px_rgba(220,38,38,0.3)] outline-none transition hover:brightness-95 focus-visible:ring-4 focus-visible:ring-[#C62838]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                {t("register.submitting", "Registering…")}
                            </>
                        ) : (
                            <>
                                {t("register.submit", "Register as a donor")}
                                <ArrowRight size={18} strokeWidth={2.5} />
                            </>
                        )}
                    </button>

                    <p className="mt-5 text-center text-sm text-[#66736E]">
                        {t("register.haveAccount", "Already registered?")}{" "}
                        <Link to="/login" className="font-bold text-[#C62838] hover:underline">
                            {t("navigation.login", "Log in")}
                        </Link>
                    </p>
                </form>

                {/* Side panel */}
                <aside className="space-y-5 lg:sticky lg:top-24">
                    <div className="rounded-3xl bg-[#192623] p-7 text-white">
                        <h2 className="text-lg font-extrabold">
                            {t("register.reqTitle", "Before you register")}
                        </h2>
                        <ul className="mt-5 space-y-3.5">
                            {[
                                t("register.req1", "Aged 18 to 60"),
                                t("register.req2", "Weigh at least 50 kg"),
                                t("register.req3", "In good health on the day"),
                                t("register.req4", "3 to 4 months since your last donation"),
                            ].map((line) => (
                                <li key={line} className="flex gap-3 text-[15px] text-[#D5DFDA]">
                                    <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-[#6FD3A3]" />
                                    {line}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-3xl border border-[#E4EBE7] bg-white p-6">
                        <p className="flex items-center gap-2 font-bold text-[#192623]">
                            <ShieldCheck size={19} className="text-[#1E8E5A]" />
                            {t("register.privacyTitle", "Your privacy")}
                        </p>
                        <p className="mt-2.5 text-sm leading-relaxed text-[#66736E]">
                            {t("register.privacyText", "Blood donation is always voluntary. Nobody should ask you for money, and you can hide or delete your profile at any time.")}
                        </p>
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default BecomeDonor;