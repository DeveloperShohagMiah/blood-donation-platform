import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    AlertCircle,
    CheckCircle2,
    Pencil,
    Trash2,
    Users,
    X,
    XCircle,
} from "lucide-react";
import { useAuth } from "../../../context/useAuth";
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

const searchFields = ["fullName", "email", "phone", "role", "accountStatus"];
const filterDefinitions = [
    {
        key: "role",
        label: "Role",
        options: ["user", "volunteer", "moderator", "admin"].map((value) => ({ value, label: value })),
    },
    {
        key: "accountStatus",
        label: "Status",
        options: ["pending", "approved", "rejected", "suspended"].map((value) => ({ value, label: value })),
    },
];

const emptyForm = { fullName: "", phone: "", email: "" };
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

const UsersManagement = () => {
    const { user: currentUser } = useAuth();
    const { data, loading, error, reload } = useApiData("/users?limit=100");
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");
    const [notice, setNotice] = useState("");
    const [editing, setEditing] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: emptyForm, mode: "onBlur" });

    const items = data?.items || [];
    const table = useTableControls(items, {
        searchFields,
        filters: filterDefinitions,
    });

    const closeForm = () => {
        setEditing(null);
        setActionError("");
    };

    const openEdit = (item) => {
        reset({
            fullName: item.fullName || "",
            phone: item.phone || "",
            email: item.email || "",
        });
        setActionError("");
        setEditing(item);
    };

    const saveEdit = async (values) => {
        setActionError("");
        setBusyId(editing._id);
        try {
            await apiFetch(`/users/${editing._id}`, {
                method: "PATCH",
                body: values,
            });
            setNotice(`${values.fullName}'s details were updated.`);
            closeForm();
            reload();
        } catch (err) {
            setError("root.server", { type: "server", message: err.message });
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    const act = async (id, body) => {
        setActionError("");
        setBusyId(id);
        try {
            await apiFetch(`/users/${id}/approval`, { method: "PATCH", body });
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    const changeRole = async (id, role) => {
        setActionError("");
        setBusyId(id);
        try {
            await apiFetch(`/users/${id}/role`, { method: "PATCH", body: { role } });
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    const deactivate = async () => {
        setActionError("");
        setBusyId(confirmDelete._id);
        try {
            await apiFetch(`/users/${confirmDelete._id}`, { method: "DELETE" });
            setNotice(`${confirmDelete.fullName}'s account was deactivated.`);
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
                title="Users & approvals"
                subtitle={`${data?.pagination?.total || 0} active accounts`}
            />
            <ErrorBanner message={error || actionError} />
            {notice && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={17} /> {notice}
                </div>
            )}

            {!loading && !items.length ? (
                <EmptyState icon={Users} title="No users found" text="Registered accounts will appear here." />
            ) : (
                <>
                <TableToolbar controls={table} searchPlaceholder="Search name, phone or email" />
                <TableShell footer={<TablePagination controls={table} />}>
                    <thead>
                        <tr>
                            <Th>Name</Th>
                            <Th>Phone</Th>
                            <Th>Role</Th>
                            <Th>Status</Th>
                            <Th>Joined</Th>
                            <Th className="text-right">Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={6} />
                        ) : table.rows.length === 0 ? (
                            <tr>
                                <Td colSpan={6} className="py-10 text-center text-muted-foreground">
                                    No users match your search or filters.
                                </Td>
                            </tr>
                        ) : (
                            table.rows.map((item) => (
                                <tr key={item._id} className="hover:bg-muted/30">
                                    <Td>
                                        <p className="font-bold">{item.fullName}</p>
                                        {item.email && <p className="text-xs text-muted-foreground">{item.email}</p>}
                                    </Td>
                                    <Td>{item.phone}</Td>
                                    <Td>
                                        <Select
                                            size="sm"
                                            value={item.role}
                                            disabled={busyId === item._id}
                                            onChange={(e) => changeRole(item._id, e.target.value)}
                                        >
                                            <option value="user">user</option>
                                            <option value="volunteer">volunteer</option>
                                            <option value="moderator">moderator</option>
                                            <option value="admin">admin</option>
                                        </Select>
                                    </Td>
                                    <Td><StatusBadge value={item.accountStatus} /></Td>
                                    <Td>{formatDate(item.createdAt)}</Td>
                                    <Td>
                                        <ActionGroup>
                                            <IconButton
                                                icon={Pencil}
                                                label="Edit user"
                                                onClick={() => openEdit(item)}
                                            />
                                            {item.accountStatus !== "approved" ? (
                                                <button
                                                    type="button"
                                                    disabled={busyId === item._id}
                                                    onClick={() => act(item._id, { decision: "approve" })}
                                                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-xs font-bold text-white transition hover:bg-primary-hover disabled:opacity-60"
                                                >
                                                    <CheckCircle2 size={13} /> Approve
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={busyId === item._id}
                                                    onClick={() => act(item._id, { decision: "suspend" })}
                                                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-60"
                                                >
                                                    <XCircle size={13} /> Suspend
                                                </button>
                                            )}
                                            {item._id !== currentUser?._id && (
                                                <IconButton
                                                    icon={Trash2}
                                                    label="Deactivate account"
                                                    tone="danger"
                                                    onClick={() => setConfirmDelete(item)}
                                                />
                                            )}
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
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={closeForm}>
                    <form
                        onSubmit={handleSubmit(saveEdit)}
                        onClick={(e) => e.stopPropagation()}
                        noValidate
                        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-foreground">Edit user</h2>
                            <button type="button" onClick={closeForm} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="mt-5 space-y-4">
                            <div>
                                <label htmlFor="edit-name" className="mb-1.5 block text-sm font-bold text-foreground">Full name</label>
                                <input
                                    id="edit-name"
                                    {...register("fullName", {
                                        required: "Full name is required.",
                                        minLength: { value: 2, message: "Name must be at least 2 characters." },
                                    })}
                                    className={inputClass(errors.fullName)}
                                />
                                <FieldError message={errors.fullName?.message} />
                            </div>
                            <div>
                                <label htmlFor="edit-phone" className="mb-1.5 block text-sm font-bold text-foreground">Phone number</label>
                                <input
                                    id="edit-phone"
                                    {...register("phone", {
                                        required: "Phone number is required.",
                                        pattern: {
                                            value: /^(?:\+?88)?01[3-9]\d{8}$/,
                                            message: "Enter a valid mobile number.",
                                        },
                                    })}
                                    className={inputClass(errors.phone)}
                                />
                                <FieldError message={errors.phone?.message} />
                            </div>
                            <div>
                                <label htmlFor="edit-email" className="mb-1.5 block text-sm font-bold text-foreground">Email</label>
                                <input
                                    id="edit-email"
                                    type="email"
                                    {...register("email", {
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Enter a valid email address.",
                                        },
                                    })}
                                    className={inputClass(errors.email)}
                                />
                                <FieldError message={errors.email?.message} />
                            </div>
                        </div>
                        {errors.root?.server && (
                            <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                                {errors.root.server.message}
                            </p>
                        )}
                        <div className="mt-6 flex gap-2">
                            <button type="submit" disabled={isSubmitting || busyId === editing._id} className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:opacity-60">
                                {isSubmitting || busyId === editing._id ? "Saving…" : "Save changes"}
                            </button>
                            <button type="button" onClick={closeForm} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {confirmDelete && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <h2 className="text-lg font-extrabold text-foreground">Deactivate account?</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            <strong>{confirmDelete.fullName}</strong> will be signed out and hidden from the user list. Their requests and history are kept for records.
                        </p>
                        <div className="mt-6 flex gap-2">
                            <button
                                type="button"
                                disabled={busyId === confirmDelete._id}
                                onClick={deactivate}
                                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-bold text-white disabled:opacity-60"
                            >
                                {busyId === confirmDelete._id ? "Deactivating…" : "Deactivate"}
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(null)} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UsersManagement;
