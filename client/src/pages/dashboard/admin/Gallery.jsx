import { t } from "../../../utils/tr.js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, Check, Images, Pencil, Plus, Trash2, X } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { useApiData } from "../hooks";
import { formatDate } from "../format";
import {
    TablePagination,
    TableToolbar,
} from "../components/TableControls";
import { useTableControls } from "../components/useTableControls";
import {
    ActionGroup,
    EmptyState,
    ErrorBanner,
    IconButton,
    LoadingRow,
    PageHeader,
    StatCard,
    TableShell,
    Td,
    Th,
} from "../components/UI";

const searchFields = ["caption", "url"];
const filterDefinitions = [
    {
        key: "isActive",
        label: "Visibility",
        options: [
            { value: "true", label: "Active" },
            { value: "false", label: "Hidden" },
        ],
        match: (item, value) => String(Boolean(item.isActive)) === value,
    },
];

const emptyForm = { url: "", caption: "", tall: false, order: 0, isActive: true };

const inputClass = (hasError) =>
    [
        "h-11 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground outline-none transition focus:ring-4",
        hasError
            ? "border-destructive focus:border-destructive focus:ring-destructive/10"
            : "border-border focus:border-primary focus:ring-primary/10",
    ].join(" ");

const FieldError = ({ message }) =>
    message ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive">
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
    const table = useTableControls(items, {
        searchFields,
        filters: filterDefinitions,
    });

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
                    <button type="button" onClick={openCreate} className="btn-premium h-10 px-4 text-sm">
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
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm font-medium text-success-deep">
                    <Check size={17} /> {notice}
                </div>
            )}

            {!loading && !items.length ? (
                <EmptyState
                    icon={Images}
                    title="No gallery images yet"
                    text="Add image URLs to show photos in the home gallery."
                    action={
                        <button type="button" onClick={openCreate} className="btn-premium h-10 px-4 text-sm">
                            <Plus size={15} /> Add image
                        </button>
                    }
                />
            ) : (
                <>
                <TableToolbar controls={table} searchPlaceholder="Search caption or URL" />
                <TableShell footer={<TablePagination controls={table} />}>
                    <thead>
                        <tr>
                            <Th>{t("text.Image")}</Th>
                            <Th>{t("text.Caption")}</Th>
                            <Th>{t("text.Order")}</Th>
                            <Th>{t("text.Status")}</Th>
                            <Th>{t("text.Added")}</Th>
                            <Th className="text-right">{t("text.Actions")}</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={6} />
                        ) : table.rows.length === 0 ? (
                            <tr>
                                <Td colSpan={6} className="py-10 text-center text-muted-foreground">
                                    No images match your search or filters.
                                </Td>
                            </tr>
                        ) : (
                            table.rows.map((item) => (
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
                                                    ? "bg-success/10 text-success-deep ring-success/20"
                                                    : "bg-muted-foreground/10 text-muted-foreground ring-muted-foreground/20"
                                            }`}
                                        >
                                            {item.isActive ? "Active" : "Hidden"}
                                        </button>
                                    </Td>
                                    <Td>{formatDate(item.createdAt)}</Td>
                                    <Td>
                                        <ActionGroup>
                                            <IconButton
                                                icon={Pencil}
                                                label="Edit image"
                                                onClick={() => openEdit(item)}
                                            />
                                            <IconButton
                                                icon={Trash2}
                                                label="Delete image"
                                                tone="danger"
                                                onClick={() => setConfirmDelete(item)}
                                            />
                                        </ActionGroup>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </TableShell>
                </>
            )}

            {editing && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-overlay p-4 backdrop-blur-sm" onClick={closeForm}>
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
                                <label htmlFor="gallery-url" className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Image URL")}</label>
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
                                <label htmlFor="gallery-caption" className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Caption")}</label>
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
                                    <label htmlFor="gallery-order" className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Order")}</label>
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
                            <p role="alert" className="mt-4 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                                {errors.root.server.message}
                            </p>
                        )}

                        <div className="mt-6 flex gap-2">
                            <button type="submit" disabled={isSubmitting || busyId === "new"} className="btn-premium h-10 flex-1 px-4 text-sm">
                                {isSubmitting || busyId === "new" ? "Saving…" : editing === "new" ? "Add image" : "Save changes"}
                            </button>
                            <button type="button" onClick={closeForm} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">{t("text.Cancel")}</button>
                        </div>
                    </form>
                </div>
            )}

            {confirmDelete && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-overlay p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <h2 className="text-lg font-extrabold text-foreground">Delete image?</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            <strong>{confirmDelete.caption || "This image"}</strong> will be removed from the gallery.
                        </p>
                        <div className="mt-6 flex gap-2">
                            <button type="button" disabled={busyId === confirmDelete._id} onClick={remove} className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-destructive px-4 text-sm font-bold text-primary-foreground disabled:opacity-60">
                                {busyId === confirmDelete._id ? "Deleting…" : "Delete"}
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(null)} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">{t("text.Cancel")}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Gallery;
