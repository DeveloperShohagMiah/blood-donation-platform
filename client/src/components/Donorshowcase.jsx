import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    CalendarDays,
    Filter,
    MapPin,
    Phone,
    SearchX,
    Users,
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import Select from "./Select";
import { apiFetch } from "../utils/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const PREVIEW_LIMIT = 8;

const mapApiDonor = (item) => ({
    id: item._id,
    name: item.fullName || "Donor",
    group: item.bloodGroup,
    division: item.division?.nameEn || "",
    district: item.district?.nameEn || "",
    upazila: item.upazila?.nameEn || item.area || "",
    union: item.union?.nameEn || "",
    last: item.lastDonationDate
        ? new Date(item.lastDonationDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "Never",
    available: item.availability === "available",
    phone: "",
});

const initials = (name) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

/* A labelled, styled select */
const Field = ({ label, value, onChange, placeholder, options, disabled }) => (
    <label className="block min-w-0">
        <span className="mb-2 block text-xs font-bold tracking-wide text-muted-foreground uppercase">
            {label}
        </span>
        <Select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            size="lg"
        >
            <option value="">{placeholder}</option>
            {options.map((o) => (
                <option key={o} value={o}>
                    {o}
                </option>
            ))}
        </Select>
    </label>
);

const DonorShowcase = () => {
    const { t } = useTranslation();
    const filterRef = useRef(null);

    /* Draft values (what the person is picking) vs applied (what the list uses) */
    const empty = { group: "", division: "", district: "", upazila: "", union: "" };
    const [draft, setDraft] = useState(empty);
    const [applied, setApplied] = useState(empty);
    const [donors, setDonors] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        Promise.all([
            apiFetch("/donors/search?limit=8"),
            apiFetch("/locations"),
        ])
            .then(([donorData, locationData]) => {
                if (!active) return;
                setDonors((donorData?.items || []).map(mapApiDonor));
                setLocations(locationData?.items || []);
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
    }, []);

    /* Build cascading filter options from the same locations the API uses. */
    const nameById = useMemo(
        () => Object.fromEntries(locations.map((item) => [item._id, item.nameEn])),
        [locations]
    );
    const divisions = locations
        .filter((item) => item.type === "division")
        .map((item) => item.nameEn);
    const districts = draft.division
        ? locations
            .filter((item) => item.type === "district" && nameById[item.parent] === draft.division)
            .map((item) => item.nameEn)
        : [];
    const upazilas = draft.district
        ? locations
            .filter((item) => item.type === "upazila" && nameById[item.parent] === draft.district)
            .map((item) => item.nameEn)
        : [];
    const unions = draft.upazila
        ? locations
            .filter((item) => item.type === "union" && nameById[item.parent] === draft.upazila)
            .map((item) => item.nameEn)
        : [];

    const set = (key) => (value) =>
        setDraft((d) => {
            const next = { ...d, [key]: value };
            if (key === "division") {
                next.district = "";
                next.upazila = "";
                next.union = "";
            }
            if (key === "district") {
                next.upazila = "";
                next.union = "";
            }
            if (key === "upazila") next.union = "";
            return next;
        });

    const filtered = useMemo(
        () =>
            donors.filter(
                (d) =>
                    (!applied.group || d.group === applied.group) &&
                    (!applied.division || d.division === applied.division) &&
                    (!applied.district || d.district === applied.district) &&
                    (!applied.upazila || d.upazila === applied.upazila) &&
                    (!applied.union || d.union === applied.union)
            ),
        [applied, donors]
    );
    const shown = filtered.slice(0, PREVIEW_LIMIT);
    const hasFilters = Object.values(applied).some(Boolean);

    const applyFilters = (e) => {
        e.preventDefault();
        setApplied(draft);
    };

    const clearFilters = () => {
        setDraft(empty);
        setApplied(empty);
    };

    return (
        <section aria-labelledby="donors-heading" className="relative py-16 md:py-24 border-t border-primary/10">

            <div className="mx-auto w-[calc(100%-2rem)] max-w-[1280px] md:w-[calc(100%-4rem)]">
                {/* Filter bar */}
                <form
                    ref={filterRef}
                    onSubmit={applyFilters}
                    aria-label={t("home.donors.filterLabel", "Filter donors")}
                    className="relative z-20 mx-auto md:-mt-40 grid w-full gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-lg sm:grid-cols-2 sm:p-6 lg:grid-cols-6 lg:items-end">
                    <Field
                        label={t("home.donors.group", "Blood group")}
                        placeholder={t("home.donors.selectGroup", "Select Blood Group")}
                        value={draft.group}
                        onChange={set("group")}
                        options={bloodGroups}
                    />
                    <Field
                        label={t("home.donors.division", "Division")}
                        placeholder={t("home.donors.selectDivision", "Select Division")}
                        value={draft.division}
                        onChange={set("division")}
                        options={divisions}
                    />
                    <Field
                        label={t("home.donors.district", "District")}
                        placeholder={t("home.donors.selectDistrict", "Select District")}
                        value={draft.district}
                        onChange={set("district")}
                        options={districts}
                        disabled={!draft.division}
                    />
                    <Field
                        label={t("home.donors.upazila", "Area / Upazila")}
                        placeholder={t("home.donors.selectArea", "Select Area")}
                        value={draft.upazila}
                        onChange={set("upazila")}
                        options={upazilas}
                        disabled={!draft.district}
                    />
                    <Field
                        label={t("home.donors.union", "Union")}
                        placeholder={t("home.donors.selectUnion", "Select Union")}
                        value={draft.union}
                        onChange={set("union")}
                        options={unions}
                        disabled={!draft.upazila}
                    />

                    <button
                        type="submit"
                        className="inline-flex btn-premium h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold tracking-wide text-primary-foreground capitalize shadow-md outline-none transition hover:brightness-95 focus-visible:ring-4 focus-visible:ring-primary/30 active:scale-[0.98] sm:col-span-2 lg:col-span-1"
                    >
                        <Filter size={17} strokeWidth={2.4} />
                        {t("home.donors.filter", "Filter donors")}
                    </button>
                </form>

                {/* Section header */}
                <div className="mt-14">
                    <SectionHeader
                        id="donors-heading"
                        badge={{ icon: Users, label: t("home.donors.badge", "Donor network") }}
                        title={t("home.donors.title", "Voluntary Blood Donors Showcase")}
                        subtitle={t(
                            "home.donors.subtitle",
                            "Connecting voluntary blood donors from across the country. Find compatible blood groups and location matches instantly."
                        )}
                    />
                </div>

                {/* Count + clear */}
                <div className="mt-6 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                    <p aria-live="polite">
                        {t("home.donors.showing", "Showing {{shown}} of {{total}} donors", {
                            shown: shown.length,
                            total: filtered.length,
                        })}
                    </p>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="font-bold text-primary underline-offset-4 hover:underline"
                        >
                            {t("home.donors.reset", "Clear filters")}
                        </button>
                    )}
                </div>

                {error && (
                    <p className="mt-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                        Donors could not be loaded right now ({error}).
                    </p>
                )}

                {/* Donor cards */}
                {loading ? (
                    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="h-52 animate-pulse rounded-lg border border-border bg-card" />
                        ))}
                    </div>
                ) : shown.length > 0 ? (
                    <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {shown.map((d) => (
                            <li
                                key={d.id}
                                className="group relative border border-primary/10 bg-linear-to-b from-primary/3 to-card rounded-lg p-5 shadow-xs hover:shadow-md transition-shadow"
                            >
                                {/* Top accent line */}
                                {/* <span
                                    aria-hidden="true"
                                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
                                /> */}

                                <div className="flex items-center gap-3">
                                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted/40 text-sm font-bold text-foreground">
                                        {initials(d.name)}
                                    </span>
                                    <p className="min-w-0 flex-1 truncate text-[16px] font-extrabold text-foreground">
                                        {d.name}
                                    </p>
                                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/5 text-sm font-extrabold text-primary">
                                        {d.group}
                                    </span>
                                </div>

                                <p className="mt-4 flex items-center gap-2 rounded-full bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                    <CalendarDays size={14} className="text-primary" />
                                    {t("home.donors.last", "Last donated:")}{" "}
                                    <span className="font-bold text-foreground">{d.last}</span>
                                </p>

                                <p className="mt-3 flex items-start gap-2 text-xs font-medium text-muted-foreground">
                                    <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                                    {d.union && <>{d.union}, </>}{d.upazila}, {d.district}, {d.division}
                                </p>

                                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                                    <span
                                        className={[
                                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
                                            d.available
                                                ? "bg-success-soft text-success"
                                                : "bg-muted/40 text-muted-foreground",
                                        ].join(" ")}
                                    >
                                        <span
                                            className={`size-1.5 rounded-full ${d.available ? "bg-success" : "bg-muted-foreground"}`}
                                        />
                                        {d.available
                                            ? t("home.donors.available", "Available")
                                            : t("home.donors.unavailable", "Unavailable")}
                                    </span>

                                    {d.phone ? (
                                        <a
                                            href={`tel:${d.phone}`}
                                            aria-label={t("home.donors.contactName", "Contact {{name}}", { name: d.name })}
                                            className="inline-flex btn-premium h-10 items-center gap-2 rounded-full px-5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary-hover active:scale-[0.97]"
                                        >
                                            <Phone size={15} />
                                            {t("home.donors.contact", "Contact")}
                                        </a>
                                    ) : (
                                        <Link
                                            to={`/donors?group=${encodeURIComponent(d.group)}`}
                                            className="inline-flex h-10 items-center gap-2 rounded-full btn-premium px-5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary-hover active:scale-[0.97]"
                                        >
                                            <Phone size={15} />
                                            {t("home.donors.contact", "Contact")}
                                        </Link>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="mt-5 grid place-items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
                        <SearchX size={32} className="text-muted-foreground" />
                        <p className="mt-3 font-bold text-foreground">
                            {hasFilters
                                ? t("home.donors.emptyTitle", "No donors match these filters")
                                : t("home.donors.noneTitle", "No donors listed yet")}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {hasFilters
                                ? t("home.donors.emptyText", "Try a wider area or a different blood group.")
                                : t("home.donors.noneText", "Once donors opt in to be listed publicly, they will appear here.")}
                        </p>
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-4 rounded-full border border-border px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5"
                            >
                                {t("home.donors.reset", "Clear filters")}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default DonorShowcase;