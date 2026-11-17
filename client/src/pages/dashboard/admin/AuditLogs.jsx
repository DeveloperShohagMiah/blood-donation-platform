import { formatDate } from "../format";
import { FileClock } from "lucide-react";
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
    const items = data?.items || [];

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
                <TableShell>
                    <thead>
                        <tr>
                            <Th>Time</Th>
                            <Th>Action</Th>
                            <Th>Resource</Th>
                            <Th>Actor</Th>
                            <Th>IP</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={5} />
                        ) : (
                            items.map((item) => (
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
            )}
        </>
    );
};

export default AuditLogs;
