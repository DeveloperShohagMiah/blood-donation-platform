import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, Check, Images, Pencil, Plus, Trash2, X } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { useApiData } from "../hooks";
import { formatDate } from "../format";
import {
    EmptyState,
    ErrorBanner,
    LoadingRow,
    PageHeader,
    StatCard,
    TableShell,
    Td,
    Th,
} from "../components/UI";

const emptyForm = { url: "", caption: "", tall: false, order: 0, isActive: true };

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

const Gallery = () => {
    const { data, loading, error, reload } = useApiData("/gallery");
    const [editing, setEditing] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");
    const [notice, setNotice] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: emptyForm, mode: "onBlur" });

    const items = data?.items || [];
    const activeCount = items.filter((item) => item.isActive).length;

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
            url: item.url || "",
            caption: item.caption || "",
            tall: Boolean(item.tall),
            order: item.order || 0,
            isActive: Boolean(item.isActive),
        });
        setActionError("");
        setEditing(item);
    };

    const save = async (values) => {
        setActionError("");
        setBusyId(editing === "new" ? "new" : editing._id);
        try {
            const body = {
                ...values,
                order: Number(values.order) || 0,
            };
            if (editing === "new") {
                await apiFetch("/gallery", { method: "POST", body });
                setNotice("Gallery image added.");
            } else {
                await apiFetch(`/gallery/${editing._id}`, { method: "PATCH", body });
                setNotice("Gallery image updated.");
            }
            closeForm();
            reload();
        } catch (err) {
            setError("root.server", { type: "server", message: err.message });
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    const toggleActive = async (item) => {
        setActionError("");
        setBusyId(item._id);
        try {
            await apiFetch(`/gallery/${item._id}`, {
                method: "PATCH",
                body: { isActive: !item.isActive },
            });
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    const remove = async () => {
        setActionError("");
        setBusyId(confirmDelete._id);
        try {
            await apiFetch(`/gallery/${confirmDelete._id}`, { method: "DELETE" });
            setNotice("Gallery image deleted.");
            setConfirmDelete(null);
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    return (
        <>
            <PageHeader
                title="Gallery"
                subtitle="Manage the photos shown on the home page."
                actions={
                    <button type="button" onClick={openCreate} className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-4 text-sm font-bold text-white shadow-md shadow-primary/25 transition hover:brightness-105">
                        <Plus size={16} /> Add image
                    </button>
                }
            />

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <StatCard label="Total images" value={items.length} icon={Images} tone="primary" />
                <StatCard label="Active on home" value={activeCount} icon={Check} tone="success" />
            </div>

            <ErrorBanner message={error || actionError} />
            {notice && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <Check size={17} /> {notice}
                </div>
            )}

            {!loading && !items.length ? (
                <EmptyState
                    icon={Images}
                    title="No gallery images yet"
                    text="Add image URLs to show photos in the home gallery."
                    action={
                        <button type="button" onClick={openCreate} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white">
                            <Plus size={15} /> Add image
                        </button>
                    }
                />
            ) : (
                <TableShell>
                    <thead>
                        <tr>
                            <Th>Image</Th>
                            <Th>Caption</Th>
                            <Th>Order</Th>
                            <Th>Status</Th>
                            <Th>Added</Th>
                            <Th className="text-right">Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={6} />
                        ) : (
                            items.map((item) => (
                                <tr key={item._id} className="hover:bg-muted/30">
                                    <Td>
                                        <img
                                            src={item.url}
                                            alt={item.caption || "Gallery image"}
                                            className="size-14 rounded-lg border border-border object-cover"
                                            onError={(e) => { e.currentTarget.style.opacity = "0.3"; }}
                                        />
                                    </Td>
                                    <Td>
                                        <p className="font-bold">{item.caption || "—"}</p>
                                        <p className="max-w-xs truncate text-xs text-muted-foreground">{item.url}</p>
                                    </Td>
                                    <Td>{item.order}</Td>
                                    <Td>
                                        <button
                                            type="button"
                                            disabled={busyId === item._id}
                                            onClick={() => toggleActive(item)}
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 disabled:opacity-60 ${
                                                item.isActive
                                                    ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20"
                                                    : "bg-slate-500/10 text-slate-600 ring-slate-500/20"
                                            }`}
                                        >
                                            {item.isActive ? "Active" : "Hidden"}
                                        </button>
                                    </Td>
                                    <Td>{formatDate(item.createdAt)}</Td>
                                    <Td>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                title="Edit image"
                                                onClick={() => openEdit(item)}
                                                className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                title="Delete image"
                                                onClick={() => setConfirmDelete(item)}
                                                className="grid size-8 place-items-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </TableShell>
            )}

            {editing && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={closeForm}>
                    <form
                        onSubmit={handleSubmit(save)}
                        onClick={(e) => e.stopPropagation()}
                        noValidate
                        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-foreground">
                                {editing === "new" ? "Add gallery image" : "Edit gallery image"}
                            </h2>
                            <button type="button" onClick={closeForm} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label htmlFor="gallery-url" className="mb-1.5 block text-sm font-bold text-foreground">Image URL</label>
                                <input
                                    id="gallery-url"
                                    {...register("url", {
                                        required: "Image URL is required.",
                                        pattern: {
                                            value: /^https?:\/\/.+/i,
                                            message: "Enter a valid http(s) image URL.",
                                        },
                                    })}
                                    className={inputClass(errors.url)}
                                    placeholder="https://images.example.com/photo.jpg"
                                />
                                <FieldError message={errors.url?.message} />
                            </div>
                            <div>
                                <label htmlFor="gallery-caption" className="mb-1.5 block text-sm font-bold text-foreground">Caption</label>
                                <input
                                    id="gallery-caption"
                                    {...register("caption", {
                                        maxLength: { value: 150, message: "Caption must be at most 150 characters." },
                                    })}
                                    className={inputClass(errors.caption)}
                                    placeholder="e.g. Community blood drive, Dhaka"
                                />
                                <FieldError message={errors.caption?.message} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="gallery-order" className="mb-1.5 block text-sm font-bold text-foreground">Order</label>
                                    <input
                                        id="gallery-order"
                                        type="number"
                                        {...register("order", { valueAsNumber: true })}
                                        className={inputClass(errors.order)}
                                    />
                                </div>
                                <div className="flex items-end gap-5 pb-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <input type="checkbox" {...register("tall")} className="size-4 accent-primary" /> Tall card
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <input type="checkbox" {...register("isActive")} className="size-4 accent-primary" /> Active
                                    </label>
                                </div>
                            </div>
                        </div>

                        {errors.root?.server && (
                            <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                                {errors.root.server.message}
                            </p>
                        )}

                        <div className="mt-6 flex gap-2">
                            <button type="submit" disabled={isSubmitting || busyId === "new"} className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:opacity-60">
                                {isSubmitting || busyId === "new" ? "Saving…" : editing === "new" ? "Add image" : "Save changes"}
                            </button>
                            <button type="button" onClick={closeForm} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {confirmDelete && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <h2 className="text-lg font-extrabold text-foreground">Delete image?</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            <strong>{confirmDelete.caption || "This image"}</strong> will be removed from the gallery.
                        </p>
                        <div className="mt-6 flex gap-2">
                            <button type="button" disabled={busyId === confirmDelete._id} onClick={remove} className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-bold text-white disabled:opacity-60">
                                {busyId === confirmDelete._id ? "Deleting…" : "Delete"}
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(null)} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Gallery;
