import { formatDate } from "../format";
import { CalendarDays } from "lucide-react";
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

const DonationHistory = () => {
    const { data, loading, error } = useApiData("/donations/me");
    const items = data?.items || [];

    return (
        <>
            <PageHeader
                title="Donation history"
                subtitle="Confirmed donations recorded by the Blood Connect team."
            />
            <ErrorBanner message={error} />

            {!loading && !items.length ? (
                <EmptyState
                    icon={CalendarDays}
                    title="No donations recorded yet"
                    text="Once a volunteer confirms a donation, it will appear here."
                />
            ) : (
                <TableShell>
                    <thead>
                        <tr>
                            <Th>Date</Th>
                            <Th>Patient</Th>
                            <Th>Blood group</Th>
                            <Th>Hospital</Th>
                            <Th>Units</Th>
                            <Th>Confirmed by</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={6} />
                        ) : (
                            items.map((item) => (
                                <tr key={item._id} className="hover:bg-muted/30">
                                    <Td className="font-bold">{formatDate(item.donatedAt)}</Td>
                                    <Td>{item.request?.patientName || "—"}</Td>
                                    <Td>
                                        <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-extrabold text-primary">
                                            {item.request?.bloodGroup || item.bloodGroup || "—"}
                                        </span>
                                    </Td>
                                    <Td>{item.request?.hospitalName || "—"}</Td>
                                    <Td>{item.units}</Td>
                                    <Td>{item.confirmedBy?.fullName || "—"}</Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </TableShell>
            )}
        </>
    );
};

export default DonationHistory;
