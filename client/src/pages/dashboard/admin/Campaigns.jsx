import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    AlertCircle,
    CalendarDays,
    Check,
    Clock,
    Eye,
    MapPin,
    Megaphone,
    Pencil,
    Plus,
    Radio,
    Trash2,
    X,
} from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { useApiData } from "../hooks";
import Select from "../../../components/Select";
import { formatDate } from "../format";
import {
    EmptyState,
    ErrorBanner,
    PageHeader,
    StatCard,
} from "../components/UI";

const emptyForm = {
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    venue: "",
    location: "",
    status: "draft",
};

const inputClass = (hasError) =>
    [
        "h-11 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground outline-none transition focus:ring-4",
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

const statusStyles = {
    published: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25",
    draft: "bg-slate-500/10 text-slate-600 ring-slate-500/20",
    cancelled: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
    completed: "bg-sky-500/10 text-sky-700 ring-sky-500/20",
};

const StatusPill = ({ status }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${statusStyles[status] || statusStyles.draft}`}>
        {status || "draft"}
    </span>
);

const Campaigns = () => {
    const { data, loading, error, reload } = useApiData("/campaigns");
    const locationsQuery = useApiData("/locations");
    const [editing, setEditing] = useState(null); // null = closed, "new" = create, object = edit
    const [viewing, setViewing] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState("");
    const [notice, setNotice] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: emptyForm,
        mode: "onBlur",
    });

    const selectedLocation = watch("location");
    const selectedStatus = watch("status");
    const startAtValue = watch("startAt");

    const items = data?.items || [];
    const locations = locationsQuery.data?.items || [];
    const published = items.filter((item) => item.status === "published").length;
    const drafts = items.filter((item) => item.status === "draft").length;

    const closeForm = () => {
        setEditing(null);
        setActionError("");
    };

    const openCreate = () => {
        reset(emptyForm);
        setActionError("");
        setEditing("new");
    };

    const openEdit = (item) => {
        reset({
            title: item.title || "",
            description: item.description || "",
            startAt: item.startAt ? new Date(item.startAt).toISOString().slice(0, 16) : "",
            endAt: item.endAt ? new Date(item.endAt).toISOString().slice(0, 16) : "",
            venue: item.venue || "",
            location: item.location?._id || item.location || "",
            status: item.status || "draft",
        });
        setActionError("");
        setEditing(item);
    };

    const save = async (values) => {
        setActionError("");
        setBusy(true);
        try {
            const body = {
                ...values,
                location: values.location || undefined,
                startAt: values.startAt ? new Date(values.startAt).toISOString() : undefined,
                endAt: values.endAt ? new Date(values.endAt).toISOString() : undefined,
            };
            if (editing === "new") {
                await apiFetch("/campaigns", { method: "POST", body });
                setNotice("Campaign created.");
            } else {
                await apiFetch(`/campaigns/${editing._id}`, { method: "PATCH", body });
                setNotice("Campaign updated.");
            }
            closeForm();
            reload();
        } catch (err) {
            setError("root.server", { type: "server", message: err.message });
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const toggleStatus = async (item) => {
        setActionError("");
        try {
            await apiFetch(`/campaigns/${item._id}`, {
                method: "PATCH",
                body: { status: item.status === "published" ? "draft" : "published" },
            });
            setNotice(item.status === "published" ? "Campaign unpublished." : "Campaign published.");
            reload();
        } catch (err) {
            setActionError(err.message);
        }
    };

    const remove = async () => {
        setActionError("");
        setBusy(true);
        try {
            await apiFetch(`/campaigns/${confirmDelete._id}`, { method: "DELETE" });
            setNotice("Campaign deleted.");
            setConfirmDelete(null);
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Campaigns"
                subtitle="Plan, publish and manage blood donation drives."
                actions={
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-4 text-sm font-bold text-white shadow-md shadow-primary/25 transition hover:brightness-105"
                    >
                        <Plus size={16} /> New campaign
                    </button>
                }
            />

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <StatCard label="Total campaigns" value={items.length} icon={Megaphone} tone="primary" />
                <StatCard label="Published" value={published} icon={Radio} tone="success" />
                <StatCard label="Drafts" value={drafts} icon={Clock} tone="warning" />
            </div>

            <ErrorBanner message={error || actionError} />
            {notice && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <Check size={17} /> {notice}
                </div>
            )}

            {!loading && !items.length ? (
                <EmptyState
                    icon={Megaphone}
                    title="No campaigns yet"
                    text="Create a campaign to promote an upcoming blood drive."
                    action={
                        <button type="button" onClick={openCreate} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white">
                            <Plus size={15} /> New campaign
                        </button>
                    }
                />
            ) : (
                <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                    {loading
                        ? [1, 2, 3].map((i) => (
                            <div key={i} className="h-80 animate-pulse rounded-3xl border border-border bg-card" />
                        ))
                        : items.map((item) => {
                            const start = new Date(item.startAt);
                            return (
                                <article
                                    key={item._id}
                                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
                                >
                                    {/* Premium header band */}
                                    <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[#7F1D1D] via-primary to-[#E11D48]">
                                        <div className="absolute -top-10 -right-8 size-40 rounded-full border-[18px] border-white/10" />
                                        <div className="absolute -bottom-16 -left-8 size-40 rounded-full border-[18px] border-white/10" />
                                        <div className="absolute top-4 left-5 flex size-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md ring-1 ring-white/20">
                                            <Megaphone size={22} />
                                        </div>
                                        <div className="absolute top-4 right-5">
                                            <StatusPill status={item.status} />
                                        </div>
                                        <div className="absolute bottom-4 left-5 flex items-center gap-2 rounded-xl bg-black/20 px-3 py-1.5 text-white backdrop-blur-md">
                                            <CalendarDays size={14} />
                                            <span className="text-xs font-bold">
                                                {Number.isNaN(start.getTime()) ? "—" : start.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="flex flex-1 flex-col p-5">
                                        <h3 className="line-clamp-1 text-lg font-extrabold tracking-tight text-foreground">
                                            {item.title}
                                        </h3>

                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            {item.venue && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPin size={13} className="text-primary" /> {item.venue}
                                                </span>
                                            )}
                                            {item.location?.nameEn && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPin size={13} className="text-primary" /> {item.location.nameEn}
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                            {item.description || "No description provided."}
                                        </p>

                                        <div className="mt-4 rounded-xl bg-muted/50 px-3.5 py-2.5 text-xs text-muted-foreground">
                                            <span className="font-semibold text-foreground">Duration:</span>{" "}
                                            {formatDate(item.startAt)} — {formatDate(item.endAt)}
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
                                            <button
                                                type="button"
                                                title="View details"
                                                onClick={() => setViewing(item)}
                                                className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                title="Edit campaign"
                                                onClick={() => openEdit(item)}
                                                className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                title="Delete campaign"
                                                onClick={() => setConfirmDelete(item)}
                                                className="grid size-9 place-items-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus(item)}
                                                className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary/10 px-3 text-xs font-bold text-primary transition hover:bg-primary/20"
                                            >
                                                <Radio size={14} />
                                                {item.status === "published" ? "Unpublish" : "Publish"}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                </div>
            )}

            {/* Create / edit modal */}
            {editing && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={closeForm}>
                    <form
                        onSubmit={handleSubmit(save)}
                        onClick={(e) => e.stopPropagation()}
                        noValidate
                        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-foreground">
                                {editing === "new" ? "New campaign" : "Edit campaign"}
                            </h2>
                            <button type="button" onClick={closeForm} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Title</span>
                                <input
                                    {...register("title", {
                                        required: "Title is required.",
                                        maxLength: { value: 150, message: "Title must be at most 150 characters." },
                                    })}
                                    className={inputClass(errors.title)}
                                    placeholder="e.g. Community Blood Drive"
                                />
                                <FieldError message={errors.title?.message} />
                            </label>

                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Description</span>
                                <textarea
                                    rows={3}
                                    {...register("description", {
                                        required: "Description is required.",
                                        maxLength: { value: 5000, message: "Description must be at most 5,000 characters." },
                                    })}
                                    className={`${inputClass(errors.description)} h-auto resize-y py-3`}
                                    placeholder="Tell donors about this drive"
                                />
                                <FieldError message={errors.description?.message} />
                            </label>

                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Starts</span>
                                <input
                                    type="datetime-local"
                                    {...register("startAt", { required: "Start date is required." })}
                                    className={inputClass(errors.startAt)}
                                />
                                <FieldError message={errors.startAt?.message} />
                            </label>

                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Ends</span>
                                <input
                                    type="datetime-local"
                                    {...register("endAt", {
                                        required: "End date is required.",
                                        validate: (value) =>
                                            !startAtValue ||
                                            !value ||
                                            new Date(value) >= new Date(startAtValue) ||
                                            "End date must be after the start date.",
                                    })}
                                    className={inputClass(errors.endAt)}
                                />
                                <FieldError message={errors.endAt?.message} />
                            </label>

                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Venue</span>
                                <input
                                    {...register("venue")}
                                    className={inputClass(errors.venue)}
                                    placeholder="e.g. Community Hall"
                                />
                                <FieldError message={errors.venue?.message} />
                            </label>

                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Location</span>
                                <Select
                                    size="lg"
                                    {...register("location")}
                                    value={selectedLocation ?? ""}
                                    invalid={Boolean(errors.location)}
                                >
                                    <option value="">No specific location</option>
                                    {locations.map((item) => (
                                        <option key={item._id} value={item._id}>{item.nameEn}</option>
                                    ))}
                                </Select>
                                <FieldError message={errors.location?.message} />
                            </label>

                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Status</span>
                                <Select
                                    size="lg"
                                    {...register("status", { required: "Status is required." })}
                                    value={selectedStatus ?? "draft"}
                                    invalid={Boolean(errors.status)}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="completed">Completed</option>
                                </Select>
                                <FieldError message={errors.status?.message} />
                            </label>
                        </div>

                        {errors.root?.server && (
                            <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                                {errors.root.server.message}
                            </p>
                        )}

                        <div className="mt-6 flex gap-2">
                            <button
                                type="submit"
                                disabled={isSubmitting || busy}
                                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:opacity-60"
                            >
                                {isSubmitting || busy
                                    ? "Saving…"
                                    : editing === "new"
                                        ? "Create campaign"
                                        : "Save changes"}
                            </button>
                            <button type="button" onClick={closeForm} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Read-only detail modal */}
            {viewing && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setViewing(null)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                        <div className="relative h-28 bg-gradient-to-br from-[#7F1D1D] via-primary to-[#E11D48]">
                            <div className="absolute -top-8 -right-6 size-32 rounded-full border-4 border-white/10" />
                            <div className="absolute bottom-3 left-5 flex items-center gap-2 text-white">
                                <Megaphone size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Campaign details</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="text-xl font-extrabold text-foreground">{viewing.title}</h2>
                                <StatusPill status={viewing.status} />
                            </div>
                            <p className="mt-3 leading-7 text-muted-foreground">{viewing.description}</p>
                            <dl className="mt-5 grid gap-3 rounded-xl bg-muted/50 p-4 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Starts</dt>
                                    <dd className="mt-1 font-semibold text-foreground">{formatDate(viewing.startAt)}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Ends</dt>
                                    <dd className="mt-1 font-semibold text-foreground">{formatDate(viewing.endAt)}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Venue</dt>
                                    <dd className="mt-1 font-semibold text-foreground">{viewing.venue || "—"}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Location</dt>
                                    <dd className="mt-1 font-semibold text-foreground">{viewing.location?.nameEn || "—"}</dd>
                                </div>
                            </dl>
                            <div className="mt-6 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setViewing(null);
                                        openEdit(viewing);
                                    }}
                                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white"
                                >
                                    <Pencil size={15} /> Edit campaign
                                </button>
                                <button type="button" onClick={() => setViewing(null)} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <h2 className="text-lg font-extrabold text-foreground">Delete campaign?</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            <strong>{confirmDelete.title}</strong> will be permanently removed.
                        </p>
                        <div className="mt-6 flex gap-2">
                            <button type="button" disabled={busy} onClick={remove} className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-bold text-white disabled:opacity-60">
                                {busy ? "Deleting…" : "Delete"}
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(null)} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Campaigns;
