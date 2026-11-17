import { formatDate } from "../format";
import { useState } from "react";
import { CheckCircle2, Users, XCircle } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { useApiData } from "../hooks";
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

const UsersManagement = () => {
    const { data, loading, error, reload } = useApiData("/users?limit=100");
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");
    const [filter, setFilter] = useState("");
    const items = (data?.items || []).filter((item) =>
        !filter ||
        item.fullName.toLowerCase().includes(filter.toLowerCase()) ||
        item.phone.includes(filter)
    );

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

    return (
        <>
            <PageHeader
                title="Users & approvals"
                subtitle={`${data?.pagination?.total || 0} registered accounts`}
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
                                        <select
                                            value={item.role}
                                            disabled={busyId === item._id}
                                            onChange={(e) => changeRole(item._id, e.target.value)}
                                            className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold capitalize outline-none focus:border-primary"
                                        >
                                            <option value="user">user</option>
                                            <option value="volunteer">volunteer</option>
                                            <option value="moderator">moderator</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    </Td>
                                    <Td><StatusBadge value={item.accountStatus} /></Td>
                                    <Td>{formatDate(item.createdAt)}</Td>
                                    <Td>
                                        <div className="flex justify-end gap-2">
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
                                        </div>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </TableShell>
            )}
        </>
    );
};

export default UsersManagement;
