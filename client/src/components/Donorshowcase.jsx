import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowRight,
    CalendarDays,
    ChevronDown,
    Filter,
    MapPin,
    Phone,
    SearchX,
    Users,
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { bdLocations } from "../utils/BDLocations";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const PREVIEW_LIMIT = 8;

/* Sample data: replace with your API response (keep these field names) */
const sampleDonors = [
    { id: 1, name: "MD Sadhain", group: "O+", division: "Dhaka", district: "Dhaka", upazila: "Khilkhet", last: "Never", available: true, phone: "+8801000000001" },
    { id: 2, name: "Shahariar Sohan", group: "O+", division: "Chattogram", district: "Cox's Bazar", upazila: "Chakaria", last: "Never", available: true, phone: "+8801000000002" },
    { id: 3, name: "Anthic Kumar Singh", group: "O+", division: "Dhaka", district: "Dhaka", upazila: "Khilkhet", last: "Never", available: true, phone: "+8801000000003" },
    { id: 4, name: "Shamim Hossain", group: "B+", division: "Dhaka", district: "Dhaka", upazila: "Uttara", last: "Never", available: true, phone: "+8801000000004" },
    { id: 5, name: "Nusrat Jahan", group: "B+", division: "Chattogram", district: "Chattogram", upazila: "Kotwali", last: "4 months ago", available: true, phone: "+8801000000005" },
    { id: 6, name: "Tanvir Hasan", group: "A+", division: "Dhaka", district: "Gazipur", upazila: "Tongi", last: "8 months ago", available: false, phone: "+8801000000006" },
    { id: 7, name: "Mim Akter", group: "AB+", division: "Sylhet", district: "Sylhet", upazila: "Sylhet Sadar", last: "Never", available: true, phone: "+8801000000007" },
    { id: 8, name: "Sabbir Hossain", group: "O-", division: "Rajshahi", district: "Rajshahi", upazila: "Boalia", last: "6 months ago", available: true, phone: "+8801000000008" },
    { id: 9, name: "Farhana Islam", group: "A-", division: "Dhaka", district: "Dhaka", upazila: "Mirpur", last: "3 months ago", available: false, phone: "+8801000000009" },
    { id: 10, name: "Imran Khan", group: "B-", division: "Khulna", district: "Khulna", upazila: "Khulna Sadar", last: "7 months ago", available: true, phone: "+8801000000010" },
];

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
        <span className="mb-2 block text-xs font-bold tracking-wide text-[#66736E] uppercase">
            {label}
        </span>
        <span className="relative block">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={[
                    "h-12 w-full appearance-none rounded-xl border bg-[#F4F7F9] pr-10 pl-4 text-[15px] font-medium outline-none transition",
                    "focus:border-[#C62838] focus:bg-white focus:ring-4 focus:ring-[#C62838]/10",
                    disabled
                        ? "cursor-not-allowed border-[#EDF0F2] text-[#B5BFBA] opacity-70"
                        : "border-[#E4EBE7] text-[#192623]",
                ].join(" ")}
            >
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
            <ChevronDown
                size={18}
                className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[#84918C]"
            />
        </span>
    </label>
);

