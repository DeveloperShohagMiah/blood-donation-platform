import { useState } from "react";
import { Check, Pencil, Trash2, UserPlus, X } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { useApiData } from "../hooks";
import Select from "../../../components/Select";
import { formatDate } from "../format";
import {
    EmptyState,
    ErrorBanner,
    LoadingRow,
    PageHeader,
    StatusBadge,
    TableShell,
    Td,
    Th,
} from "../components/UI";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const statuses = [
    "submitted",
    "pending_verification",
    "verified",
    "matching",
    "in_progress",
    "fulfilled",
    "rejected",
    "cancelled",
    "expired",
];

const inputClass =
    "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

const emptyForm = {
    patientName: "",
    bloodGroup: "",
    urgency: "normal",
    units: 1,
    hospitalName: "",
    hospitalAddress: "",
    division: "",
    district: "",
    upazila: "",
    neededAt: "",
    contactName: "",
    contactPhone: "",
    details: "",
    status: "submitted",
};

const RequestsManagement = () => {
    const { data, loading, error, reload } = useApiData("/blood-requests?limit=100");
    const volunteersQuery = useApiData("/users?role=volunteer&limit=100");
    const locationsQuery = useApiData("/locations");
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");
    const [notice, setNotice] = useState("");
    const [filter, setFilter] = useState("");
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const items = (data?.items || []).filter((item) =>
        !filter ||
        item.patientName.toLowerCase().includes(filter.toLowerCase()) ||
        item.status.includes(filter.toLowerCase())
    );
    const volunteers = (volunteersQuery.data?.items || []).filter(
        (user) => user.accountStatus === "approved"
    );
    const locations = locationsQuery.data?.items || [];

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            patientName: item.patientName || "",
            bloodGroup: item.bloodGroup || "",
            urgency: item.urgency || "normal",
            units: item.units || 1,
            hospitalName: item.hospitalName || "",
            hospitalAddress: item.hospitalAddress || "",
            division: item.division?._id || item.division || "",
            district: item.district?._id || item.district || "",
            upazila: item.upazila?._id || item.upazila || "",
            neededAt: item.neededAt ? String(item.neededAt).slice(0, 10) : "",
            contactName: item.contactName || "",
            contactPhone: item.contactPhone || "",
            details: item.details || "",
            status: item.status || "submitted",
        });
        setActionError("");
    };

    const update = (key, value) =>
        setForm((current) => {
            const next = { ...current, [key]: value };
            if (key === "division") {
                next.district = "";
                next.upazila = "";
            }
            if (key === "district") next.upazila = "";
            return next;
        });

    const saveEdit = async (event) => {
        event.preventDefault();
        setActionError("");
        setBusyId(editing._id);
        try {
            await apiFetch(`/blood-requests/${editing._id}`, {
                method: "PATCH",
                body: {
                    ...form,
                    units: Number(form.units),
                    upazila: form.upazila || undefined,
                    neededAt: form.neededAt
                        ? new Date(form.neededAt).toISOString()
                        : undefined,
                },
            });
            setNotice("Request updated.");
            setEditing(null);
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
            await apiFetch(`/blood-requests/${confirmDelete._id}`, { method: "DELETE" });
            setNotice("Request deleted.");
            setConfirmDelete(null);
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    const assign = async (requestId, volunteerUserId) => {
        if (!volunteerUserId) return;
        setActionError("");
        setBusyId(requestId);
        try {
            await apiFetch(`/blood-requests/${requestId}/assignments`, {
                method: "POST",
                body: { volunteerUserId },
            });
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    const autoAssign = async (requestId) => {
        setActionError("");
        setBusyId(requestId);
        try {
            await apiFetch(`/blood-requests/${requestId}/assignments`, {
                method: "POST",
                body: { mode: "automatic" },
            });
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    const divisions = locations.filter((item) => item.type === "division");
    const districts = locations.filter(
        (item) => item.type === "district" && String(item.parent) === form.division
    );
    const upazilas = locations.filter(
        (item) => item.type === "upazila" && String(item.parent) === form.district
    );

    return (
        <>
            <PageHeader
                title="All blood requests"
                subtitle="Review, edit, assign and delete submitted requests."
                actions={
                    <input
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Search patient or status"
                        className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary sm:w-64"
                    />
                }
            />
            <ErrorBanner message={error || actionError} />
            {notice && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <Check size={17} /> {notice}
                </div>
            )}

            {!volunteersQuery.loading && !volunteers.length && (
                <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    No approved volunteers yet. Set a user's role to <strong>volunteer</strong> and
                    approve them in <strong>Users &amp; approvals</strong> before assigning.
                </div>
            )}

            {!loading && !items.length ? (
                <EmptyState title="No requests found" text="Submitted requests will appear here." />
            ) : (
                <TableShell>
                    <thead>
                        <tr>
                            <Th>Patient</Th>
                            <Th>Group</Th>
                            <Th>Urgency</Th>
                            <Th>Hospital</Th>
                            <Th>Status</Th>
                            <Th>Date</Th>
                            <Th className="text-right">Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={7} />
                        ) : (
                            items.map((item) => (
                                <tr key={item._id} className="hover:bg-muted/30">
                                    <Td className="font-bold">{item.patientName}</Td>
                                    <Td>
                                        <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-extrabold text-primary">
                                            {item.bloodGroup}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className={`text-xs font-bold capitalize ${
                                            item.urgency === "critical"
                                                ? "text-rose-600"
                                                : item.urgency === "urgent"
                                                    ? "text-amber-600"
                                                    : "text-emerald-600"
                                        }`}>
                                            {item.urgency || "normal"}
                                        </span>
                                    </Td>
                                    <Td>{item.hospitalName}</Td>
                                    <Td><StatusBadge value={item.status} /></Td>
                                    <Td>{formatDate(item.createdAt)}</Td>
                                    <Td>
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <button
                                                type="button"
                                                title="Edit request"
                                                onClick={() => openEdit(item)}
                                                className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <Select
                                                size="sm"
                                                defaultValue=""
                                                disabled={busyId === item._id}
                                                onChange={(e) => assign(item._id, e.target.value)}
                                                className="w-32"
                                            >
                                                <option value="">Assign…</option>
                                                {volunteers.map((volunteer) => (
                                                    <option key={volunteer._id} value={volunteer._id}>
                                                        {volunteer.fullName}
                                                    </option>
                                                ))}
                                            </Select>
                                            <button
                                                type="button"
                                                title="Auto-assign the least busy volunteer"
                                                disabled={busyId === item._id}
                                                onClick={() => autoAssign(item._id)}
                                                className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-60"
                                            >
                                                <UserPlus size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                title="Delete request"
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
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
                    <form
                        onSubmit={saveEdit}
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-foreground">Edit request</h2>
                            <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Patient name</span>
                                <input required value={form.patientName} onChange={(e) => update("patientName", e.target.value)} className={inputClass} />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Blood group</span>
                                <Select value={form.bloodGroup} onChange={(e) => update("bloodGroup", e.target.value)} size="lg">
                                    {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                                </Select>
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Urgency</span>
                                <Select value={form.urgency} onChange={(e) => update("urgency", e.target.value)} size="lg">
                                    <option value="normal">Normal</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="critical">Critical</option>
                                </Select>
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Units</span>
                                <input type="number" min="1" max="10" value={form.units} onChange={(e) => update("units", e.target.value)} className={inputClass} />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Needed by</span>
                                <input type="date" value={form.neededAt} onChange={(e) => update("neededAt", e.target.value)} className={inputClass} />
                            </label>
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Hospital</span>
                                <input required value={form.hospitalName} onChange={(e) => update("hospitalName", e.target.value)} className={inputClass} />
                            </label>
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Hospital address</span>
                                <input value={form.hospitalAddress} onChange={(e) => update("hospitalAddress", e.target.value)} className={inputClass} />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Division</span>
                                <Select value={form.division} onChange={(e) => update("division", e.target.value)} size="lg">
                                    <option value="">Select division</option>
                                    {divisions.map((item) => <option key={item._id} value={item._id}>{item.nameEn}</option>)}
                                </Select>
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">District</span>
                                <Select value={form.district} onChange={(e) => update("district", e.target.value)} disabled={!form.division} size="lg">
                                    <option value="">Select district</option>
                                    {districts.map((item) => <option key={item._id} value={item._id}>{item.nameEn}</option>)}
                                </Select>
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Upazila</span>
                                <Select value={form.upazila} onChange={(e) => update("upazila", e.target.value)} disabled={!form.district} size="lg">
                                    <option value="">Select upazila</option>
                                    {upazilas.map((item) => <option key={item._id} value={item._id}>{item.nameEn}</option>)}
                                </Select>
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Status</span>
                                <Select value={form.status} onChange={(e) => update("status", e.target.value)} size="lg">
                                    {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                                </Select>
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Contact name</span>
                                <input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} className={inputClass} />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Contact phone</span>
                                <input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} className={inputClass} />
                            </label>
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-sm font-bold text-foreground">Details</span>
                                <textarea rows={2} value={form.details} onChange={(e) => update("details", e.target.value)} className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none focus:border-primary" />
                            </label>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <button type="submit" disabled={busyId === editing._id} className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:opacity-60">
                                {busyId === editing._id ? "Saving…" : "Save changes"}
                            </button>
                            <button type="button" onClick={() => setEditing(null)} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {confirmDelete && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <h2 className="text-lg font-extrabold text-foreground">Delete request?</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            This will permanently delete <strong>{confirmDelete.patientName}</strong>'s request and its assignments.
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

export default RequestsManagement;
