import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Droplet,
    HeartPulse,
    MapPin,
    Phone,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { toInternationalPhone } from "../utils/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const inputClass =
    "mt-2 h-12 w-full rounded-xl border border-[#e9e5e2] bg-[#fcfbfa] px-4 text-sm font-medium text-[#172321] outline-none transition placeholder:font-normal placeholder:text-[#a0a9a5] focus:border-[#d45b69] focus:bg-white focus:ring-4 focus:ring-[#dc263a]/[0.07] disabled:cursor-not-allowed disabled:bg-[#f4f2f1] disabled:opacity-60";
const labelClass = "text-[13px] font-bold text-[#34413b]";
const errorClass = "mt-1.5 text-xs font-medium text-[#b42336]";
const today = () => new Date().toISOString().split("T")[0];

export default function BloodRequestForm({ onSubmit, onCancel, locations = [] }) {
    const { t } = useTranslation();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            patientName: "",
            bloodGroup: "",
            urgency: "urgent",
            units: 1,
            division: "",
            district: "",
            upazila: "",
            hospitalName: "",
            hospitalAddress: "",
            neededAt: "",
            contactName: "",
            contactPhone: "",
            details: "",
        },
        mode: "onBlur",
    });

    const selectedBloodGroup = watch("bloodGroup");
    const selectedUrgency = watch("urgency");
    const selectedDivision = watch("division");
    const selectedDistrict = watch("district");

    const divisions = locations.filter((item) => item.type === "division");
    const districts = locations.filter(
        (item) => item.type === "district" && String(item.parent) === selectedDivision
    );
    const upazilas = locations.filter(
        (item) => item.type === "upazila" && String(item.parent) === selectedDistrict
    );

    const submit = async (values) => {
        if (typeof onSubmit !== "function") {
            setError("root.server", {
                type: "manual",
                message: t(
                    "bloodRequest.form.notConnected",
                    "The form is ready, but submission has not been connected to your backend yet."
                ),
            });
            return;
        }

        try {
            await onSubmit({
                ...values,
                units: Number(values.units),
                patientName: values.patientName.trim(),
                hospitalName: values.hospitalName.trim(),
                hospitalAddress: (values.hospitalAddress || "").trim(),
                contactName: values.contactName.trim(),
                contactPhone: toInternationalPhone(values.contactPhone),
                details: (values.details || "").trim(),
            });
            reset();
        } catch (error) {
            setError("root.server", {
                type: "server",
                message:
                    error?.message ||
                    t(
                        "bloodRequest.form.submitError",
                        "We couldn't submit your request. Please try again."
                    ),
            });
        }
    };

    const requiredRule = (field) =>
        t("bloodRequest.form.validation.required", `${field} is required`);

    return (
        <section className="relative isolate overflow-hidden px-4 py-12 sm:px-6 sm:py-16">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[500px] rounded-full bg-[radial-gradient(circle,rgba(220,38,58,0.10)_0%,transparent_68%)]"
            />

            <div className="mx-auto max-w-5xl">
                <header className="mb-8 max-w-2xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs font-bold text-[#68746e] shadow-sm">
                        <span className="size-2 rounded-full bg-primary" />
                        {t("bloodRequest.form.eyebrow", "HELP SOMEONE IN NEED")}
                    </div>
                    <h1 className="text-3xl leading-tight font-extrabold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                        {t("bloodRequest.form.title", "Create a blood request")}
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground/70 sm:text-base">
                        {t(
                            "bloodRequest.form.subtitle",
                            "Share the essential details so nearby donors can understand how and when to help."
                        )}
                    </p>
                </header>

                <form
                    noValidate
                    onSubmit={handleSubmit(submit)}
                    className="overflow-hidden rounded-[28px] border border-primary/10 bg-linear-to-tr from-primary/2 to-white shadow-xl shadow-primary/10"
                >
                    <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
                        <div className="p-5 sm:p-8 lg:p-9">
                            <SectionHeading
                                icon={<Droplet size={19} />}
                                title={t("bloodRequest.form.patientSection", "Patient & blood details")}
                                subtitle={t("bloodRequest.form.patientHint", "Tell donors what is needed")}
                            />

                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="sm:col-span-2">
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.patientName", "Patient name")}
                                    </span>
                                    <input
                                        {...register("patientName", {
                                            required: requiredRule("Patient name"),
                                            minLength: {
                                                value: 2,
                                                message: t("bloodRequest.form.validation.patientName", "Name must be at least 2 characters"),
                                            },
                                        })}
                                        className={inputClass}
                                        placeholder={t("bloodRequest.form.patientNamePlaceholder", "Enter patient's full name")}
                                        autoComplete="name"
                                        aria-invalid={Boolean(errors.patientName)}
                                    />
                                    <FieldError error={errors.patientName} />
                                </label>

                                <fieldset className="sm:col-span-2">
                                    <legend className={labelClass}>
                                        {t("bloodRequest.form.bloodGroup", "Required blood group")}
                                    </legend>
                                    <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
                                        {bloodGroups.map((group) => (
                                            <label key={group} className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value={group}
                                                    {...register("bloodGroup", {
                                                        required: t("bloodRequest.form.validation.bloodGroup", "Please select a blood group"),
                                                    })}
                                                    className="peer sr-only"
                                                />
                                                <span
                                                    className={`grid h-11 place-items-center rounded-xl border text-sm font-extrabold transition-all peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#c51f35] ${selectedBloodGroup === group
                                                        ? "border-[#c51f35] bg-[#c51f35] text-white shadow-[0_6px_15px_rgba(197,31,53,0.2)]"
                                                        : "border-[#eee9e6] bg-[#fcfbfa] text-[#59645f] hover:border-[#e7aab1] hover:bg-[#fff5f5] hover:text-[#c51f35]"
                                                        }`}
                                                >
                                                    {group}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <FieldError error={errors.bloodGroup} />
                                </fieldset>

                                <fieldset className="sm:col-span-2">
                                    <legend className={labelClass}>
                                        {t("bloodRequest.form.urgency", "Urgency")}
                                    </legend>
                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                        {[
                                            { value: "normal", label: t("bloodRequest.form.normal", "Normal") },
                                            { value: "urgent", label: t("bloodRequest.form.urgent", "Urgent") },
                                            { value: "critical", label: t("bloodRequest.form.critical", "Critical") },
                                        ].map((option) => {
                                            const active = selectedUrgency === option.value;
                                            const activeClass =
                                                option.value === "critical"
                                                    ? "border-rose-600 bg-rose-600 text-white shadow-[0_6px_15px_rgba(225,29,72,0.25)]"
                                                    : option.value === "urgent"
                                                        ? "border-amber-500 bg-amber-500 text-white shadow-[0_6px_15px_rgba(245,158,11,0.25)]"
                                                        : "border-emerald-600 bg-emerald-600 text-white shadow-[0_6px_15px_rgba(5,150,105,0.25)]";
                                            return (
                                                <label key={option.value} className="cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        value={option.value}
                                                        {...register("urgency", {
                                                            required: t("bloodRequest.form.validation.urgency", "Please select an urgency level"),
                                                        })}
                                                        className="peer sr-only"
                                                    />
                                                    <span
                                                        className={`grid h-11 place-items-center rounded-xl border text-sm font-bold transition-all peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#c51f35] ${active ? activeClass : "border-[#eee9e6] bg-[#fcfbfa] text-[#59645f] hover:border-[#e7aab1]"}`}
                                                    >
                                                        {option.label}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <FieldError error={errors.urgency} />
                                </fieldset>

                                <label>
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.units", "Units required")}
                                    </span>
                                    <input
                                        type="number"
                                        {...register("units", {
                                            required: requiredRule("Units"),
                                            valueAsNumber: true,
                                            min: {
                                                value: 1,
                                                message: t("bloodRequest.form.validation.unitsMin", "At least 1 unit is required"),
                                            },
                                            max: {
                                                value: 10,
                                                message: t("bloodRequest.form.validation.unitsMax", "Maximum 10 units"),
                                            },
                                        })}
                                        className={inputClass}
                                        min="1"
                                        max="10"
                                        aria-invalid={Boolean(errors.units)}
                                    />
                                    <FieldError error={errors.units} />
                                </label>

                                <label>
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.requiredDate", "Needed by")}
                                    </span>
                                    <span className="relative block">
                                        <CalendarDays
                                            size={17}
                                            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#9aa39f]"
                                        />
                                        <input
                                            type="date"
                                            {...register("neededAt", {
                                                required: requiredRule("Required date"),
                                                validate: (value) =>
                                                    value >= today() ||
                                                    t("bloodRequest.form.validation.date", "Date cannot be in the past"),
                                            })}
                                            min={today()}
                                            className={`${inputClass} pl-11`}
                                            aria-invalid={Boolean(errors.neededAt)}
                                        />
                                    </span>
                                    <FieldError error={errors.neededAt} />
                                </label>
                            </div>

                            <Divider />

                            <SectionHeading
                                icon={<MapPin size={19} />}
                                title={t("bloodRequest.form.locationSection", "Hospital & location")}
                                subtitle={t("bloodRequest.form.locationHint", "Where should donors go?")}
                            />

                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="sm:col-span-2">
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.hospital", "Hospital / medical centre")}
                                    </span>
                                    <input
                                        {...register("hospitalName", {
                                            required: requiredRule("Hospital"),
                                            minLength: {
                                                value: 2,
                                                message: t("bloodRequest.form.validation.hospital", "Enter a valid hospital name"),
                                            },
                                        })}
                                        className={inputClass}
                                        placeholder={t("bloodRequest.form.hospitalPlaceholder", "Enter hospital name")}
                                        aria-invalid={Boolean(errors.hospitalName)}
                                    />
                                    <FieldError error={errors.hospitalName} />
                                </label>

                                <label>
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.division", "Division")}
                                    </span>
                                    <select
                                        {...register("division", {
                                            required: requiredRule("Division"),
                                            onChange: () => {
                                                setValue("district", "");
                                                setValue("upazila", "");
                                            },
                                        })}
                                        className={inputClass}
                                        aria-invalid={Boolean(errors.division)}
                                    >
                                        <option value="">Select division</option>
                                        {divisions.map((item) => (
                                            <option key={item._id} value={item._id}>{item.nameEn}</option>
                                        ))}
                                    </select>
                                    <FieldError error={errors.division} />
                                </label>

                                <label>
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.district", "District")}
                                    </span>
                                    <select
                                        {...register("district", {
                                            required: requiredRule("District"),
                                            onChange: () => setValue("upazila", ""),
                                        })}
                                        className={inputClass}
                                        disabled={!selectedDivision}
                                        aria-invalid={Boolean(errors.district)}
                                    >
                                        <option value="">Select district</option>
                                        {districts.map((item) => (
                                            <option key={item._id} value={item._id}>{item.nameEn}</option>
                                        ))}
                                    </select>
                                    <FieldError error={errors.district} />
                                </label>

                                <label>
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.upazila", "Upazila (optional)")}
                                    </span>
                                    <select
                                        {...register("upazila")}
                                        className={inputClass}
                                        disabled={!selectedDistrict}
                                    >
                                        <option value="">Select upazila</option>
                                        {upazilas.map((item) => (
                                            <option key={item._id} value={item._id}>{item.nameEn}</option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.hospitalAddress", "Hospital address / area")}
                                    </span>
                                    <input
                                        {...register("hospitalAddress", {
                                            required: requiredRule("Hospital address"),
                                        })}
                                        className={inputClass}
                                        placeholder="e.g. Tangail Sadar, Dhaka"
                                        aria-invalid={Boolean(errors.hospitalAddress)}
                                    />
                                    <FieldError error={errors.hospitalAddress} />
                                </label>
                            </div>

                            <Divider />

                            <SectionHeading
                                icon={<Phone size={18} />}
                                title={t("bloodRequest.form.contactSection", "Contact information")}
                                subtitle={t("bloodRequest.form.contactHint", "How can potential donors reach you?")}
                            />

                            <div className="grid gap-5 sm:grid-cols-2">
                                <label>
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.contactName", "Contact person")}
                                    </span>
                                    <span className="relative block">
                                        <UserRound
                                            size={17}
                                            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#9aa39f]"
                                        />
                                        <input
                                            {...register("contactName", {
                                                required: requiredRule("Contact name"),
                                                minLength: {
                                                    value: 2,
                                                    message: t("bloodRequest.form.validation.contactName", "Enter a valid contact name"),
                                                },
                                            })}
                                            className={`${inputClass} pl-11`}
                                            placeholder={t("bloodRequest.form.contactNamePlaceholder", "Your name")}
                                            autoComplete="name"
                                            aria-invalid={Boolean(errors.contactName)}
                                        />
                                    </span>
                                    <FieldError error={errors.contactName} />
                                </label>

                                <label>
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.contactPhone", "Phone number")}
                                    </span>
                                    <span className="relative block">
                                        <Phone
                                            size={16}
                                            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#9aa39f]"
                                        />
                                        <input
                                            type="tel"
                                            {...register("contactPhone", {
                                                required: requiredRule("Phone number"),
                                                pattern: {
                                                    value: /^(?:\+?88)?01[3-9]\d{8}$/,
                                                    message: t("bloodRequest.form.validation.phone", "Enter a valid phone number"),
                                                },
                                            })}
                                            className={`${inputClass} pl-11`}
                                            placeholder="01XXXXXXXXX"
                                            autoComplete="tel"
                                            aria-invalid={Boolean(errors.contactPhone)}
                                        />
                                    </span>
                                    <FieldError error={errors.contactPhone} />
                                </label>

                                <label className="sm:col-span-2">
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.details", "Additional information")}
                                        <span className="ml-1 font-medium text-[#9aa39f]">
                                            ({t("bloodRequest.form.optional", "optional")})
                                        </span>
                                    </span>
                                    <textarea
                                        {...register("details", {
                                            maxLength: {
                                                value: 1000,
                                                message: t("bloodRequest.form.validation.details", "Maximum 1,000 characters"),
                                            },
                                        })}
                                        rows={4}
                                        maxLength={1000}
                                        className="mt-2 w-full resize-y rounded-xl border border-[#e9e5e2] bg-[#fcfbfa] px-4 py-3 text-sm leading-6 text-[#172321] outline-none transition placeholder:text-[#a0a9a5] focus:border-[#d45b69] focus:bg-white focus:ring-4 focus:ring-[#dc263a]/[0.07]"
                                        placeholder={t("bloodRequest.form.detailsPlaceholder", "Add helpful details for donors (up to 1,000 characters)")}
                                        aria-invalid={Boolean(errors.details)}
                                    />
                                    <FieldError error={errors.details} />
                                </label>
                            </div>

                            {errors.root?.server && (
                                <p role="alert" className="mt-5 rounded-xl border border-[#f2c9cd] bg-[#fff4f4] px-4 py-3 text-sm font-medium text-[#a51f32]">
                                    {errors.root.server.message}
                                </p>
                            )}

                            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#f0ece9] pt-6 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="inline-flex h-12 items-center justify-center rounded-xl px-4 text-sm font-bold text-[#737f79] transition hover:bg-[#f7f5f3] hover:text-[#172321]"
                                >
                                    {t("bloodRequest.form.cancel", "Cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-6 text-sm font-extrabold text-white shadow-[0_9px_22px_rgba(185,31,53,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_13px_26px_rgba(185,31,53,0.27)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c51f35] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting
                                        ? t("bloodRequest.form.submitting", "Submitting...")
                                        : t("bloodRequest.form.submit", "Submit blood request")}
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>

                        <aside className="border-t border-primary/10 bg-primary/3 p-5 sm:p-8 lg:border-t-0 lg:border-l lg:p-7">
                            <div className="grid size-12 place-items-center rounded-2xl bg-primary/20 text-primary">
                                <HeartPulse size={22} />
                            </div>
                            <h3 className="mt-5 text-lg font-extrabold tracking-[-0.03em] text-primary">
                                {t("bloodRequest.form.sideTitle", "A few things to remember")}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {t("bloodRequest.form.sideDescription", "Clear and accurate information helps people respond to your request.")}
                            </p>
                            <div className="mt-6 space-y-4">
                                {[
                                    t("bloodRequest.form.tip1", "Double-check the required blood group and number of units."),
                                    t("bloodRequest.form.tip2", "Provide the exact hospital name and area."),
                                    t("bloodRequest.form.tip3", "Use a phone number that donors can reach."),
                                ].map((tip) => (
                                    <div key={tip} className="flex gap-3">
                                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#eaf5ef] text-[#277653]">
                                            <CheckCircle2 size={13} />
                                        </span>
                                        <p className="text-xs leading-5 text-[#68746e]">{tip}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 rounded-2xl border border-border bg-white p-4">
                                <div className="flex items-center gap-2 text-[#277653]">
                                    <ShieldCheck size={17} />
                                    <span className="text-xs font-extrabold">
                                        {t("bloodRequest.form.privacyTitle", "Protect personal information")}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs leading-5 text-[#89948e]">
                                    {t("bloodRequest.form.privacyText", "Only share contact details you are comfortable making available to potential donors.")}
                                </p>
                            </div>
                            <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-[#929b96]">
                                <Clock3 size={14} />
                                {t("bloodRequest.form.quickNote", "It only takes a few minutes")}
                            </div>
                        </aside>
                    </div>
                </form>
            </div>
        </section>
    );
}

function SectionHeading({ icon, title, subtitle }) {
    return (
        <div className="mb-6 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#fff0f1] text-[#c51f35]">
                {icon}
            </span>
            <div>
                <h2 className="text-base font-extrabold text-[#172321]">{title}</h2>
                <p className="mt-0.5 text-xs text-[#929b96]">{subtitle}</p>
            </div>
        </div>
    );
}

function Divider() {
    return <div className="my-8 border-t border-[#f0ece9]" />;
}

function FieldError({ error }) {
    if (!error) return null;
    return <p role="alert" className={errorClass}>{error.message}</p>;
}
