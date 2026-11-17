import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import Select from "../../../components/Select";
import { ErrorBanner, PageHeader } from "../components/UI";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const emptyForm = {
    bloodGroup: "",
    lastDonationDate: "",
    availability: "available",
    division: "",
    district: "",
    upazila: "",
    area: "",
    isPubliclyListed: true,
    allowContactRequests: true,
};

const inputClass = (hasError) =>
    [
        "h-11 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:bg-muted",
        hasError
            ? "border-rose-400 focus:border-rose-400 focus:ring-rose-500/10"
            : "border-border focus:border-primary focus:ring-primary/10",
    ].join(" ");

const FieldError = ({ message }) =>
    message ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <AlertCircle size={13} /> {message}
        </p>
    ) : null;

const DonorProfile = () => {
    const [locations, setLocations] = useState([]);
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
    const isPubliclyListed = watch("isPubliclyListed");

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [profileData, locationData] = await Promise.all([
                    apiFetch("/donors/me"),
                    apiFetch("/locations"),
                ]);
                if (!active) return;
                const profile = profileData?.profile;
                setLocations(locationData?.items || []);
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
                        area: profile.area || "",
                        isPubliclyListed: Boolean(profile.isPubliclyListed),
                        allowContactRequests: Boolean(profile.allowContactRequests),
                    });
                }
            } catch (err) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [reset]);

    const { divisions, districts, upazilas } = useMemo(
        () => ({
            divisions: locations.filter((i) => i.type === "division"),
            districts: locations.filter(
                (i) => i.type === "district" && String(i.parent) === selectedDivision
            ),
            upazilas: locations.filter(
                (i) => i.type === "upazila" && String(i.parent) === selectedDistrict
            ),
        }),
        [locations, selectedDivision, selectedDistrict]
    );

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
                },
            });
            setMessage("Your donor profile has been saved.");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <PageHeader
                title="My donor profile"
                subtitle="Keep this up to date so requesters can find you when it matters."
            />
            <ErrorBanner message={error} />
            {message && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={17} /> {message}
                </div>
            )}

            <form onSubmit={handleSubmit(submit)} noValidate className="max-w-3xl space-y-6">
                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                    <h2 className="font-extrabold text-foreground">Donation details</h2>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-foreground">
                                Blood group *
                            </label>
                            <input type="hidden" {...register("bloodGroup", { required: "Blood group is required." })} />
                            <div className="grid grid-cols-4 gap-2">
                                {bloodGroups.map((group) => (
                                    <button
                                        key={group}
                                        type="button"
                                        onClick={() => setValue("bloodGroup", group, { shouldValidate: true })}
                                        className={`h-10 rounded-xl border text-sm font-extrabold transition ${
                                            selectedGroup === group
                                                ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
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
                            <label htmlFor="availability" className="mb-2 block text-sm font-bold text-foreground">
                                Availability
                            </label>
                            <Select
                                id="availability"
                                size="lg"
                                {...register("availability")}
                                value={watch("availability")}
                            >
                                <option value="available">Available to donate</option>
                                <option value="temporarily_unavailable">Temporarily unavailable</option>
                                <option value="unavailable">Unavailable</option>
                            </Select>
                        </div>

                        <div>
                            <label htmlFor="lastDonation" className="mb-2 block text-sm font-bold text-foreground">
                                Last donation date
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
                                Area / neighbourhood
                            </label>
                            <input
                                id="area"
                                {...register("area")}
                                placeholder="e.g. Tangail Sadar"
                                className={inputClass(errors.area)}
                            />
                            <FieldError message={errors.area?.message} />
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                    <h2 className="font-extrabold text-foreground">Location</h2>
                    <div className="mt-5 grid gap-5 sm:grid-cols-3">
                        <div>
                            <label htmlFor="division" className="mb-2 block text-sm font-bold text-foreground">
                                Division *
                            </label>
                            <Select
                                id="division"
                                size="lg"
                                {...register("division", {
                                    required: "Division is required.",
                                    onChange: () => {
                                        setValue("district", "");
                                        setValue("upazila", "");
                                    },
                                })}
                                value={selectedDivision}
                                invalid={Boolean(errors.division)}
                            >
                                <option value="">Select division</option>
                                {divisions.map((item) => (
                                    <option key={item._id} value={item._id}>{item.nameEn}</option>
                                ))}
                            </Select>
                            <FieldError message={errors.division?.message} />
                        </div>
                        <div>
                            <label htmlFor="district" className="mb-2 block text-sm font-bold text-foreground">
                                District *
                            </label>
                            <Select
                                id="district"
                                size="lg"
                                {...register("district", {
                                    required: "District is required.",
                                    onChange: () => setValue("upazila", ""),
                                })}
                                value={selectedDistrict}
                                disabled={!selectedDivision}
                                invalid={Boolean(errors.district)}
                            >
                                <option value="">Select district</option>
                                {districts.map((item) => (
                                    <option key={item._id} value={item._id}>{item.nameEn}</option>
                                ))}
                            </Select>
                            <FieldError message={errors.district?.message} />
                        </div>
                        <div>
                            <label htmlFor="upazila" className="mb-2 block text-sm font-bold text-foreground">
                                Upazila
                            </label>
                            <Select
                                id="upazila"
                                size="lg"
                                {...register("upazila")}
                                value={watch("upazila")}
                                disabled={!selectedDistrict}
                            >
                                <option value="">Select upazila</option>
                                {upazilas.map((item) => (
                                    <option key={item._id} value={item._id}>{item.nameEn}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                    <h2 className="font-extrabold text-foreground">Privacy & consent</h2>
                    <div className="mt-4 space-y-3">
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4">
                            <input
                                type="checkbox"
                                {...register("isPubliclyListed", {
                                    onChange: (event) => {
                                        if (event.target.checked) {
                                            setValue("allowContactRequests", true, { shouldValidate: true });
                                        }
                                    },
                                })}
                                className="mt-0.5 size-4 accent-primary"
                            />
                            <span>
                                <span className="block text-sm font-bold text-foreground">List me publicly</span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                    Show my name, blood group and area in the donor directory.
                                </span>
                            </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4">
                            <input
                                type="checkbox"
                                {...register("allowContactRequests", {
                                    validate: (value) =>
                                        !isPubliclyListed ||
                                        value ||
                                        "Public listing requires contact-request consent.",
                                })}
                                className="mt-0.5 size-4 accent-primary"
                            />
                            <span>
                                <span className="block text-sm font-bold text-foreground">Allow contact requests</span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                    Let people send me a contact request through the platform.
                                </span>
                            </span>
                        </label>
                        <FieldError message={errors.allowContactRequests?.message} />
                    </div>
                </section>

                <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-md shadow-primary/25 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save size={17} />
                    {isSubmitting ? "Saving…" : "Save profile"}
                </button>
            </form>
        </>
    );
};

export default DonorProfile;
