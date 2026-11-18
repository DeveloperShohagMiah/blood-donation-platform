import { t } from "../../../utils/tr.js";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, Save } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import Select from "../../../components/Select";
import { ErrorBanner, PageHeader } from "../components/UI";

const inputClass = (hasError) =>
    [
        "h-11 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground outline-none transition focus:ring-4",
        hasError
            ? "border-rose-400 focus:border-rose-400 focus:ring-rose-500/10"
            : "border-border focus:border-primary focus:ring-primary/10",
    ].join(" ");

const VolunteerProfile = () => {
    const [areas, setAreas] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            availability: "unavailable",
            maxActiveAssignments: 5,
            serviceAreas: [],
        },
        mode: "onBlur",
    });

    const selectedAreas = watch("serviceAreas") || [];

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [profileData, locationData] = await Promise.all([
                    apiFetch("/volunteers/me"),
                    apiFetch("/locations"),
                ]);
                if (!active) return;
                const profile = profileData?.profile;
                setAreas((locationData?.items || []).filter((i) => i.type !== "division"));
                if (profile) {
                    reset({
                        availability: profile.availability || "unavailable",
                        maxActiveAssignments: profile.maxActiveAssignments || 5,
                        serviceAreas: (profile.serviceAreas || []).map((a) =>
                            typeof a === "string" ? a : a._id
                        ),
                    });
                }
            } catch (err) {
                if (active) setError(err.message);
            }
        })();
        return () => {
            active = false;
        };
    }, [reset]);

    const toggleArea = (id) => {
        const next = selectedAreas.includes(id)
            ? selectedAreas.filter((item) => item !== id)
            : [...selectedAreas, id];
        setValue("serviceAreas", next, { shouldValidate: true, shouldDirty: true });
    };

    const submit = async (values) => {
        setError("");
        setMessage("");
        try {
            await apiFetch("/volunteers/me", {
                method: "PUT",
                body: {
                    availability: values.availability,
                    maxActiveAssignments: Number(values.maxActiveAssignments),
                    serviceAreas: values.serviceAreas || [],
                },
            });
            setMessage("Volunteer profile saved.");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <PageHeader
                title="Volunteer profile"
                subtitle="Set your availability and the areas you can support."
            />
            <ErrorBanner message={error} />
            {message && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={17} /> {message}
                </div>
            )}

            <form onSubmit={handleSubmit(submit)} noValidate className="max-w-3xl space-y-6">
                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                    <div className="grid gap-5 sm:grid-cols-2">
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
                                <option value="available">{t("text.Available")}</option>
                                <option value="unavailable">{t("text.Unavailable")}</option>
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="max" className="mb-2 block text-sm font-bold text-foreground">
                                Max active assignments
                            </label>
                            <input
                                id="max"
                                type="number"
                                min="1"
                                max="20"
                                {...register("maxActiveAssignments", {
                                    valueAsNumber: true,
                                    min: { value: 1, message: "At least 1 assignment." },
                                    max: { value: 20, message: "At most 20 assignments." },
                                })}
                                className={inputClass(errors.maxActiveAssignments)}
                            />
                            {errors.maxActiveAssignments && (
                                <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
                                    {errors.maxActiveAssignments.message}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                    <h2 className="font-extrabold text-foreground">{t("text.Service areas")}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Select the districts and upazilas you can cover.
                    </p>
                    <div className="mt-4 grid max-h-72 gap-2 overflow-y-auto rounded-xl border border-border bg-background p-3 sm:grid-cols-2">
                        {areas.map((area) => {
                            const checked = selectedAreas.includes(area._id);
                            return (
                                <label
                                    key={area._id}
                                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                                        checked ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleArea(area._id)}
                                        className="size-4 accent-primary"
                                    />
                                    <span className="truncate">
                                        {area.nameEn}
                                        <span className="ml-1 text-[11px] opacity-70">({area.type})</span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </section>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-md shadow-primary/25 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save size={17} /> {isSubmitting ? "Saving…" : "Save profile"}
                </button>
            </form>
        </>
    );
};

export default VolunteerProfile;
