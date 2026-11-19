import { t } from "../../../utils/tr.js";
import { formatDate } from "../format";
import { useState } from "react";
import { Droplets, Plus, XCircle } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import RequestBloodModal from "../../../components/RequestBloodModal";
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
    const [createOpen, setCreateOpen] = useState(false);
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
                    <button
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        className="btn-premium h-10 px-4 text-sm"
                    >
                        <Plus size={16} /> New request
                    </button>
                }
            />

            <ErrorBanner message={error || actionError} />

            {!loading && !items.length ? (
                <EmptyState
                    icon={Droplets}
                    title="No requests yet"
                    text="When you submit a blood request, you can follow its status here."
                    action={
                        <button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="btn-premium h-10 px-4 text-sm"
                        >
                            Create a request
                        </button>
                    }
                />
            ) : (
                <>
                <TableToolbar controls={table} searchPlaceholder="Search patient, hospital or status" />
                <TableShell footer={<TablePagination controls={table} />}>
                    <thead>
                        <tr>
                            <Th>{t("text.Patient")}</Th>
                            <Th>{t("text.Blood group")}</Th>
                            <Th>{t("text.Urgency")}</Th>
                            <Th>{t("text.Hospital")}</Th>
                            <Th>{t("text.Needed by")}</Th>
                            <Th>{t("text.Progress")}</Th>
                            <Th>{t("text.Status")}</Th>
                            <Th className="text-right">{t("text.Action")}</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={8} />
                        ) : table.rows.length === 0 ? (
                            <tr>
                                <Td colSpan={8} className="py-10 text-center text-muted-foreground">
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
                                                ? "text-destructive"
                                                : item.urgency === "urgent"
                                                    ? "text-warning"
                                                    : "text-success"
                                        }`}>
                                            {item.urgency || "normal"}
                                        </span>
                                    </Td>
                                    <Td>{item.hospitalName}</Td>
                                    <Td>{formatDate(item.neededAt)}</Td>
                                    <Td>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary"
                                                    style={{
                                                        width: `${Math.min(100, ((item.unitsFulfilled || 0) / (item.units || 1)) * 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-foreground">
                                                {item.unitsFulfilled || 0}/{item.units || 1}
                                            </span>
                                        </div>
                                    </Td>
                                    <Td><StatusBadge value={item.status} /></Td>
                                    <Td className="text-right">
                                        {["submitted", "verified", "matching"].includes(item.status) ? (
                                            <button
                                                type="button"
                                                onClick={() => cancel(item._id)}
                                                disabled={busyId === item._id}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-destructive transition hover:text-destructive disabled:opacity-50"
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

            <RequestBloodModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSuccess={reload}
            />
        </>
    );
};

export default MyRequests;
