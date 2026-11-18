import { formatDate } from "../format";
import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { useApiData } from "../hooks";
import Select from "../../../components/Select";
import {
    TablePagination,
    TableToolbar,
} from "../components/TableControls";
import { useTableControls } from "../components/useTableControls";

const searchFields = [
    "requesterName",
    "requesterPhone",
    "status",
    (item) => item.donor?.user?.fullName,
];
const filterDefinitions = [
    {
        key: "status",
        label: "Status",
        options: ["pending", "contacted", "closed", "rejected"].map((value) => ({ value, label: value })),
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

const ContactRequestsAdmin = () => {
    const { data, loading, error, reload } = useApiData("/contact-requests?limit=100");
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");
    const items = data?.items || [];
    const table = useTableControls(items, {
        searchFields,
        filters: filterDefinitions,
    });

    const setStatus = async (id, status) => {
        setActionError("");
        setBusyId(id);
        try {
            await apiFetch(`/contact-requests/${id}/status`, {
                method: "PATCH",
                body: { status },
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
                title="Contact requests"
                subtitle="Introductions requested between donors and people in need."
            />
            <ErrorBanner message={error || actionError} />

            {!loading && !items.length ? (
                <EmptyState icon={HeartHandshake} title="No contact requests" text="New requests will appear here." />
            ) : (
                <>
                <TableToolbar controls={table} searchPlaceholder="Search requester or status" />
                <TableShell footer={<TablePagination controls={table} />}>
                    <thead>
                        <tr>
                            <Th>Requester</Th>
                            <Th>Donor</Th>
                            <Th>Message</Th>
                            <Th>Status</Th>
                            <Th>Date</Th>
                            <Th className="text-right">Action</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={6} />
                        ) : table.rows.length === 0 ? (
                            <tr>
                                <Td colSpan={6} className="py-10 text-center text-muted-foreground">
                                    No contact requests match your search or filters.
                                </Td>
                            </tr>
                        ) : (
                            table.rows.map((item) => (
                                <tr key={item._id} className="hover:bg-muted/30">
                                    <Td>
                                        <p className="font-bold">{item.requesterName}</p>
                                        <p className="text-xs text-muted-foreground">{item.requesterPhone}</p>
                                    </Td>
                                    <Td>
                                        {item.donor?.user?.fullName || "—"}
                                        <span className="ml-1 text-xs font-bold text-primary">
                                            {item.donor?.bloodGroup || ""}
                                        </span>
                                    </Td>
                                    <Td className="max-w-60 truncate text-muted-foreground">
                                        {item.message || "—"}
                                    </Td>
                                    <Td><StatusBadge value={item.status} /></Td>
                                    <Td>{formatDate(item.createdAt)}</Td>
                                    <Td>
                                        <Select
                                            size="sm"
                                            value={item.status}
                                            disabled={busyId === item._id}
                                            onChange={(e) => setStatus(item._id, e.target.value)}
                                        >
                                            <option value="pending">pending</option>
                                            <option value="contacted">contacted</option>
                                            <option value="closed">closed</option>
                                            <option value="rejected">rejected</option>
                                        </Select>
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

export default ContactRequestsAdmin;
