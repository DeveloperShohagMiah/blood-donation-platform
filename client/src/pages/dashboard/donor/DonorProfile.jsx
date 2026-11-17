import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
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

const inputClass =
    "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted";

const DonorProfile = () => {
    const [form, setForm] = useState(emptyForm);
    const [locations, setLocations] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

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
                    setForm({
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
    }, []);

    const { divisions, districts, upazilas } = useMemo(
        () => ({
            divisions: locations.filter((i) => i.type === "division"),
            districts: locations.filter(
                (i) => i.type === "district" && String(i.parent) === form.division
            ),
            upazilas: locations.filter(
                (i) => i.type === "upazila" && String(i.parent) === form.district
            ),
        }),
        [locations, form.division, form.district]
    );

    const update = (key, value) =>
        setForm((current) => {
            const next = { ...current, [key]: value };
            if (key === "division") {
                next.district = "";
                next.upazila = "";
            }
            if (key === "district") next.upazila = "";
            if (key === "isPubliclyListed" && value) next.allowContactRequests = true;
            return next;
        });

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!form.bloodGroup || !form.division || !form.district) {
            setError("Blood group, division and district are required.");
            return;
        }
        if (form.isPubliclyListed && !form.allowContactRequests) {
            setError("Public listing requires contact-request consent.");
            return;
        }

        setSaving(true);
        try {
            await apiFetch("/donors/me", {
                method: "PUT",
                body: {
                    bloodGroup: form.bloodGroup,
                    lastDonationDate: form.lastDonationDate || null,
                    availability: form.availability,
                    division: form.division,
                    district: form.district,
                    upazila: form.upazila || undefined,
                    area: form.area,
                    isPubliclyListed: form.isPubliclyListed,
                    allowContactRequests: form.allowContactRequests,
                },
            });
            setMessage("Your donor profile has been saved.");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
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

            <form onSubmit={submit} className="max-w-3xl space-y-6">
                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                    <h2 className="font-extrabold text-foreground">Donation details</h2>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-foreground">
                                Blood group *
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {bloodGroups.map((group) => (
                                    <button
                                        key={group}
                                        type="button"
                                        onClick={() => update("bloodGroup", group)}
                                        className={`h-10 rounded-xl border text-sm font-extrabold transition ${
                                            form.bloodGroup === group
                                                ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                                                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary"
                                        }`}
                                    >
                                        {group}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="availability" className="mb-2 block text-sm font-bold text-foreground">
                                Availability
                            </label>
                            <Select
                                id="availability"
                                value={form.availability}
                                onChange={(e) => update("availability", e.target.value)}
                                size="lg"
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
                                value={form.lastDonationDate}
                                onChange={(e) => update("lastDonationDate", e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="area" className="mb-2 block text-sm font-bold text-foreground">
                                Area / neighbourhood
                            </label>
                            <input
                                id="area"
                                value={form.area}
                                onChange={(e) => update("area", e.target.value)}
                                placeholder="e.g. Tangail Sadar"
                                className={inputClass}
                            />
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
                                value={form.division}
                                onChange={(e) => update("division", e.target.value)}
                                size="lg"
                            >
                                <option value="">Select division</option>
                                {divisions.map((item) => (
                                    <option key={item._id} value={item._id}>{item.nameEn}</option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="district" className="mb-2 block text-sm font-bold text-foreground">
                                District *
                            </label>
                            <Select
                                id="district"
                                value={form.district}
                                onChange={(e) => update("district", e.target.value)}
                                disabled={!form.division}
                                size="lg"
                            >
                                <option value="">Select district</option>
                                {districts.map((item) => (
                                    <option key={item._id} value={item._id}>{item.nameEn}</option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="upazila" className="mb-2 block text-sm font-bold text-foreground">
                                Upazila
                            </label>
                            <Select
                                id="upazila"
                                value={form.upazila}
                                onChange={(e) => update("upazila", e.target.value)}
                                disabled={!form.district}
                                size="lg"
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
                                checked={form.isPubliclyListed}
                                onChange={(e) => update("isPubliclyListed", e.target.checked)}
                                className="mt-0.5 size-4 accent-primary"
                            />
                            <span>
                                <span className="block text-sm font-bold text-foreground">
                                    List me publicly
                                </span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                    Show my name, blood group and area in the donor directory.
                                </span>
                            </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4">
                            <input
                                type="checkbox"
                                checked={form.allowContactRequests}
                                onChange={(e) => update("allowContactRequests", e.target.checked)}
                                className="mt-0.5 size-4 accent-primary"
                            />
                            <span>
                                <span className="block text-sm font-bold text-foreground">
                                    Allow contact requests
                                </span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                    Let people send me a contact request through the platform.
                                </span>
                            </span>
                        </label>
                    </div>
                </section>

                <button
                    type="submit"
                    disabled={saving || loading}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-md shadow-primary/25 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save size={17} />
                    {saving ? "Saving…" : "Save profile"}
                </button>
            </form>
        </>
    );
};

export default DonorProfile;
