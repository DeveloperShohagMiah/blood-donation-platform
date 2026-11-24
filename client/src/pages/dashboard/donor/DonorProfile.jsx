import { useCallback, useEffect, useMemo, useState } from "react";
import LocationPicker from "../../../components/LocationPicker";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Droplets,
    HeartPulse,
    MapPin,
    Save,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { useAuth } from "../../../context/useAuth";
import Select from "../../../components/Select";
import { useApiData } from "../hooks";
import { formatDate } from "../format";
import { ErrorBanner, PageHeader } from "../components/UI";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const emptyForm = {
    bloodGroup: "",
    lastDonationDate: "",
    availability: "available",
    division: "",
    district: "",
    upazila: "",
    union: "",
    area: "",
    lat: null,
    lng: null,
    isPubliclyListed: true,
    allowContactRequests: true,
};

const inputClass = (hasError) =>
    ["input-premium h-11 px-3.5", hasError ? "is-invalid" : ""]
        .filter(Boolean)
        .join(" ");

const FieldError = ({ message }) =>
    message ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertCircle size={13} /> {message}
        </p>
    ) : null;

const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
    <section className="premium-card p-5 sm:p-6">
        <div className="flex items-start gap-3 border-b border-border/70 pb-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <Icon size={19} strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
                <h2 className="font-display text-base font-extrabold tracking-tight text-foreground">
                    {title}
                </h2>
                {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
        <div className="mt-5">{children}</div>
    </section>
);

const StatPill = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-3.5 py-2.5 ring-1 ring-white/20 backdrop-blur-md">
        <span className="grid size-8 place-items-center rounded-xl bg-white/15">
            <Icon size={16} />
        </span>
        <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">{label}</p>
            <p className="text-sm font-extrabold leading-tight">{value ?? "—"}</p>
        </div>
    </div>
);

const Toggle = ({ checked, onChange, label, description, icon: Icon }) => (
    <div
        className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-colors ${
            checked
                ? "border-primary/25 bg-primary/[0.03]"
                : "border-border bg-background hover:border-primary/30"
        }`}
    >
        <span
            className={`grid size-9 shrink-0 place-items-center rounded-xl transition-colors ${
                checked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
            }`}
        >
            <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 ${
                checked ? "bg-primary" : "bg-muted-foreground/25"
            }`}
        >
            <span
                className={`pointer-events-none absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    checked ? "translate-x-5" : "translate-x-0"
                }`}
            />
        </button>
    </div>
);

