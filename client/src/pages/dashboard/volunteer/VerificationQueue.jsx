import { useState } from "react";
import { CheckCircle2, Hand, ShieldCheck, XCircle } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { useApiData } from "../hooks";
import { formatDate } from "../format";
import {
    EmptyState,
    ErrorBanner,
    PageHeader,
    TableShell,
    Td,
    Th,
} from "../components/UI";

const VerificationQueue = () => {
    const queueQuery = useApiData("/blood-requests");
    const assignmentsQuery = useApiData("/assignments/me");
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");
    const [notice, setNotice] = useState("");

    const items = (queueQuery.data?.items || []).filter((item) =>
        ["submitted", "pending_verification"].includes(item.status)
    );
    const assignedIds = new Set(
        (assignmentsQuery.data?.items || [])
            .filter((item) => item.status === "active")
            .map((item) => (typeof item.request === "string" ? item.request : item.request?._id))
    );

    const claim = async (id) => {
        setActionError("");
        setNotice("");
        setBusyId(id);
        try {
            await apiFetch(`/blood-requests/${id}/assignments`, {
                method: "POST",
                body: {},
            });
            setNotice("Request claimed. You can verify it now.");
            queueQuery.reload();
            assignmentsQuery.reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    const decide = async (id, decision) => {
        setActionError("");
        setNotice("");
        setBusyId(id);
        try {
            await apiFetch(`/blood-requests/${id}/verify`, {
                method: "PATCH",
                body: { decision, note: "" },
            });
            setNotice(decision === "verify" ? "Request verified." : "Request rejected.");
            queueQuery.reload();
            assignmentsQuery.reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    return (
        <>
            <PageHeader
                title="Verification queue"
                subtitle="Claim a submitted request, then verify or reject it."
            />
            <ErrorBanner message={queueQuery.error || assignmentsQuery.error || actionError} />
            {notice && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {notice}
                </div>
            )}

            {!queueQuery.loading && !items.length ? (
                <EmptyState
                    icon={ShieldCheck}
                    title="Queue is clear"
                    text="There are no submitted requests waiting for verification."
                />
            ) : (
                <TableShell>
                    <thead>
                        <tr>
                            <Th>Patient</Th>
                            <Th>Group</Th>
                            <Th>Hospital</Th>
                            <Th>Submitted</Th>
                            <Th className="text-right">Action</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {queueQuery.loading ? (
                            <tr><Td colSpan={5}>Loading…</Td></tr>
                        ) : (
                            items.map((item) => {
                                const canVerify = assignedIds.has(item._id);
                                return (
                                    <tr key={item._id} className="hover:bg-muted/30">
                                        <Td className="font-bold">{item.patientName}</Td>
                                        <Td>
                                            <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-extrabold text-primary">
                                                {item.bloodGroup}
                                            </span>
                                        </Td>
                                        <Td>{item.hospitalName}</Td>
                                        <Td>{formatDate(item.createdAt)}</Td>
                                        <Td>
                                            <div className="flex justify-end gap-2">
                                                {canVerify ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            disabled={busyId === item._id}
                                                            onClick={() => decide(item._id, "verify")}
                                                            className="inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-bold text-white transition hover:brightness-95 disabled:opacity-60"
                                                        >
                                                            <CheckCircle2 size={14} /> Verify
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={busyId === item._id}
                                                            onClick={() => decide(item._id, "reject")}
                                                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-bold text-rose-600 transition hover:border-rose-300 disabled:opacity-60"
                                                        >
                                                            <XCircle size={14} /> Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={busyId === item._id}
                                                        onClick={() => claim(item._id)}
                                                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-primary/40 bg-primary/5 px-3 text-xs font-bold text-primary transition hover:bg-primary/10 disabled:opacity-60"
                                                    >
                                                        <Hand size={14} />
                                                        {busyId === item._id ? "Claiming…" : "Claim to verify"}
                                                    </button>
                                                )}
                                            </div>
                                        </Td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </TableShell>
            )}
        </>
    );
};

export default VerificationQueue;