const DonorShowcase = () => {
    const { t } = useTranslation();
    const filterRef = useRef(null);

    /* Draft values (what the person is picking) vs applied (what the list uses) */
    const empty = { group: "", division: "", district: "", upazila: "" };
    const [draft, setDraft] = useState(empty);
    const [applied, setApplied] = useState(empty);

    const divisions = Object.keys(bdLocations);
    const districts = draft.division ? Object.keys(bdLocations[draft.division]) : [];
    const upazilas =
        draft.division && draft.district ? bdLocations[draft.division][draft.district] : [];

    const set = (key) => (value) =>
        setDraft((d) => {
            const next = { ...d, [key]: value };
            if (key === "division") {
                next.district = "";
                next.upazila = "";
            }
            if (key === "district") next.upazila = "";
            return next;
        });

    const filtered = useMemo(
        () =>
            sampleDonors.filter(
                (d) =>
                    (!applied.group || d.group === applied.group) &&
                    (!applied.division || d.division === applied.division) &&
                    (!applied.district || d.district === applied.district) &&
                    (!applied.upazila || d.upazila === applied.upazila)
            ),
        [applied]
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

    const focusFilters = () => {
        filterRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        filterRef.current?.querySelector("select")?.focus({ preventScroll: true });
    };

    const viewAllQuery = new URLSearchParams(
        Object.entries(applied).filter(([, v]) => v)
    ).toString();

    return (
        <section aria-labelledby="donors-heading" className=" py-16 md:py-24">

            <div className="mx-auto w-[calc(100%-2rem)] max-w-[1280px] md:w-[calc(100%-4rem)]">
                {/* Filter bar */}
                <form
                    ref={filterRef}
                    onSubmit={applyFilters}
                    aria-label={t("home.donors.filterLabel", "Filter donors")}
                    className="grid  gap-4 rounded-[28px] bg-white p-5 shadow-[0_24px_60px_rgba(11,16,32,0.14)] sm:grid-cols-2 sm:p-6 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end"
                >
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

                    <button
                        type="submit"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#E11D48] px-7 text-sm font-extrabold tracking-wide text-white uppercase shadow-[0_10px_22px_rgba(220,38,38,0.3)] outline-none transition hover:brightness-95 focus-visible:ring-4 focus-visible:ring-[#C62838]/30 active:scale-[0.98] sm:col-span-2 lg:col-span-1"
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
                        actions={
                            <>
                                <button
                                    type="button"
                                    onClick={focusFilters}
                                    className="inline-flex h-11 items-center gap-2 rounded-full border border-[#E4EBE7] bg-white px-5 text-sm font-bold text-[#192623] transition-colors hover:border-[#C62838] hover:text-[#C62838]"
                                >
                                    <Filter size={16} />
                                    {t("home.donors.filterBtn", "Filter Blood Donors")}
                                </button>
                                <Link
                                    to={viewAllQuery ? `/donors?${viewAllQuery}` : "/donors"}
                                    className="inline-flex h-11 items-center gap-2 rounded-full bg-[#DC2626] px-5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(220,38,38,0.25)] transition hover:bg-[#B91C1C]"
                                >
                                    {t("home.donors.viewAll", "View All Donors")}
                                    <ArrowRight size={16} strokeWidth={2.4} />
                                </Link>
                            </>
                        }
                    />
                </div>

                {/* Count + clear */}
                <div className="mt-6 flex items-center justify-between gap-3 text-sm text-[#66736E]">
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
                            className="font-bold text-[#C62838] underline-offset-4 hover:underline"
                        >
                            {t("home.donors.reset", "Clear filters")}
                        </button>
                    )}
                </div>

                {/* Donor cards */}
                {shown.length > 0 ? (
                    <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {shown.map((d) => (
                            <li
                                key={d.id}
                                className="group relative overflow-hidden rounded-2xl border border-[#EEF1F4] bg-white p-5 shadow-[0_6px_20px_rgba(11,16,32,0.05)] transition-shadow duration-200 hover:shadow-[0_18px_40px_rgba(11,16,32,0.1)]"
                            >
                                {/* Top accent line */}
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#F28B93] via-[#F7C0C4] to-transparent"
                                />

                                <div className="flex items-center gap-3">
                                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#F1F4F7] text-sm font-bold text-[#33443D]">
                                        {initials(d.name)}
                                    </span>
                                    <p className="min-w-0 flex-1 truncate text-[16px] font-extrabold text-[#0B1020]">
                                        {d.name}
                                    </p>
                                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#FADADD] bg-[#FDEEF0] text-sm font-extrabold text-[#DC2626]">
                                        {d.group}
                                    </span>
                                </div>

                                <p className="mt-4 flex items-center gap-2 rounded-full bg-[#F6F8FA] px-3 py-2 text-xs text-[#66736E]">
                                    <CalendarDays size={14} className="text-[#DC2626]" />
                                    {t("home.donors.last", "Last donated:")}{" "}
                                    <span className="font-bold text-[#0B1020]">{d.last}</span>
                                </p>

                                <p className="mt-3 flex items-start gap-2 text-xs font-medium text-[#475650]">
                                    <MapPin size={14} className="mt-0.5 shrink-0 text-[#DC2626]" />
                                    {d.upazila}, {d.district}, {d.division}
                                </p>

                                <div className="mt-4 flex items-center justify-between border-t border-[#EEF1F4] pt-4">
                                    <span
                                        className={[
                                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
                                            d.available
                                                ? "bg-[#E7F7EF] text-[#1E8E5A]"
                                                : "bg-[#F1F4F7] text-[#84918C]",
                                        ].join(" ")}
                                    >
                                        <span
                                            className={`size-1.5 rounded-full ${d.available ? "bg-[#2FB37A]" : "bg-[#B5BFBA]"}`}
                                        />
                                        {d.available
                                            ? t("home.donors.available", "Available")
                                            : t("home.donors.unavailable", "Unavailable")}
                                    </span>

                                    <a
                                        href={`tel:${d.phone}`}
                                        aria-label={t("home.donors.contactName", "Contact {{name}}", { name: d.name })}
                                        className="inline-flex h-10 items-center gap-2 rounded-full bg-[#DC2626] px-5 text-sm font-bold text-white shadow-[0_6px_14px_rgba(220,38,38,0.25)] transition hover:bg-[#B91C1C] active:scale-[0.97]"
                                    >
                                        <Phone size={15} />
                                        {t("home.donors.contact", "Contact")}
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="mt-5 grid place-items-center rounded-2xl border border-dashed border-[#D9E3DD] bg-white px-6 py-14 text-center">
                        <SearchX size={32} className="text-[#84918C]" />
                        <p className="mt-3 font-bold text-[#192623]">
                            {t("home.donors.emptyTitle", "No donors match these filters")}
                        </p>
                        <p className="mt-1 text-sm text-[#66736E]">
                            {t("home.donors.emptyText", "Try a wider area or a different blood group.")}
                        </p>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-4 rounded-full border border-[#E4EBE7] px-4 py-2 text-sm font-bold text-[#C62838] hover:bg-[#FDEEF0]"
                        >
                            {t("home.donors.reset", "Clear filters")}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default DonorShowcase;