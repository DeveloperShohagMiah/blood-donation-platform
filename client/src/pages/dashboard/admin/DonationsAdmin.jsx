import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
    AlertCircle,
    CalendarDays,
    Check,
    Pencil,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import { t } from "../../../utils/tr.js";
import { formatDate } from "../format";
import { apiFetch } from "../../../utils/api";
import Select from "../../../components/Select";
import { useApiData } from "../hooks";
import { useTableControls } from "../components/useTableControls";
import { TablePagination, TableToolbar } from "../components/TableControls";
import {
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

const searchFields = [
    "donor.user.fullName",
    "donor.bloodGroup",
    "request.patientName",
    "request.bloodGroup",
    "confirmedBy.fullName",
];
const filterDefinitions = [
    {
        key: "request.bloodGroup",
        label: "Group",
        options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((value) => ({ value, label: value })),
    },
];

const emptyForm = {
    request: "",
    donor: "",
    units: 1,
    donatedAt: new Date().toISOString().slice(0, 16),
    notes: "",
};

const inputClass = (hasError) =>
    ["input-premium h-11 px-3.5", hasError ? "is-invalid" : ""]
        .filter(Boolean)
        .join(" ");

const FieldError = ({ message }) =>
    message ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <AlertCircle size={13} /> {message}
        </p>
    ) : null;

