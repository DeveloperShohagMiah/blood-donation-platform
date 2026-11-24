import { t } from "../../../utils/tr.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AlertCircle, Check, Pencil, Plus, Trash2, UserPlus, Users, X } from "lucide-react";
import Button from "../../../ui/Button";
import { apiFetch } from "../../../utils/api";
import { useApiData } from "../hooks";
import Select from "../../../components/Select";
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

const searchFields = ["patientName", "hospitalName", "status", "bloodGroup", "contactName"];
const filterDefinitions = [
    {
        key: "status",
        label: "Status",
        options: statuses.map((value) => ({ value, label: value.replaceAll("_", " ") })),
    },
    {
        key: "urgency",
        label: "Urgency",
        options: ["normal", "urgent", "critical"].map((value) => ({ value, label: value })),
    },
    { key: "bloodGroup", label: "Group", options: bloodGroups.map((value) => ({ value, label: value })) },
];

const inputClass = (hasError) =>
    ["input-premium h-11 px-3.5", hasError ? "is-invalid" : ""]
        .filter(Boolean)
        .join(" ");

const FieldError = ({ message }) =>
    message ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertCircle size={13} /> {message}
        </p>
    ) : null;

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
    union: "",
    neededAt: "",
    contactName: "",
    contactPhone: "",
    details: "",
    status: "submitted",
};

