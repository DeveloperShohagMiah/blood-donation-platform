import { t } from "../../../utils/tr.js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    LockKeyhole,
    Pencil,
    Trash2,
    UserPlus,
    Users,
    X,
    XCircle,
} from "lucide-react";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
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

const emptyForm = {
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    accountStatus: "approved",
};
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

const UsersManagement = () => {
    const { user: currentUser } = useAuth();
    const { data, loading, error, reload } = useApiData("/users?limit=100");
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");
    const [notice, setNotice] = useState("");
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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
        setCreating(false);
        setShowPassword(false);
        setActionError("");
    };

    const openCreate = () => {
        reset(emptyForm);
        setActionError("");
        setCreating(true);
    };

    const saveCreate = async (values) => {
        setActionError("");
        try {
            const { confirmPassword, ...payload } = values;
            const { user } = await apiFetch("/users", {
                method: "POST",
                body: payload,
            });
            setNotice(`${user.fullName}'s account was created.`);
            closeForm();
            reload();
        } catch (err) {
            setError("root.server", { type: "server", message: err.message });
            setActionError(err.message);
        }
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
                actions={
                    <Button variant="primary" size="sm" onClick={openCreate}>
                        <UserPlus size={15} /> Add user
                    </Button>
                }
            />
            <ErrorBanner message={error || actionError} />
            {notice && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm font-medium text-success-deep">
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
                            <Th>{t("text.Name")}</Th>
                            <Th>{t("text.Phone")}</Th>
                            <Th>{t("text.Role")}</Th>
                            <Th>{t("text.Status")}</Th>
                            <Th>{t("text.Joined")}</Th>
                            <Th className="text-right">{t("text.Actions")}</Th>
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
                                            <option value="user">{t("text.user")}</option>
                                            <option value="volunteer">{t("text.volunteer")}</option>
                                            <option value="moderator">{t("text.moderator")}</option>
                                            <option value="admin">{t("text.admin")}</option>
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
                                                    className="btn-premium h-8 px-2.5 text-xs"
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

            {creating && (
                <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-overlay p-4 backdrop-blur-sm" onClick={closeForm}>
                    <form
                        onSubmit={handleSubmit(saveCreate)}
                        onClick={(e) => e.stopPropagation()}
                        noValidate
                        className="my-8 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-extrabold text-foreground">{t("text.Add user")}</h2>
                                <p className="mt-1 text-xs text-muted-foreground">Create an account directly — no signup or approval needed.</p>
                            </div>
                            <button type="button" onClick={closeForm} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <Input
                                label={t("text.Full name")}
                                id="create-name"
                                icon={Users}
                                error={errors.fullName?.message}
                                placeholder="e.g. Rafi Ahmed"
                                {...register("fullName", {
                                    required: "Full name is required.",
                                    minLength: { value: 2, message: "Name must be at least 2 characters." },
                                })}
                            />
                            <Input
                                label={t("text.Phone number")}
                                id="create-phone"
                                icon={UserPlus}
                                error={errors.phone?.message}
                                placeholder="01XXXXXXXXX"
                                {...register("phone", {
                                    required: "Phone number is required.",
                                    pattern: {
                                        value: /^(?:\+?88)?01[3-9]\d{8}$/,
                                        message: "Enter a valid mobile number.",
                                    },
                                })}
                            />
                            <div className="sm:col-span-2">
                                <Input
                                    label={t("text.Email")}
                                    id="create-email"
                                    type="email"
                                    icon={Users}
                                    error={errors.email?.message}
                                    placeholder="name@example.com (optional)"
                                    {...register("email", {
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Enter a valid email address.",
                                        },
                                    })}
                                />
                            </div>
                            <div>
                                <label htmlFor="create-role" className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Role")}</label>
                                <Select id="create-role" {...register("role")}>
                                    <option value="user">user</option>
                                    <option value="volunteer">volunteer</option>
                                    <option value="moderator">moderator</option>
                                    <option value="admin">admin</option>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="create-status" className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Status")}</label>
                                <Select id="create-status" {...register("accountStatus")}>
                                    <option value="approved">approved</option>
                                    <option value="pending">pending</option>
                                </Select>
                            </div>
                            <Input
                                label={t("text.Password")}
                                id="create-password"
                                type={showPassword ? "text" : "password"}
                                icon={LockKeyhole}
                                error={errors.password?.message}
                                hint="At least 8 characters."
                                trailing={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                }
                                {...register("password", {
                                    required: "Password is required.",
                                    minLength: { value: 8, message: "Use at least 8 characters." },
                                })}
                            />
                            <Input
                                label="Confirm password"
                                id="create-confirm"
                                type={showPassword ? "text" : "password"}
                                icon={LockKeyhole}
                                error={errors.confirmPassword?.message}
                                trailing={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                }
                                {...register("confirmPassword", {
                                    required: "Please confirm the password.",
                                    validate: (value, form) =>
                                        value === form.password || "Passwords do not match.",
                                })}
                            />
                        </div>

                        {errors.root?.server && (
                            <p role="alert" className="mt-4 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                                {errors.root.server.message}
                            </p>
                        )}

                        <div className="mt-6 flex gap-2">
                            <Button type="submit" variant="primary" size="md" className="flex-1" disabled={isSubmitting}>
                                {isSubmitting ? "Creating…" : "Create user"}
                            </Button>
                            <Button type="button" variant="outline" size="md" onClick={closeForm}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-overlay p-4 backdrop-blur-sm" onClick={closeForm}>
                    <form
                        onSubmit={handleSubmit(saveEdit)}
                        onClick={(e) => e.stopPropagation()}
                        noValidate
                        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-foreground">{t("text.Edit user")}</h2>
                            <button type="button" onClick={closeForm} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="mt-5 space-y-4">
                            <div>
                                <label htmlFor="edit-name" className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Full name")}</label>
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
                                <label htmlFor="edit-phone" className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Phone number")}</label>
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
                                <label htmlFor="edit-email" className="mb-1.5 block text-sm font-bold text-foreground">{t("text.Email")}</label>
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
                            <p role="alert" className="mt-4 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                                {errors.root.server.message}
                            </p>
                        )}
                        <div className="mt-6 flex gap-2">
                            <button type="submit" disabled={isSubmitting || busyId === editing._id} className="btn-premium h-10 flex-1 px-4 text-sm">
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
                <div className="fixed inset-0 z-[70] grid place-items-center bg-overlay p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
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
                                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-destructive px-4 text-sm font-bold text-primary-foreground disabled:opacity-60"
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
