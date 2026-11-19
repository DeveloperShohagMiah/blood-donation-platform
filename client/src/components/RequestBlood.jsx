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
import Select from "./Select";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const inputClass =
    "mt-2 h-12 w-full rounded-xl border border-border bg-surface-soft px-4 text-sm font-medium text-foreground outline-none transition placeholder:font-normal placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/[0.07] disabled:cursor-not-allowed disabled:bg-surface-soft disabled:opacity-60";
const labelClass = "text-[13px] font-bold text-foreground";
const errorClass = "mt-1.5 text-xs font-medium text-destructive";
const today = () => new Date().toISOString().split("T")[0];

export default function BloodRequestForm({ onSubmit, onCancel, locations = [], embedded = false }) {
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
            union: "",
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
    const selectedUpazila = watch("upazila");
    const selectedUnion = watch("union");

    const divisions = locations.filter((item) => item.type === "division");
    const districts = locations.filter(
        (item) => item.type === "district" && String(item.parent) === selectedDivision
    );
    const upazilas = locations.filter(
        (item) => item.type === "upazila" && String(item.parent) === selectedDistrict
    );
    const unions = locations.filter(
        (item) => item.type === "union" && String(item.parent) === selectedUpazila
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
        <section className={embedded ? "relative isolate overflow-hidden" : "relative isolate overflow-hidden px-4 py-12 sm:px-6 sm:py-16"}>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[500px] rounded-full bg-primary/10 blur-3xl"
            />

            <div className="mx-auto max-w-5xl">
                {!embedded && (
                    <header className="mb-8 max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs font-bold text-muted-foreground shadow-sm">
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
                )}

                <form
                    noValidate
                    onSubmit={handleSubmit(submit)}
                    className="overflow-hidden rounded-[28px] border border-primary/10 bg-linear-to-tr from-primary/2 to-card shadow-xl shadow-primary/10"
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
                                <label>
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.division", "Division")}
                                    </span>
                                    <Select
                                        {...register("division", {
                                            required: requiredRule("Division"),
                                            onChange: () => {
                                                setValue("district", "");
                                                setValue("upazila", "");
                                                setValue("union", "");
                                            },
                                        })}
                                        value={selectedDivision}
                                        size="lg"
                                        invalid={Boolean(errors.division)}
                                    >
                                        <option value="">{t("text.Select division")}</option>
                                        {divisions.map((item) => (
                                            <option key={item._id} value={item._id}>{item.nameEn}</option>
                                        ))}
                                    </Select>
                                    <FieldError error={errors.division} />
                                </label>

                                <label>
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.district", "District")}
                                    </span>
                                    <Select
                                        {...register("district", {
                                            required: requiredRule("District"),
                                            onChange: () => {
                                                setValue("upazila", "");
                                                setValue("union", "");
                                            },
                                        })}
                                        value={selectedDistrict}
                                        size="lg"
                                        disabled={!selectedDivision}
                                        invalid={Boolean(errors.district)}
                                    >
                                        <option value="">{t("text.Select district")}</option>
                                        {districts.map((item) => (
                                            <option key={item._id} value={item._id}>{item.nameEn}</option>
                                        ))}
                                    </Select>
                                    <FieldError error={errors.district} />
                                </label>

                                <label>
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.upazila", "Upazila (optional)")}
                                    </span>
                                    <Select
                                        {...register("upazila", {
                                            onChange: () => setValue("union", ""),
                                        })}
                                        value={selectedUpazila}
                                        size="lg"
                                        disabled={!selectedDistrict}
                                    >
                                        <option value="">{t("text.Select upazila")}</option>
                                        {upazilas.map((item) => (
                                            <option key={item._id} value={item._id}>{item.nameEn}</option>
                                        ))}
                                    </Select>
                                </label>

                                <label>
                                    <span className={labelClass}>
                                        {t("text.Union (optional)", "Union (optional)")}
                                    </span>
                                    <Select
                                        {...register("union")}
                                        value={selectedUnion}
                                        size="lg"
                                        disabled={!selectedUpazila}
                                    >
                                        <option value="">{t("text.Select union", "Select union")}</option>
                                        {unions.map((item) => (
                                            <option key={item._id} value={item._id}>{item.nameEn}</option>
                                        ))}
                                    </Select>
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
                                                    className={`grid h-11 place-items-center rounded-xl border text-sm font-extrabold transition-all peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${selectedBloodGroup === group
                                                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                                                        : "border-border bg-surface-soft text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
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
                                                    ? "border-destructive bg-destructive text-primary-foreground shadow-md"
                                                    : option.value === "urgent"
                                                        ? "border-chart-3 bg-chart-3 text-primary-foreground shadow-md"
                                                        : "border-success bg-success text-primary-foreground shadow-md";
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
                                                        className={`grid h-11 place-items-center rounded-xl border text-sm font-bold transition-all peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${active ? activeClass : "border-border bg-surface-soft text-muted-foreground hover:border-primary/30"}`}
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
                                            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground"
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


                                <label className="col-span-2">
                                    <span className={labelClass}>
                                        {t("bloodRequest.form.hospitalAddress", "Hospital address / area")}
                                    </span>
                                    <textarea
                                        {...register("hospitalAddress", {
                                            required: requiredRule("Hospital address"),
                                        })}
                                        rows={2}
                                        maxLength={1000}
                                        className="mt-2 w-full resize-y rounded-xl border border-border bg-surface-soft px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/[0.07]"
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
                                            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground"
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
                                            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground"
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
                                        <span className="ml-1 font-medium text-muted-foreground">
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
                                        className="mt-2 w-full resize-y rounded-xl border border-border bg-surface-soft px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/[0.07]"
                                        placeholder={t("bloodRequest.form.detailsPlaceholder", "Add helpful details for donors (up to 1,000 characters)")}
                                        aria-invalid={Boolean(errors.details)}
                                    />
                                    <FieldError error={errors.details} />
                                </label>
                            </div>

                            {errors.root?.server && (
                                <p role="alert" className="mt-5 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-destructive">
                                    {errors.root.server.message}
                                </p>
                            )}

                            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="inline-flex h-12 items-center justify-center rounded-xl px-4 text-sm font-bold text-muted-foreground transition hover:bg-surface-soft hover:text-foreground"
                                >
                                    {t("bloodRequest.form.cancel", "Cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-premium h-12 px-6 text-sm font-extrabold"
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
                                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success-deep">
                                            <CheckCircle2 size={13} />
                                        </span>
                                        <p className="text-xs leading-5 text-muted-foreground">{tip}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 rounded-2xl border border-border bg-card p-4">
                                <div className="flex items-center gap-2 text-success-deep">
                                    <ShieldCheck size={17} />
                                    <span className="text-xs font-extrabold">
                                        {t("bloodRequest.form.privacyTitle", "Protect personal information")}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                    {t("bloodRequest.form.privacyText", "Only share contact details you are comfortable making available to potential donors.")}
                                </p>
                            </div>
                            <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
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
            <span className="grid size-10 place-items-center rounded-2xl bg-primary/5 text-primary">
                {icon}
            </span>
            <div>
                <h2 className="text-base font-extrabold text-foreground">{title}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            </div>
        </div>
    );
}

function Divider() {
    return <div className="my-8 border-t border-border" />;
}

function FieldError({ error }) {
    if (!error) return null;
    return <p role="alert" className={errorClass}>{error.message}</p>;
}
