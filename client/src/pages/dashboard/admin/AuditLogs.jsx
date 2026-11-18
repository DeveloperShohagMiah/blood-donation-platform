import { t } from "../../../utils/tr.js";
import { useMemo } from "react";
import { formatDate } from "../format";
import { FileClock } from "lucide-react";
import {
    TablePagination,
    TableToolbar,
} from "../components/TableControls";
import { useTableControls } from "../components/useTableControls";

const searchFields = ["action", "resourceType", "ip", "actor.fullName", (item) => item.resourceId];
import { useApiData } from "../hooks";
import {
    EmptyState,
    ErrorBanner,
    LoadingRow,
    PageHeader,
    TableShell,
    Td,
    Th,
} from "../components/UI";

const AuditLogs = () => {
    const { data, loading, error } = useApiData("/audit-logs");
    const items = useMemo(() => data?.items || [], [data]);
    const filters = useMemo(
        () => [{
            key: "resourceType",
            label: "Resource",
            options: [...new Set(items.map((item) => item.resourceType).filter(Boolean))]
                .map((value) => ({ value, label: value })),
        }],
        [items]
    );
    const table = useTableControls(items, { searchFields, filters });

    return (
        <>
            <PageHeader
                title="Audit log"
                subtitle="A record of important actions across the platform."
            />
            <ErrorBanner message={error} />

            {!loading && !items.length ? (
                <EmptyState icon={FileClock} title="No activity yet" text="Actions will be logged here automatically." />
            ) : (
                <>
                <TableToolbar controls={table} searchPlaceholder="Search action, actor or IP" />
                <TableShell footer={<TablePagination controls={table} />}>
                    <thead>
                        <tr>
                            <Th>{t("text.Time")}</Th>
                            <Th>{t("text.Action")}</Th>
                            <Th>{t("text.Resource")}</Th>
                            <Th>{t("text.Actor")}</Th>
                            <Th>{t("text.IP")}</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={5} />
                        ) : table.rows.length === 0 ? (
                            <tr>
                                <Td colSpan={5} className="py-10 text-center text-muted-foreground">
                                    No activity matches your search or filter.
                                </Td>
                            </tr>
                        ) : (
                            table.rows.map((item) => (
                                <tr key={item._id} className="hover:bg-muted/30">
                                    <Td>{formatDate(item.createdAt)}</Td>
                                    <Td className="font-mono text-xs font-bold text-foreground">{item.action}</Td>
                                    <Td className="text-muted-foreground">
                                        {item.resourceType}
                                        <span className="ml-1 text-[11px] opacity-60">{item.resourceId}</span>
                                    </Td>
                                    <Td>{item.actor?.fullName || "System"}</Td>
                                    <Td className="text-xs text-muted-foreground">{item.ip || "—"}</Td>
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

export default AuditLogs;