const DonorProfile = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const locationsQuery = useApiData("/locations");
    const donationsQuery = useApiData("/donations/me");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: emptyForm, mode: "onBlur" });

    const selectedGroup = watch("bloodGroup");
    const selectedDivision = watch("division");
    const selectedDistrict = watch("district");
    const selectedUpazila = watch("upazila");
    const availability = watch("availability");
    const isPubliclyListed = watch("isPubliclyListed");
    const allowContactRequests = watch("allowContactRequests");
    const latitude = watch("lat");
    const longitude = watch("lng");

    const setLocation = useCallback(
        ({ lat, lng }) => {
            setValue("lat", lat, { shouldDirty: true });
            setValue("lng", lng, { shouldDirty: true });
        },
        [setValue]
    );

    useEffect(() => {
        let active = true;
        apiFetch("/donors/me")
            .then((data) => {
                if (!active) return;
                const profile = data?.profile;
                if (profile) {
                    reset({
                        bloodGroup: profile.bloodGroup || "",
                        lastDonationDate: profile.lastDonationDate
                            ? String(profile.lastDonationDate).slice(0, 10)
                            : "",
                        availability: profile.availability || "available",
                        division: profile.division?._id || profile.division || "",
                        district: profile.district?._id || profile.district || "",
                        upazila: profile.upazila?._id || profile.upazila || "",
                        union: profile.union?._id || profile.union || "",
                        area: profile.area || "",
                        lat: profile.lat ?? null,
                        lng: profile.lng ?? null,
                        isPubliclyListed: Boolean(profile.isPubliclyListed),
                        allowContactRequests: Boolean(profile.allowContactRequests),
                    });
                }
            })
            .catch((err) => {
                if (active) setError(err.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [reset]);

    const locations = locationsQuery.data?.items || [];
    const { divisions, districts, upazilas, unions } = useMemo(
        () => ({
            divisions: locations.filter((item) => item.type === "division"),
            districts: locations.filter(
                (item) => item.type === "district" && String(item.parent) === selectedDivision
            ),
            upazilas: locations.filter(
                (item) => item.type === "upazila" && String(item.parent) === selectedDistrict
            ),
            unions: locations.filter(
                (item) => item.type === "union" && String(item.parent) === selectedUpazila
            ),
        }),
        [locations, selectedDivision, selectedDistrict, selectedUpazila]
    );

    const donations = donationsQuery.data?.items || [];
    const totalUnits = donations.reduce((sum, item) => sum + (item.units || 0), 0);
    const lastDonation = donations.reduce(
        (latest, item) => (!latest || new Date(item.donatedAt) > new Date(latest) ? item.donatedAt : latest),
        null
    );
    const initials = String(user?.fullName || "BC")
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const availabilityOptions = [
        {
            value: "available",
            label: t("text.Available", "Available"),
            hint: t("text.Ready to donate", "Ready to donate"),
            dot: "bg-success",
        },
        {
            value: "temporarily_unavailable",
            label: t("text.Temporarily unavailable", "Temporarily unavailable"),
            hint: t("text.Take a short break", "Take a short break"),
            dot: "bg-warning",
        },
        {
            value: "unavailable",
            label: t("text.Unavailable", "Unavailable"),
            hint: t("text.Paused for now", "Paused for now"),
            dot: "bg-muted-foreground",
        },
    ];

    const submit = async (values) => {
        setError("");
        setMessage("");
        try {
            await apiFetch("/donors/me", {
                method: "PUT",
                body: {
                    ...values,
                    lastDonationDate: values.lastDonationDate || null,
                    upazila: values.upazila || undefined,
                    union: values.union || undefined,
                },
            });
            setMessage(t("text.Profile saved", "Your donor profile has been saved."));
        } catch (err) {
            setError(err.message);
        }
    };

    const togglePublic = (checked) => {
        setValue("isPubliclyListed", checked, { shouldDirty: true, shouldValidate: true });
        if (checked) setValue("allowContactRequests", true, { shouldDirty: true, shouldValidate: true });
    };

    return (
        <>
            <PageHeader
                title={t("text.My donor profile", "My donor profile")}
                subtitle={t(
                    "text.Profile subtitle",
                    "Keep this up to date so requesters can find you when it matters."
                )}
            />

            <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-deep via-primary to-primary p-6 text-primary-foreground shadow-lg shadow-primary/20 sm:p-8">
                <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full border-[22px] border-white/10" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl font-extrabold ring-1 ring-white/25 backdrop-blur-md sm:size-20">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="eyebrow text-[10px] text-white/70">{t("text.Donor", "Donor")}</p>
                            <h2 className="font-display truncate text-2xl font-extrabold tracking-tight sm:text-3xl">
                                {user?.fullName || t("text.My profile", "My profile")}
                            </h2>
                            <p className="mt-1 truncate text-xs text-white/75">
                                {user?.phone}
                                {user?.email ? ` · ${user.email}` : ""}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <StatPill icon={Droplets} label={t("text.Donations", "Donations")} value={donations.length} />
                        <StatPill icon={HeartPulse} label={t("text.Units given", "Units given")} value={totalUnits} />
                        <StatPill
                            icon={CalendarDays}
                            label={t("text.Last donation", "Last donation")}
                            value={lastDonation ? formatDate(lastDonation) : "—"}
                        />
                    </div>
                </div>
            </div>

            <ErrorBanner message={error || locationsQuery.error || donationsQuery.error} />
            {message && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm font-medium text-success-deep">
                    <CheckCircle2 size={17} /> {message}
                </div>
            )}

            <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
                    <div className="space-y-6">
                        <SectionCard
                            icon={Sparkles}
                            title={t("text.Availability", "Availability")}
                            subtitle={t("text.Availability hint", "Let the community know if you can donate right now.")}
                        >
                            <input type="hidden" {...register("availability")} />
                            <div className="space-y-2">
                                {availabilityOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            setValue("availability", option.value, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            })
                                        }
                                        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                                            availability === option.value
                                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                : "border-border bg-background hover:border-primary/30"
                                        }`}
                                    >
                                        <span className={`size-2.5 shrink-0 rounded-full ${option.dot}`} />
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-bold text-foreground">
                                                {option.label}
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                {option.hint}
                                            </span>
                                        </span>
                                        {availability === option.value && (
                                            <CheckCircle2 size={16} className="shrink-0 text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </SectionCard>
                    </div>

                    <div className="space-y-6">
                        <SectionCard
                            icon={Droplets}
                            title={t("text.Donation details", "Donation details")}
                            subtitle={t("text.Donation details hint", "Your group and latest donation record.")}
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-bold text-foreground">
                                        {t("text.Blood group", "Blood group")} *
                                    </label>
                                    <input
                                        type="hidden"
                                        {...register("bloodGroup", {
                                            required: t("text.Blood group required", "Blood group is required."),
                                        })}
                                    />
                                    <div className="grid grid-cols-4 gap-2">
                                        {bloodGroups.map((group) => (
                                            <button
                                                key={group}
                                                type="button"
                                                onClick={() =>
                                                    setValue("bloodGroup", group, {
                                                        shouldDirty: true,
                                                        shouldValidate: true,
                                                    })
                                                }
                                                className={`h-11 rounded-xl border text-sm font-extrabold transition ${
                                                    selectedGroup === group
                                                        ? "border-primary bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-md shadow-primary/25"
                                                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary"
                                                }`}
                                            >
                                                {group}
                                            </button>
                                        ))}
                                    </div>
                                    <FieldError message={errors.bloodGroup?.message} />
                                </div>

                                <div>
                                    <label htmlFor="lastDonation" className="mb-2 block text-sm font-bold text-foreground">
                                        {t("text.Last donation date", "Last donation date")}
                                    </label>
                                    <input
                                        id="lastDonation"
                                        type="date"
                                        max={new Date().toISOString().split("T")[0]}
                                        {...register("lastDonationDate")}
                                        className={inputClass(errors.lastDonationDate)}
                                    />
                                    <FieldError message={errors.lastDonationDate?.message} />
                                </div>

                                <div>
                                    <label htmlFor="area" className="mb-2 block text-sm font-bold text-foreground">
                                        {t("text.Area / neighbourhood", "Area / neighbourhood")}
                                    </label>
                                    <input
                                        id="area"
                                        {...register("area")}
                                        placeholder={t("text.Area placeholder", "e.g. Tangail Sadar")}
                                        className={inputClass(errors.area)}
                                    />
                                    <FieldError message={errors.area?.message} />
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard
                            icon={MapPin}
                            title={t("text.Location", "Location")}
                            subtitle={t("text.Location hint", "Only Tangail locations are available.")}
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="division" className="mb-2 block text-sm font-bold text-foreground">
                                        {t("text.Division", "Division")} *
                                    </label>
                                    <Select
                                        id="division"
                                        size="lg"
                                        {...register("division", {
                                            required: t("text.Division required", "Division is required."),
                                            onChange: () => {
                                                setValue("district", "", { shouldDirty: true });
                                                setValue("upazila", "", { shouldDirty: true });
                                                setValue("union", "", { shouldDirty: true });
                                            },
                                        })}
                                        value={selectedDivision}
                                        invalid={Boolean(errors.division)}
                                    >
                                        <option value="">{t("text.Select division", "Select division")}</option>
                                        {divisions.map((item) => (
                                            <option key={item._id} value={item._id}>{item.nameEn}</option>
                                        ))}
                                    </Select>
                                    <FieldError message={errors.division?.message} />
                                </div>

                                <div>
                                    <label htmlFor="district" className="mb-2 block text-sm font-bold text-foreground">
                                        {t("text.District", "District")} *
                                    </label>
                                    <Select
                                        id="district"
                                        size="lg"
                                        {...register("district", {
                                            required: t("text.District required", "District is required."),
                                            onChange: () => {
                                                setValue("upazila", "", { shouldDirty: true });
                                                setValue("union", "", { shouldDirty: true });
                                            },
                                        })}
                                        value={selectedDistrict}
                                        disabled={!selectedDivision}
                                        invalid={Boolean(errors.district)}
                                    >
                                        <option value="">{t("text.Select district", "Select district")}</option>
                                        {districts.map((item) => (
                                            <option key={item._id} value={item._id}>{item.nameEn}</option>
                                        ))}
                                    </Select>
                                    <FieldError message={errors.district?.message} />
                                </div>

                                <div>
                                    <label htmlFor="upazila" className="mb-2 block text-sm font-bold text-foreground">
                                        {t("text.Upazila", "Upazila")}
                                    </label>
                                    <Select
                                        id="upazila"
                                        size="lg"
                                        {...register("upazila", {
                                            onChange: () => setValue("union", "", { shouldDirty: true }),
                                        })}
                                        value={selectedUpazila}
                                        disabled={!selectedDistrict}
                                    >
                                        <option value="">{t("text.Select upazila", "Select upazila")}</option>
                                        {upazilas.map((item) => (
                                            <option key={item._id} value={item._id}>{item.nameEn}</option>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="union" className="mb-2 block text-sm font-bold text-foreground">
                                        {t("text.Union", "Union")}
                                    </label>
                                    <Select
                                        id="union"
                                        size="lg"
                                        {...register("union")}
                                        value={watch("union")}
                                        disabled={!selectedUpazila}
                                    >
                                        <option value="">{t("text.Select union", "Select union")}</option>
                                        {unions.map((item) => (
                                            <option key={item._id} value={item._id}>{item.nameEn}</option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="mb-2 text-sm font-bold text-foreground">
                                    {t("text.Map location", "Map location")}
                                </h4>
                                <input type="hidden" {...register("lat")} />
                                <input type="hidden" {...register("lng")} />
                                <LocationPicker
                                    lat={typeof latitude === "number" ? latitude : null}
                                    lng={typeof longitude === "number" ? longitude : null}
                                    onChange={setLocation}
                                />
                            </div>
                        </SectionCard>

                        <SectionCard
                            icon={ShieldCheck}
                            title={t("text.Privacy & consent", "Privacy & consent")}
                            subtitle={t("text.Privacy hint", "You decide how much the community can see.")}
                        >
                            <input type="hidden" {...register("isPubliclyListed")} />
                            <input
                                type="hidden"
                                {...register("allowContactRequests", {
                                    validate: (value) =>
                                        !isPubliclyListed ||
                                        value ||
                                        t("text.Contact consent required", "Public listing requires contact-request consent."),
                                })}
                            />
                            <div className="space-y-3">
                                <Toggle
                                    checked={Boolean(isPubliclyListed)}
                                    onChange={togglePublic}
                                    icon={Sparkles}
                                    label={t("text.List me publicly", "List me publicly")}
                                    description={t(
                                        "text.List me publicly hint",
                                        "Show my name, blood group and area in the donor directory."
                                    )}
                                />
                                <Toggle
                                    checked={Boolean(allowContactRequests)}
                                    onChange={(value) =>
                                        setValue("allowContactRequests", value, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        })
                                    }
                                    icon={ShieldCheck}
                                    label={t("text.Allow contact requests", "Allow contact requests")}
                                    description={t(
                                        "text.Allow contact requests hint",
                                        "Let people send me a contact request through the platform."
                                    )}
                                />
                                <FieldError message={errors.allowContactRequests?.message} />
                            </div>
                        </SectionCard>
                    </div>
                </div>

                <div className="sticky bottom-4 z-10 flex justify-end rounded-2xl border border-border/80 bg-card/90 p-3 shadow-lg backdrop-blur-xl">
                    <button
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="btn-premium h-11 px-6 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save size={17} />
                        {isSubmitting
                            ? t("text.Saving…", "Saving…")
                            : t("text.Save profile", "Save profile")}
                    </button>
                </div>
            </form>
        </>
    );
};

export default DonorProfile;