const RequestsManagement = () => {
    const navigate = useNavigate();
    const { data, loading, error, reload } = useApiData("/blood-requests?limit=100");
    const volunteersQuery = useApiData("/users?role=volunteer&limit=100");
    const assignmentsQuery = useApiData("/assignments");
    const locationsQuery = useApiData("/locations");
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");
    const [notice, setNotice] = useState("");
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [responsesRequest, setResponsesRequest] = useState(null);
    const [responses, setResponses] = useState([]);
    const [responsesLoading, setResponsesLoading] = useState(false);
    const [responsesError, setResponsesError] = useState("");
    const [busyResponseId, setBusyResponseId] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: emptyForm, mode: "onBlur" });

    const divisionValue = watch("division");
    const districtValue = watch("district");
    const upazilaValue = watch("upazila");

    const items = data?.items || [];
    const table = useTableControls(items, {
        searchFields,
        filters: filterDefinitions,
    });
    const volunteers = (volunteersQuery.data?.items || []).filter(
        (user) => user.accountStatus === "approved"
    );
    const locations = locationsQuery.data?.items || [];

    const assignedVolunteerByRequest = {};
    (assignmentsQuery.data?.items || []).forEach((assignment) => {
        const requestId =
            typeof assignment.request === "string"
                ? assignment.request
                : assignment.request?._id;
        if (requestId && assignment.volunteer?._id) {
            assignedVolunteerByRequest[requestId] = assignment.volunteer._id;
        }
    });

    const closeForm = () => {
        setEditing(null);
        setCreating(false);
        setActionError("");
    };

    const today = () => new Date().toISOString().slice(0, 10);

    const openCreate = () => {
        reset({ ...emptyForm, neededAt: today() });
        setActionError("");
        setCreating(true);
    };

    const saveCreate = async (values) => {
        setActionError("");
        try {
            await apiFetch("/blood-requests", {
                method: "POST",
                body: {
                    ...values,
                    units: Number(values.units),
                    upazila: values.upazila || undefined,
                    union: values.union || undefined,
                    neededAt: values.neededAt
                        ? new Date(values.neededAt).toISOString()
                        : undefined,
                },
            });
            setNotice("Blood request created.");
            closeForm();
            reload();
        } catch (err) {
            setError("root.server", { type: "server", message: err.message });
            setActionError(err.message);
        }
    };

    const openResponses = async (item) => {
        setResponsesRequest(item);
        setResponses([]);
        setResponsesError("");
        setResponsesLoading(true);
        try {
            const result = await apiFetch(`/blood-requests/${item._id}/responses`);
            setResponses(result?.items || []);
        } catch (err) {
            setResponsesError(err.message);
        } finally {
            setResponsesLoading(false);
        }
    };

    const reviewResponse = async (responseId, decision) => {
        if (!responsesRequest) return;
        setResponsesError("");
        setBusyResponseId(responseId);
        try {
            await apiFetch(
                `/blood-requests/${responsesRequest._id}/responses/${responseId}`,
                { method: "PATCH", body: { decision } }
            );
            setResponses((current) =>
                current.map((item) =>
                    item._id === responseId
                        ? { ...item, response: decision === "accept" ? "accepted" : "declined" }
                        : item
                )
            );
            setNotice(decision === "accept" ? "Donor selected — they've been notified." : "Offer declined — donor notified.");
        } catch (err) {
            setResponsesError(err.message);
        } finally {
            setBusyResponseId("");
        }
    };

    const openEdit = (item) => {
        reset({
            patientName: item.patientName || "",
            bloodGroup: item.bloodGroup || "",
            urgency: item.urgency || "normal",
            units: item.units || 1,
            hospitalName: item.hospitalName || "",
            hospitalAddress: item.hospitalAddress || "",
            division: item.division?._id || item.division || "",
            district: item.district?._id || item.district || "",
            upazila: item.upazila?._id || item.upazila || "",
            union: item.union?._id || item.union || "",
            neededAt: item.neededAt ? String(item.neededAt).slice(0, 10) : "",
            contactName: item.contactName || "",
            contactPhone: item.contactPhone || "",
            details: item.details || "",
            status: item.status || "submitted",
        });
        setActionError("");
        setEditing(item);
    };

    const saveEdit = async (values) => {
        setActionError("");
        setBusyId(editing._id);
        try {
            await apiFetch(`/blood-requests/${editing._id}`, {
                method: "PATCH",
                body: {
                    ...values,
                    units: Number(values.units),
                    upazila: values.upazila || undefined,
                    neededAt: values.neededAt
                        ? new Date(values.neededAt).toISOString()
                        : undefined,
                },
            });
            setNotice("Request updated.");
            closeForm();
            reload();
        } catch (err) {
            setError("root.server", { type: "server", message: err.message });
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
            assignmentsQuery.reload();
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
            assignmentsQuery.reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    const divisions = locations.filter((item) => item.type === "division");
    const districts = locations.filter(
        (item) => item.type === "district" && String(item.parent) === divisionValue
    );
    const upazilas = locations.filter(
        (item) => item.type === "upazila" && String(item.parent) === districtValue
    );
    const unions = locations.filter(
        (item) => item.type === "union" && String(item.parent) === upazilaValue
    );

    return (
        <>
            <PageHeader
                title="All blood requests"
                subtitle="Review, edit, assign and delete submitted requests."
                actions={
                    <Button variant="primary" size="sm" onClick={openCreate}>
                        <Plus size={15} /> Add request
                    </Button>
                }
            />
            <ErrorBanner message={error || actionError} />
            {notice && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm font-medium text-success-deep">
                    <Check size={17} /> {notice}
                </div>
            )}

            {!volunteersQuery.loading && !volunteers.length && (
                <div className="mb-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                    No approved volunteers yet. Set a user's role to <strong>{t("text.volunteer")}</strong> and
                    approve them in <strong>Users &amp; approvals</strong> before assigning.
                </div>
            )}

            {!loading && !items.length ? (
                <EmptyState title="No requests found" text="Submitted requests will appear here." />
            ) : (
                <>
                <TableToolbar controls={table} searchPlaceholder="Search patient, hospital or status" />
                <TableShell footer={<TablePagination controls={table} />}>
                    <thead>
                        <tr>
                            <Th>{t("text.Patient")}</Th>
                            <Th>{t("text.Group")}</Th>
                            <Th>{t("text.Urgency")}</Th>
                            <Th>{t("text.Hospital")}</Th>
                            <Th>{t("text.Status")}</Th>
                            <Th>{t("text.Date")}</Th>
                            <Th className="text-right">{t("text.Actions")}</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={7} />
                        ) : table.rows.length === 0 ? (
                            <tr>
                                <Td colSpan={7} className="py-10 text-center text-muted-foreground">
                                    No requests match your search or filters.
                                </Td>
                            </tr>
                        ) : (
                            table.rows.map((item) => (
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
                                                ? "text-destructive"
                                                : item.urgency === "urgent"
                                                    ? "text-warning"
                                                    : "text-success"
                                        }`}>
                                            {item.urgency || "normal"}
                                        </span>
                                    </Td>
                                    <Td>{item.hospitalName}</Td>
                                    <Td><StatusBadge value={item.status} /></Td>
                                    <Td>{formatDate(item.createdAt)}</Td>
                                    <Td>
                                        <ActionGroup>
                                            <IconButton
                                                icon={Users}
                                                label="View donor responses"
                                                onClick={() => openResponses(item)}
                                            />
                                            <IconButton
                                                icon={Pencil}
                                                label="Edit request"
                                                onClick={() => openEdit(item)}
                                            />
                                            <Select
                                                size="sm"
                                                value={assignedVolunteerByRequest[item._id] ?? ""}
                                                disabled={busyId === item._id}
                                                onChange={(e) => assign(item._id, e.target.value)}
                                                className="w-28 shrink-0"
                                            >
                                                <option value="">Assign…</option>
                                                {volunteers.map((volunteer) => (
                                                    <option key={volunteer._id} value={volunteer._id}>
                                                        {volunteer.fullName}
                                                    </option>
                                                ))}
                                            </Select>
                                            <IconButton
                                                icon={UserPlus}
                                                label="Auto-assign the least busy volunteer"
                                                disabled={busyId === item._id}
                                                onClick={() => autoAssign(item._id)}
                                            />
                                            <IconButton
                                                icon={Trash2}
                                                label="Delete request"
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

            {(editing || creating) && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-overlay p-4 backdrop-blur-sm" onClick={closeForm}>
                    <form
                        onSubmit={handleSubmit(creating ? saveCreate : saveEdit)}
                        onClick={(e) => e.stopPropagation()}
                        noValidate
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-foreground">
                                {creating ? "Add blood request" : t("text.Edit request")}
                            </h2>
                            <button type="button" onClick={closeForm} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Patient name")}</span>
                                <input
                                    placeholder="e.g. Rahim Ahmed"
                                    {...register("patientName", {
                                        required: "Patient name is required.",
                                        minLength: { value: 2, message: "Name must be at least 2 characters." },
                                    })}
                                    className={inputClass(errors.patientName)}
                                />
                                <FieldError message={errors.patientName?.message} />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Blood group")}</span>
                                <Select size="lg" {...register("bloodGroup", { required: true })} value={watch("bloodGroup")} invalid={Boolean(errors.bloodGroup)}>
                                    <option value="">Select group</option>
                                    {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                                </Select>
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Urgency")}</span>
                                <Select size="lg" {...register("urgency")} value={watch("urgency")}>
                                    <option value="normal">{t("text.Normal")}</option>
                                    <option value="urgent">{t("text.Urgent")}</option>
                                    <option value="critical">{t("text.Critical")}</option>
                                </Select>
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Units")}</span>
                                <input
                                    type="number" placeholder="1–10"
                                    min="1"
                                    max="10"
                                    {...register("units", {
                                        valueAsNumber: true,
                                        min: { value: 1, message: "At least 1 unit." },
                                        max: { value: 10, message: "At most 10 units." },
                                    })}
                                    className={inputClass(errors.units)}
                                />
                                <FieldError message={errors.units?.message} />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Needed by")}</span>
                                <input
                                    type="date"
                                    min={today()}
                                    {...register("neededAt", {
                                        validate: (value) =>
                                            !value || value >= today() || "Choose today or a future date.",
                                    })}
                                    className={inputClass(errors.neededAt)}
                                />
                                <FieldError message={errors.neededAt?.message} />
                            </label>
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Hospital")}</span>
                                <input
                                    placeholder="e.g. Tangail General Hospital"
                                    {...register("hospitalName", { required: "Hospital is required." })}
                                    className={inputClass(errors.hospitalName)}
                                />
                                <FieldError message={errors.hospitalName?.message} />
                            </label>
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Hospital address")}</span>
                                <input placeholder="Street, area, city" {...register("hospitalAddress")} className={inputClass(errors.hospitalAddress)} />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Division")}</span>
                                <Select
                                    size="lg"
                                    {...register("division", {
                                        required: "Select a division.",
                                        onChange: () => {
                                            setValue("district", "");
                                            setValue("upazila", "");
                                            setValue("union", "");
                                        },
                                    })}
                                    value={divisionValue}
                                >
                                    <option value="">{t("text.Select division")}</option>
                                    {divisions.map((item) => <option key={item._id} value={item._id}>{item.nameEn}</option>)}
                                </Select>
                                <FieldError message={errors.division?.message} />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.District")}</span>
                                <Select
                                    size="lg"
                                    {...register("district", {
                                        required: "Select a district.",
                                        onChange: () => {
                                            setValue("upazila", "");
                                            setValue("union", "");
                                        },
                                    })}
                                    value={districtValue}
                                    disabled={!divisionValue}
                                >
                                    <option value="">{t("text.Select district")}</option>
                                    {districts.map((item) => <option key={item._id} value={item._id}>{item.nameEn}</option>)}
                                </Select>
                                <FieldError message={errors.district?.message} />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Upazila")}</span>
                                <Select
                                    size="lg"
                                    {...register("upazila", { onChange: () => setValue("union", "") })}
                                    value={upazilaValue}
                                    disabled={!districtValue}
                                >
                                    <option value="">{t("text.Select upazila")}</option>
                                    {upazilas.map((item) => <option key={item._id} value={item._id}>{item.nameEn}</option>)}
                                </Select>
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Union", "Union")}</span>
                                <Select size="lg" {...register("union")} value={watch("union")} disabled={!upazilaValue}>
                                    <option value="">{t("text.Select union", "Select union")}</option>
                                    {unions.map((item) => <option key={item._id} value={item._id}>{item.nameEn}</option>)}
                                </Select>
                            </label>
                            {!creating && (
                                <label>
                                    <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Status")}</span>
                                    <Select size="lg" {...register("status")} value={watch("status")}>
                                        {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                                    </Select>
                                </label>
                            )}
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Contact name")}</span>
                                <input placeholder="e.g. Rafi Ahmed" {...register("contactName")} className={inputClass(errors.contactName)} />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Contact phone")}</span>
                                <input placeholder="01XXXXXXXXX" {...register("contactPhone")} className={inputClass(errors.contactPhone)} />
                            </label>
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Details")}</span>
                                <textarea rows={2} placeholder="Anything volunteers should know…" {...register("details")} className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none focus:border-primary" />
                            </label>
                        </div>

                        {errors.root?.server && (
                            <p role="alert" className="mt-4 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                                {errors.root.server.message}
                            </p>
                        )}

                        <div className="mt-6 flex gap-2">
                            <button
                                type="submit"
                                disabled={isSubmitting || (!creating && busyId === editing._id)}
                                className="btn-premium h-10 flex-1 px-4 text-sm"
                            >
                                {isSubmitting
                                    ? creating ? "Creating…" : "Saving…"
                                    : creating ? "Create request" : "Save changes"}
                            </button>
                            <button type="button" onClick={closeForm} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">{t("text.Cancel")}</button>
                        </div>
                    </form>
                </div>
            )}

            {responsesRequest && (
                <div
                    className="fixed inset-0 z-[70] grid place-items-center bg-overlay p-4 backdrop-blur-sm"
                    onClick={() => setResponsesRequest(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-extrabold text-foreground">Donors ready to help</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {responsesRequest.patientName} · {responsesRequest.bloodGroup} · {responsesRequest.units} units
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setResponsesRequest(null)}
                                aria-label="Close"
                                className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <ErrorBanner message={responsesError} />

                        {responsesLoading ? (
                            <div className="mt-5 space-y-2">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
                                ))}
                            </div>
                        ) : responses.length === 0 ? (
                            <p className="mt-5 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                                No donors have responded yet.
                            </p>
                        ) : (
                            <ul className="mt-5 space-y-2">
                                {responses.map((response) => (
                                    <li
                                        key={response._id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3.5 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-foreground">
                                                {response.donor?.user?.fullName || "Donor"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {response.donor?.bloodGroup || "—"} · {response.donor?.availability || "—"} · {formatDate(response.respondedAt)}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <StatusBadge value={response.response} />
                                            {response.response === "interested" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        disabled={busyResponseId === response._id}
                                                        onClick={() => reviewResponse(response._id, "accept")}
                                                        className="h-8 rounded-lg bg-primary px-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={busyResponseId === response._id}
                                                        onClick={() => reviewResponse(response._id, "decline")}
                                                        className="h-8 rounded-lg border border-border px-2.5 text-xs font-bold text-muted-foreground transition hover:border-destructive hover:text-destructive disabled:opacity-60"
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="mt-6 flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const id = responsesRequest._id;
                                    setResponsesRequest(null);
                                    navigate(`/dashboard/admin/donations?request=${id}`);
                                }}
                                className="btn-premium h-10 flex-1 px-4 text-sm"
                            >
                                Record a donation
                            </button>
                            <button
                                type="button"
                                onClick={() => setResponsesRequest(null)}
                                className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground"
                            >
                                {t("text.Close", "Close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDelete && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-overlay p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <h2 className="text-lg font-extrabold text-foreground">Delete request?</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            This will permanently delete <strong>{confirmDelete.patientName}</strong>'s request and its assignments.
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

export default RequestsManagement;