const DonationsAdmin = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const presetRequestId = searchParams.get("request");
    const donationsQuery = useApiData("/donations");
    const requestsQuery = useApiData("/blood-requests?limit=100");
    const donorsQuery = useApiData("/donors");
    const [editing, setEditing] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState("");
    const [actionError, setActionError] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: emptyForm, mode: "onBlur" });

    const items = donationsQuery.data?.items || [];
    const requests = (requestsQuery.data?.items || []).filter((r) =>
        !["fulfilled", "cancelled", "rejected"].includes(r.status)
    );
    const donors = donorsQuery.data?.items || [];
    const selectedRequest = requests.find((r) => r._id === watch("request"));
    const eligibleDonors = selectedRequest
        ? donors.filter((d) => d.bloodGroup === selectedRequest.bloodGroup)
        : donors;
    const totalUnits = items.reduce((sum, item) => sum + (item.units || 0), 0);

    const table = useTableControls(items, {
        searchFields,
        filters: filterDefinitions,
    });

    const reloadAll = () => {
        donationsQuery.reload();
        requestsQuery.reload();
    };

    useEffect(() => {
        if (!presetRequestId || requestsQuery.loading) return;
        reset({ ...emptyForm, request: presetRequestId });
        setActionError("");
        setEditing("new");
        setSearchParams({}, { replace: true });
    }, [presetRequestId, requestsQuery.loading, reset, setSearchParams]);

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
            request: item.request?._id || "",
            donor: item.donor?._id || "",
            units: item.units || 1,
            donatedAt: item.donatedAt ? new Date(item.donatedAt).toISOString().slice(0, 16) : "",
            notes: item.notes || "",
        });
        setActionError("");
        setEditing(item);
    };

    const save = async (values) => {
        setActionError("");
        setBusy(true);
        try {
            if (editing === "new") {
                await apiFetch("/donations", {
                    method: "POST",
                    body: { ...values, units: Number(values.units) },
                });
                setNotice("Blood received recorded. Request progress updated and requester notified.");
            } else {
                await apiFetch(`/donations/${editing._id}`, {
                    method: "PATCH",
                    body: { units: Number(values.units), donatedAt: values.donatedAt, notes: values.notes },
                });
                setNotice("Donation updated. Request progress recalculated.");
            }
            closeForm();
            reloadAll();
        } catch (err) {
            setError("root.server", { type: "server", message: err.message });
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        setActionError("");
        setBusy(true);
        try {
            await apiFetch(`/donations/${confirmDelete._id}`, { method: "DELETE" });
            setNotice("Donation removed. Request progress recalculated.");
            setConfirmDelete(null);
            reloadAll();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Donations"
                subtitle="Record blood received and keep request progress up to date."
                actions={
                    <button
                        type="button"
                        onClick={openCreate}
                        className="btn-premium h-10 px-4 text-sm"
                    >
                        <Plus size={16} /> Record donation
                    </button>
                }
            />

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <StatCard label="Donation records" value={items.length} icon={CalendarDays} tone="primary" />
                <StatCard label="Units received" value={totalUnits} icon={Plus} tone="success" />
            </div>

            <ErrorBanner
                message={
                    donationsQuery.error ||
                    requestsQuery.error ||
                    donorsQuery.error ||
                    actionError
                }
            />
            {notice && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm font-medium text-success-deep">
                    <Check size={17} /> {notice}
                </div>
            )}

            {!donationsQuery.loading && items.length === 0 ? (
                <EmptyState
                    icon={CalendarDays}
                    title="No donations recorded"
                    text="Record a donation to update a request's progress and notify its requester."
                    action={
                        <button type="button" onClick={openCreate} className="btn-premium h-10 px-4 text-sm">
                            <Plus size={15} /> Record donation
                        </button>
                    }
                />
            ) : (
                <>
                    <TableToolbar controls={table} searchPlaceholder="Search donor, patient or group" />
                    <TableShell footer={<TablePagination controls={table} />}>
                        <thead>
                            <tr>
                                <Th>{t("text.Date")}</Th>
                                <Th>{t("text.Donor")}</Th>
                                <Th>{t("text.Patient")}</Th>
                                <Th>{t("text.Group")}</Th>
                                <Th>{t("text.Units")}</Th>
                                <Th>{t("text.Progress")}</Th>
                                <Th>{t("text.Confirmed by")}</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {donationsQuery.loading ? (
                                <LoadingRow cols={8} />
                            ) : table.rows.length === 0 ? (
                                <tr>
                                    <Td colSpan={8} className="py-10 text-center text-muted-foreground">
                                        No donations match your search or filter.
                                    </Td>
                                </tr>
                            ) : (
                                table.rows.map((item) => (
                                    <tr key={item._id} className="hover:bg-muted/30">
                                        <Td className="font-bold">{formatDate(item.donatedAt)}</Td>
                                        <Td>{item.donor?.user?.fullName || item.donor?.bloodGroup || "—"}</Td>
                                        <Td>{item.request?.patientName || "—"}</Td>
                                        <Td>
                                            <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-extrabold text-primary">
                                                {item.request?.bloodGroup || "—"}
                                            </span>
                                        </Td>
                                        <Td>{item.units}</Td>
                                        <Td>
                                            <span className="text-xs font-bold text-foreground">
                                                {item.request?.unitsFulfilled ?? 0}/{item.request?.units ?? "—"}
                                            </span>
                                        </Td>
                                        <Td>{item.confirmedBy?.fullName || "—"}</Td>
                                        <Td>
                                            <div className="flex justify-end gap-2">
                                                <IconButton icon={Pencil} label="Edit donation" onClick={() => openEdit(item)} />
                                                <IconButton icon={Trash2} label="Delete donation" tone="danger" onClick={() => setConfirmDelete(item)} />
                                            </div>
                                        </Td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </TableShell>
                </>
            )}

            {editing && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={closeForm}>
                    <form
                        onSubmit={handleSubmit(save)}
                        onClick={(e) => e.stopPropagation()}
                        noValidate
                        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-foreground">
                                {editing === "new" ? "Record blood received" : "Edit donation"}
                            </h2>
                            <button type="button" onClick={closeForm} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            {editing === "new" && (
                                <>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-bold text-foreground">Blood request</label>
                                        <Select size="lg" {...register("request", { required: "Select a request." })} value={watch("request")} invalid={Boolean(errors.request)}>
                                            <option value="">Select request</option>
                                            {requests.map((r) => (
                                                <option key={r._id} value={r._id}>
                                                    {r.patientName} · {r.bloodGroup} · {Math.max(0, r.units - (r.unitsFulfilled || 0))} needed
                                                </option>
                                            ))}
                                        </Select>
                                        <FieldError message={errors.request?.message} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-bold text-foreground">Donor</label>
                                        <Select size="lg" {...register("donor", { required: "Select a donor." })} value={watch("donor")} invalid={Boolean(errors.donor)}>
                                            <option value="">Select donor</option>
                                            {eligibleDonors.map((d) => (
                                                <option key={d._id} value={d._id}>
                                                    {d.user?.fullName || "Donor"} · {d.bloodGroup}
                                                </option>
                                            ))}
                                        </Select>
                                        <FieldError message={errors.donor?.message} />
                                    </div>
                                </>
                            )}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-bold text-foreground">Units received</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        {...register("units", {
                                            required: "Units are required.",
                                            valueAsNumber: true,
                                            min: { value: 1, message: "At least 1 unit." },
                                            max: { value: 10, message: "At most 10 units." },
                                        })}
                                        className={inputClass(errors.units)}
                                    />
                                    <FieldError message={errors.units?.message} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-bold text-foreground">Date received</label>
                                    <input type="datetime-local" {...register("donatedAt", { required: "Date is required." })} className={inputClass(errors.donatedAt)} />
                                    <FieldError message={errors.donatedAt?.message} />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-foreground">Notes</label>
                                <textarea rows={2} {...register("notes")} className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none focus:border-primary" placeholder="Optional details" />
                            </div>
                        </div>

                        {errors.root?.server && (
                            <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                                {errors.root.server.message}
                            </p>
                        )}

                        <div className="mt-6 flex gap-2">
                            <button type="submit" disabled={isSubmitting || busy} className="btn-premium h-10 flex-1 px-4 text-sm">
                                {isSubmitting || busy ? "Saving…" : editing === "new" ? "Record donation" : "Save changes"}
                            </button>
                            <button type="button" onClick={closeForm} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {confirmDelete && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <h2 className="text-lg font-extrabold text-foreground">Remove donation?</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            The request progress will be recalculated automatically.
                        </p>
                        <div className="mt-6 flex gap-2">
                            <button type="button" disabled={busy} onClick={remove} className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-bold text-white disabled:opacity-60">
                                {busy ? "Removing…" : "Remove"}
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(null)} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DonationsAdmin;
