import { formatDate } from "../format";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Droplets, Plus, XCircle } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { useApiData } from "../hooks";
import {
    TablePagination,
    TableToolbar,
} from "../components/TableControls";
import { useTableControls } from "../components/useTableControls";

const searchFields = ["patientName", "hospitalName", "status", "bloodGroup"];
const filterDefinitions = [
    {
        key: "status",
        label: "Status",
        options: [
            "submitted", "pending_verification", "verified", "matching",
            "in_progress", "fulfilled", "rejected", "cancelled", "expired",
        ].map((value) => ({ value, label: value.replaceAll("_", " ") })),
    },
];
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

const MyRequests = () => {
    const { data, loading, error, reload } = useApiData("/blood-requests");
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");
    const items = data?.items || [];
    const table = useTableControls(items, {
        searchFields,
        filters: filterDefinitions,
    });

    const cancel = async (id) => {
        setActionError("");
        setBusyId(id);
        try {
            await apiFetch(`/blood-requests/${id}/cancel`, { method: "PATCH" });
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
                title="My blood requests"
                subtitle="Track the requests you have submitted."
                actions={
                    <Link
                        to="/create-blood-requests"
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:brightness-95"
                    >
                        <Plus size={16} /> New request
                    </Link>
                }
            />

            <ErrorBanner message={error || actionError} />

            {!loading && !items.length ? (
                <EmptyState
                    icon={Droplets}
                    title="No requests yet"
                    text="When you submit a blood request, you can follow its status here."
                    action={
                        <Link to="/create-blood-requests" className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-bold text-white">
                            Create a request
                        </Link>
                    }
                />
            ) : (
                <>
                <TableToolbar controls={table} searchPlaceholder="Search patient, hospital or status" />
                <TableShell footer={<TablePagination controls={table} />}>
                    <thead>
                        <tr>
                            <Th>Patient</Th>
                            <Th>Blood group</Th>
                            <Th>Urgency</Th>
                            <Th>Hospital</Th>
                            <Th>Needed by</Th>
                            <Th>Status</Th>
                            <Th className="text-right">Action</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={7} />
                        ) : table.rows.length === 0 ? (
                            <tr>
                                <Td colSpan={7} className="py-10 text-center text-muted-foreground">
                                    No requests match your search or filter.
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
                                                ? "text-rose-600"
                                                : item.urgency === "urgent"
                                                    ? "text-amber-600"
                                                    : "text-emerald-600"
                                        }`}>
                                            {item.urgency || "normal"}
                                        </span>
                                    </Td>
                                    <Td>{item.hospitalName}</Td>
                                    <Td>{formatDate(item.neededAt)}</Td>
                                    <Td><StatusBadge value={item.status} /></Td>
                                    <Td className="text-right">
                                        {["submitted", "verified", "matching"].includes(item.status) ? (
                                            <button
                                                type="button"
                                                onClick={() => cancel(item._id)}
                                                disabled={busyId === item._id}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 transition hover:text-rose-700 disabled:opacity-50"
                                            >
                                                <XCircle size={14} />
                                                {busyId === item._id ? "Cancelling…" : "Cancel"}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </TableShell>
                </>
            )}
        </>
    );
};

export default MyRequests;
