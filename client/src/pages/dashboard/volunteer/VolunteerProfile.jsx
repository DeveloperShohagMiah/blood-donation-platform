import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    Activity,
    AlertCircle,
    ArrowUpRight,
    BadgeCheck,
    CalendarDays,
    Check,
    CheckCircle2,
    ClipboardList,
    HandHeart,
    LoaderCircle,
    Mail,
    MapPin,
    Phone,
    RotateCcw,
    Save,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    X,
} from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { useAuth } from "../../../context/useAuth";
import { useApiData } from "../hooks";
import { formatDate } from "../format";
import { ErrorBanner, PageHeader, StatusBadge } from "../components/UI";

const DEFAULTS = {
    availability: "unavailable",
    maxActiveAssignments: 5,
    serviceAreas: [],
};

const CAPACITY_PRESETS = [3, 5, 10, 20];
const TYPE_LABELS = { district: "Districts", upazila: "Upazilas", union: "Unions" };
const TYPE_ORDER = ["district", "upazila", "union"];

function SectionCard({ icon: Icon, title, subtitle, action, children }) {
    return (
        <section className="premium-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-4">
                <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                        <Icon size={19} strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0">
                        <h2 className="font-display text-base font-extrabold tracking-tight text-foreground">{title}</h2>
                        {subtitle && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{subtitle}</p>}
                    </div>
                </div>
                {action}
            </div>
            <div className="mt-5">{children}</div>
        </section>
    );
}

function StatPill({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-3.5 py-2.5 ring-1 ring-white/20 backdrop-blur-md">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/15">
                <Icon size={16} />
            </span>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">{label}</p>
                <p className="text-sm font-extrabold leading-tight">{value ?? "—"}</p>
            </div>
        </div>
    );
}

const FieldError = ({ message }) =>
    message ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertCircle size={13} /> {message}
        </p>
    ) : null;

const availabilityOptions = [
    {
        value: "available",
        label: "Available for assignments",
        hint: "Volunteers can assign requests to you.",
        dot: "bg-success",
    },
    {
        value: "unavailable",
        label: "Unavailable right now",
        hint: "Pause new assignments while you are busy.",
        dot: "bg-muted-foreground",
    },
];

const ProfileSkeleton = () => (
    <div className="space-y-6">
        <div className="h-52 animate-pulse rounded-3xl bg-muted/60" />
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-6">
                <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />
                <div className="h-64 animate-pulse rounded-2xl bg-muted/60" />
            </div>
            <div className="h-[30rem] animate-pulse rounded-2xl bg-muted/60" />
        </div>
    </div>
);

