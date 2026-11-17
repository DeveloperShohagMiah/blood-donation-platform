import { formatDate } from "../format";
import { useState } from "react";
import { UserPlus } from "lucide-react";
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

const RequestsManagement = () => {
    const { data, loading, error, reload } = useApiData("/blood-requests?limit=100");
    const volunteersQuery = useApiData("/users?role=volunteer&limit=100");
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");
    const [filter, setFilter] = useState("");
    const items = (data?.items || []).filter((item) =>
        !filter ||
        item.patientName.toLowerCase().includes(filter.toLowerCase()) ||
        item.status.includes(filter.toLowerCase())
    );
    const volunteers = (volunteersQuery.data?.items || []).filter(
        (user) => user.accountStatus === "approved"
    );

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

    return (
        <>
            <PageHeader
                title="All blood requests"
                subtitle="Review, assign and monitor every submitted request."
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
                            <Th>Assign volunteer</Th>
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
                                        <div className="flex items-center gap-2">
                                            <select
                                                defaultValue=""
                                                disabled={busyId === item._id}
                                                onChange={(e) => assign(item._id, e.target.value)}
                                                className="h-9 max-w-40 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary"
                                            >
                                                <option value="">Choose…</option>
                                                {volunteers.map((volunteer) => (
                                                    <option key={volunteer._id} value={volunteer._id}>
                                                        {volunteer.fullName}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                title="Auto-assign the least busy volunteer"
                                                disabled={busyId === item._id}
                                                onClick={() => autoAssign(item._id)}
                                                className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-60"
                                            >
                                                <UserPlus size={15} />
                                            </button>
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

export default RequestsManagement;
