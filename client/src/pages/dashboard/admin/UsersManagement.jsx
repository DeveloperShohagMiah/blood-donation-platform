import { useState } from "react";
import {
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
    EmptyState,
    ErrorBanner,
    LoadingRow,
    PageHeader,
    StatusBadge,
    TableShell,
    Td,
    Th,
} from "../components/UI";

const emptyForm = { fullName: "", phone: "", email: "" };
const inputClass =
    "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

const UsersManagement = () => {
    const { user: currentUser } = useAuth();
    const { data, loading, error, reload } = useApiData("/users?limit=100");
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");
    const [notice, setNotice] = useState("");
    const [filter, setFilter] = useState("");
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const items = (data?.items || []).filter((item) =>
        !filter ||
        item.fullName.toLowerCase().includes(filter.toLowerCase()) ||
        item.phone.includes(filter)
    );

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            fullName: item.fullName,
            phone: item.phone,
            email: item.email || "",
        });
        setActionError("");
    };

    const saveEdit = async (event) => {
        event.preventDefault();
        setActionError("");
        setBusyId(editing._id);
        try {
            await apiFetch(`/users/${editing._id}`, {
                method: "PATCH",
                body: form,
            });
            setNotice(`${form.fullName}'s details were updated.`);
            setEditing(null);
            reload();
        } catch (err) {
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
                    <input
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Search name or phone"
                        className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary sm:w-64"
                    />
                }
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
                <TableShell>
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
                        ) : (
                            items.map((item) => (
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
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                title="Edit user"
                                                onClick={() => openEdit(item)}
                                                className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            {item.accountStatus !== "approved" ? (
                                                <button
                                                    type="button"
                                                    disabled={busyId === item._id}
                                                    onClick={() => act(item._id, { decision: "approve" })}
                                                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-xs font-bold text-white disabled:opacity-60"
                                                >
                                                    <CheckCircle2 size={13} /> Approve
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={busyId === item._id}
                                                    onClick={() => act(item._id, { decision: "suspend" })}
                                                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-bold text-muted-foreground disabled:opacity-60"
                                                >
                                                    <XCircle size={13} /> Suspend
                                                </button>
                                            )}
                                            {item._id !== currentUser?._id && (
                                                <button
                                                    type="button"
                                                    title="Deactivate account"
                                                    onClick={() => setConfirmDelete(item)}
                                                    className="grid size-8 place-items-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
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
                        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-foreground">Edit user</h2>
                            <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="mt-5 space-y-4">
                            <div>
                                <label htmlFor="edit-name" className="mb-1.5 block text-sm font-bold text-foreground">Full name</label>
                                <input id="edit-name" required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="edit-phone" className="mb-1.5 block text-sm font-bold text-foreground">Phone number</label>
                                <input id="edit-phone" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="edit-email" className="mb-1.5 block text-sm font-bold text-foreground">Email</label>
                                <input id="edit-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} />
                            </div>
                        </div>
                        <div className="mt-6 flex gap-2">
                            <button type="submit" disabled={busyId === editing._id} className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:opacity-60">
                                {busyId === editing._id ? "Saving…" : "Save changes"}
                            </button>
                            <button type="button" onClick={() => setEditing(null)} className="h-10 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground">
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