const VolunteerProfile = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const locationsQuery = useApiData("/locations");
    const assignmentsQuery = useApiData("/assignments/me");

    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [savedValues, setSavedValues] = useState(DEFAULTS);
    const [areaQuery, setAreaQuery] = useState("");

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting, isDirty },
    } = useForm({ defaultValues: DEFAULTS, mode: "onBlur" });

    const availability = useWatch({ control, name: "availability" });
    const capacity = useWatch({ control, name: "maxActiveAssignments" });
    const selectedAreas = useWatch({ control, name: "serviceAreas" }) || [];

    useEffect(() => {
        let active = true;
        apiFetch("/volunteers/me")
            .then((data) => {
                if (!active) return;
                const loaded = data?.profile || null;
                setProfile(loaded);
                if (loaded) {
                    const values = {
                        availability: loaded.availability || "unavailable",
                        maxActiveAssignments: Number(loaded.maxActiveAssignments) || 5,
                        serviceAreas: (loaded.serviceAreas || [])
                            .map((area) => (typeof area === "string" ? area : area?._id))
                            .filter(Boolean)
                            .map(String),
                    };
                    reset(values);
                    setSavedValues(values);
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

    useEffect(() => {
        if (!message) return undefined;
        const timer = setTimeout(() => setMessage(""), 5000);
        return () => clearTimeout(timer);
    }, [message]);

    const allAreas = useMemo(
        () => (locationsQuery.data?.items || []).filter((area) => area.type !== "division"),
        [locationsQuery.data]
    );
    const areaMap = useMemo(
        () => new Map(allAreas.map((area) => [String(area._id), area])),
        [allAreas]
    );

    const filteredAreas = useMemo(() => {
        const term = areaQuery.trim().toLowerCase();
        if (!term) return allAreas;
        return allAreas.filter((area) =>
            [area.nameEn, area.nameBn, area.type].some((value) =>
                String(value ?? "").toLowerCase().includes(term)
            )
        );
    }, [allAreas, areaQuery]);

    const groupedAreas = useMemo(() => {
        const groups = { district: [], upazila: [], union: [] };
        filteredAreas.forEach((area) => {
            if (groups[area.type]) groups[area.type].push(area);
        });
        return groups;
    }, [filteredAreas]);

    const assignments = useMemo(() => assignmentsQuery.data?.items || [], [assignmentsQuery.data]);
    const activeCount = assignments.filter((item) => item.status === "active").length;
    const completedCount = assignments.filter((item) => item.status === "completed").length;

    const initials = String(user?.fullName || "V")
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const completeness = useMemo(() => {
        const checks = [
            Boolean(availability),
            selectedAreas.length > 0,
            Number(capacity) > 0,
            Boolean(user?.phoneVerified),
            user?.accountStatus === "approved",
        ];
        return Math.round((checks.filter(Boolean).length / checks.length) * 100);
    }, [availability, selectedAreas.length, capacity, user?.phoneVerified, user?.accountStatus]);

    const isAvailable = availability === "available";
    const atCapacity = Number(capacity) > 0 && activeCount >= Number(capacity);

    const toggleArea = (id) => {
        const value = String(id);
        const next = selectedAreas.includes(value)
            ? selectedAreas.filter((item) => item !== value)
            : [...selectedAreas, value];
        setValue("serviceAreas", next, { shouldDirty: true, shouldValidate: true });
    };

    const selectShownAreas = () => {
        const next = [...new Set([...selectedAreas, ...filteredAreas.map((area) => String(area._id))])];
        setValue("serviceAreas", next, { shouldDirty: true, shouldValidate: true });
    };

    const clearAreas = () =>
        setValue("serviceAreas", [], { shouldDirty: true, shouldValidate: true });

    const discard = () => {
        reset(savedValues);
        setAreaQuery("");
        setMessage("");
    };

    const submit = async (values) => {
        setError("");
        setMessage("");
        const normalized = {
            availability: values.availability,
            maxActiveAssignments: Number(values.maxActiveAssignments),
            serviceAreas: values.serviceAreas || [],
        };
        try {
            const result = await apiFetch("/volunteers/me", {
                method: "PUT",
                body: normalized,
            });
            const saved = {
                availability: result?.profile?.availability || normalized.availability,
                maxActiveAssignments: Number(result?.profile?.maxActiveAssignments) || normalized.maxActiveAssignments,
                serviceAreas: normalized.serviceAreas,
            };
            setSavedValues(saved);
            reset(saved);
            setMessage(t("text.Volunteer profile saved", "Your volunteer profile has been saved."));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <PageHeader
                title={t("text.Volunteer profile", "Volunteer profile")}
                subtitle={t(
                    "text.Volunteer profile subtitle",
                    "Manage your availability, workload, and the areas you can support."
                )}
            />

            {loading ? (
                <ProfileSkeleton />
            ) : (
                <>
                    <div className="relative mb-6 overflow-hidden rounded-3xl bg-linear-to-br from-brand-deep via-primary to-primary p-6 text-primary-foreground shadow-lg shadow-primary/20 sm:p-8">
                        <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full border-[22px] border-white/10" />
                        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-white/10 blur-2xl" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl font-extrabold ring-1 ring-white/25 backdrop-blur-md sm:size-20">
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="eyebrow text-[10px] text-white/70">Volunteer</p>
                                        {user?.accountStatus === "approved" && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold ring-1 ring-white/25">
                                                <BadgeCheck size={11} /> Approved
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="font-display truncate text-2xl font-extrabold tracking-tight sm:text-3xl">
                                        {user?.fullName || t("text.My profile", "My profile")}
                                    </h2>
                                    <p className="mt-1 truncate text-xs text-white/75">
                                        {user?.phone}
                                        {user?.email ? ` · ${user.email}` : ""}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:gap-2">
                                <StatPill icon={Activity} label="Active" value={activeCount} />
                                <StatPill icon={CheckCircle2} label="Completed" value={completedCount} />
                                <StatPill icon={MapPin} label="Areas" value={selectedAreas.length} />
                                <StatPill
                                    icon={CalendarDays}
                                    label="Since"
                                    value={formatDate(profile?.joinedAt || profile?.createdAt)}
                                />
                            </div>
                        </div>

                        <div className="relative mt-6 flex flex-col gap-4 border-t border-white/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <span className={`size-2.5 rounded-full ${isAvailable ? "animate-pulse bg-white" : "bg-white/50"}`} />
                                {isAvailable ? "Available for new assignments" : "Currently unavailable"}
                            </div>
                            <div className="flex w-full items-center gap-3 sm:w-64">
                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-white/70">
                                    Profile strength
                                </span>
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                                    <div
                                        className="h-full rounded-full bg-white transition-[width] duration-500"
                                        style={{ width: `${completeness}%` }}
                                    />
                                </div>
                                <span className="shrink-0 text-xs font-extrabold">{completeness}%</span>
                            </div>
                        </div>
                    </div>

                    <ErrorBanner message={error || locationsQuery.error || assignmentsQuery.error} />
                    {message && (
                        <div className="mb-5 flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm font-medium text-success-deep">
                            <Sparkles size={17} /> {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
                        <input type="hidden" {...register("availability")} />
                        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                            <div className="space-y-6">
                                <SectionCard
                                    icon={HandHeart}
                                    title={t("text.Availability", "Availability")}
                                    subtitle={t("text.Availability hint", "Let coordinators know if you can take requests.")}
                                >
                                    <div className="space-y-2">
                                        {availabilityOptions.map((option) => {
                                            const active = availability === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setValue("availability", option.value, {
                                                            shouldDirty: true,
                                                            shouldValidate: true,
                                                        })
                                                    }
                                                    aria-pressed={active}
                                                    className={[
                                                        "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                                                        active
                                                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                            : "border-border bg-background hover:border-primary/30",
                                                    ].join(" ")}
                                                >
                                                    <span className={`size-2.5 shrink-0 rounded-full ${option.dot}`} />
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-sm font-bold text-foreground">{option.label}</span>
                                                        <span className="block text-xs text-muted-foreground">{option.hint}</span>
                                                    </span>
                                                    {active && <CheckCircle2 size={16} className="shrink-0 text-primary" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </SectionCard>

                                <SectionCard
                                    icon={SlidersHorizontal}
                                    title={t("text.Workload capacity", "Workload capacity")}
                                    subtitle={t("text.Capacity hint", "The maximum number of active assignments at once.")}
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {CAPACITY_PRESETS.map((value) => {
                                            const active = Number(capacity) === value;
                                            return (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() =>
                                                        setValue("maxActiveAssignments", value, {
                                                            shouldDirty: true,
                                                            shouldValidate: true,
                                                        })
                                                    }
                                                    aria-pressed={active}
                                                    className={[
                                                        "grid size-10 place-items-center rounded-xl border text-sm font-extrabold transition",
                                                        active
                                                            ? "border-primary bg-linear-to-br from-primary to-primary-hover text-primary-foreground shadow-md shadow-primary/20"
                                                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary",
                                                    ].join(" ")}
                                                >
                                                    {value}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-5">
                                        <input
                                            id="max"
                                            type="range"
                                            min="1"
                                            max="20"
                                            step="1"
                                            {...register("maxActiveAssignments", {
                                                valueAsNumber: true,
                                                min: { value: 1, message: "At least 1 assignment." },
                                                max: { value: 20, message: "At most 20 assignments." },
                                            })}
                                            aria-label="Maximum active assignments"
                                            className="h-2 w-full cursor-pointer accent-primary"
                                        />
                                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                            <span>1</span>
                                            <span className="rounded-lg bg-muted px-2.5 py-1 font-extrabold text-foreground">
                                                {capacity || "—"} active max
                                            </span>
                                            <span>20</span>
                                        </div>
                                        <FieldError message={errors.maxActiveAssignments?.message} />
                                    </div>
                                    {atCapacity && (
                                        <p className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2.5 text-xs leading-5 text-warning">
                                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                            You are at your current limit ({activeCount} active). Raise it to receive more assignments.
                                        </p>
                                    )}
                                </SectionCard>

                                <SectionCard
                                    icon={ShieldCheck}
                                    title={t("text.Account overview", "Account overview")}
                                    subtitle={t("text.Account hint", "Details from your registered account.")}
                                >
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2.5">
                                            <span className="flex items-center gap-2 text-muted-foreground">
                                                <ShieldCheck size={15} /> Account status
                                            </span>
                                            <StatusBadge value={user?.accountStatus || "pending"} />
                                        </div>
                                        <div className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2.5">
                                            <span className="flex items-center gap-2 text-muted-foreground">
                                                <Phone size={15} /> Phone
                                            </span>
                                            <span className="flex items-center gap-1.5 font-semibold text-foreground">
                                                {user?.phoneVerified && <BadgeCheck size={14} className="text-success" />}
                                                {user?.phone || "—"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2.5">
                                            <span className="flex items-center gap-2 text-muted-foreground">
                                                <Mail size={15} /> Email
                                            </span>
                                            <span className="flex items-center gap-1.5 truncate font-semibold text-foreground">
                                                {user?.emailVerified && <BadgeCheck size={14} className="text-success" />}
                                                {user?.email || "Not added"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2.5">
                                            <span className="flex items-center gap-2 text-muted-foreground">
                                                <CalendarDays size={15} /> Volunteering since
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {formatDate(profile?.joinedAt || profile?.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <Link
                                            to="/dashboard/queue"
                                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-xs font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                                        >
                                            <ClipboardList size={14} /> Queue
                                        </Link>
                                        <Link
                                            to="/dashboard/assignments"
                                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-xs font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                                        >
                                            Assignments <ArrowUpRight size={13} />
                                        </Link>
                                    </div>
                                </SectionCard>
                            </div>

                            <SectionCard
                                icon={MapPin}
                                title={t("text.Service areas", "Service areas")}
                                subtitle={t("text.Service areas hint", "Select the districts and upazilas you can cover.")}
                                action={
                                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-extrabold text-primary ring-1 ring-primary/15">
                                        {selectedAreas.length} selected
                                    </span>
                                }
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <label className="relative block flex-1">
                                        <Search size={15} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="search"
                                            value={areaQuery}
                                            onChange={(event) => setAreaQuery(event.target.value)}
                                            placeholder="Search districts or upazilas…"
                                            aria-label="Search service areas"
                                            className="h-11 w-full rounded-xl border border-border bg-background pr-4 pl-10 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={selectShownAreas}
                                            disabled={!filteredAreas.length}
                                            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-border px-3.5 text-xs font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                                        >
                                            <Check size={14} /> Select shown
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearAreas}
                                            disabled={!selectedAreas.length}
                                            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-border px-3.5 text-xs font-bold text-muted-foreground transition hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
                                        >
                                            <X size={14} /> Clear
                                        </button>
                                    </div>
                                </div>

                                {selectedAreas.length > 0 && (
                                    <div className="mt-4">
                                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your selection</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedAreas.map((id) => (
                                                <span
                                                    key={id}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pr-1.5 pl-3 text-[11px] font-bold text-primary ring-1 ring-primary/15"
                                                >
                                                    {areaMap.get(id)?.nameEn || "Selected area"}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleArea(id)}
                                                        aria-label={`Remove ${areaMap.get(id)?.nameEn || "area"}`}
                                                        className="grid size-4 place-items-center rounded-full bg-primary/15 transition hover:bg-primary/30"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 max-h-[26rem] space-y-5 overflow-y-auto rounded-2xl border border-border/70 bg-background/50 p-3">
                                    {TYPE_ORDER.map((type) => {
                                        const group = groupedAreas[type];
                                        if (!group.length) return null;
                                        return (
                                            <div key={type}>
                                                <div className="mb-2 flex items-center gap-2 px-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        {TYPE_LABELS[type]}
                                                    </p>
                                                    <span className="rounded-full bg-muted px-1.5 text-[10px] font-bold text-muted-foreground">
                                                        {group.length}
                                                    </span>
                                                </div>
                                                <div className="grid gap-1.5 sm:grid-cols-2">
                                                    {group.map((area) => {
                                                        const id = String(area._id);
                                                        const checked = selectedAreas.includes(id);
                                                        return (
                                                            <label
                                                                key={id}
                                                                className={[
                                                                    "flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition",
                                                                    checked
                                                                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                                                                        : "text-muted-foreground hover:bg-muted",
                                                                ].join(" ")}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={() => toggleArea(id)}
                                                                    className="size-4 shrink-0 accent-primary"
                                                                />
                                                                <span className="min-w-0 flex-1 truncate font-semibold">{area.nameEn}</span>
                                                                {checked && <Check size={14} className="shrink-0" />}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {!filteredAreas.length && (
                                        <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                                            No areas match “{areaQuery}”.
                                        </p>
                                    )}
                                </div>

                                {!selectedAreas.length && (
                                    <p className="mt-3 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2.5 text-xs leading-5 text-warning">
                                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                        No service areas selected. Area-based assignments may not reach you.
                                    </p>
                                )}
                            </SectionCard>
                        </div>

                        <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/85 p-3 shadow-xl backdrop-blur-xl supports-[backdrop-filter]:bg-card/75 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                <span className={`size-2 rounded-full ${isDirty ? "bg-warning" : "bg-success"}`} />
                                {isDirty ? "You have unsaved changes" : "All changes saved"}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={discard}
                                    disabled={!isDirty || isSubmitting}
                                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <RotateCcw size={14} /> Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isDirty || isSubmitting}
                                    className="btn-premium h-10 px-5 text-sm disabled:opacity-60"
                                >
                                    {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                                    {isSubmitting ? "Saving…" : "Save profile"}
                                </button>
                            </div>
                        </div>
                    </form>
                </>
            )}
        </>
    );
};

export default VolunteerProfile;
