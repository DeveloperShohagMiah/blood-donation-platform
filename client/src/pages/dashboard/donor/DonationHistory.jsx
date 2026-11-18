import { t } from "../../../utils/tr.js";
import { formatDate } from "../format";
import { CalendarDays } from "lucide-react";
import {
    TablePagination,
    TableToolbar,
} from "../components/TableControls";
import { useTableControls } from "../components/useTableControls";

const searchFields = [
    "request.patientName",
    "request.bloodGroup",
    "request.hospitalName",
    "confirmedBy.fullName",
];
const filterDefinitions = [
    {
        key: "bloodGroup",
        label: "Group",
        options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((value) => ({ value, label: value })),
        match: (item, value) => (item.request?.bloodGroup || item.bloodGroup) === value,
    },
];
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
    const table = useTableControls(items, {
        searchFields,
        filters: filterDefinitions,
    });

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
                <>
                <TableToolbar controls={table} searchPlaceholder="Search patient, hospital or group" />
                <TableShell footer={<TablePagination controls={table} />}>
                    <thead>
                        <tr>
                            <Th>{t("text.Date")}</Th>
                            <Th>{t("text.Patient")}</Th>
                            <Th>{t("text.Blood group")}</Th>
                            <Th>{t("text.Hospital")}</Th>
                            <Th>{t("text.Units")}</Th>
                            <Th>{t("text.Confirmed by")}</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={6} />
                        ) : table.rows.length === 0 ? (
                            <tr>
                                <Td colSpan={6} className="py-10 text-center text-muted-foreground">
                                    No donations match your search or filter.
                                </Td>
                            </tr>
                        ) : (
                            table.rows.map((item) => (
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
                </>
            )}
        </>
    );
};

export default DonationHistory;
