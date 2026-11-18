import { t } from "../../../utils/tr.js";
import { formatDate } from "../format";
import { CalendarDays } from "lucide-react";
import {
    TablePagination,
    TableToolbar,
} from "../components/TableControls";
import { useTableControls } from "../components/useTableControls";

const searchFields = [
    "donor.user.fullName",
    "donor.bloodGroup",
    "request.patientName",
    "request.bloodGroup",
    "confirmedBy.fullName",
];
const filterDefinitions = [
    {
        key: "request.bloodGroup",
        label: "Group",
        options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((value) => ({ value, label: value })),
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

const DonationsAdmin = () => {
    const { data, loading, error } = useApiData("/donations");
    const items = data?.items || [];
    const table = useTableControls(items, {
        searchFields,
        filters: filterDefinitions,
    });

    return (
        <>
            <PageHeader
                title="Donations"
                subtitle="Confirmed donations across the platform."
            />
            <ErrorBanner message={error} />

            {!loading && !items.length ? (
                <EmptyState icon={CalendarDays} title="No donations recorded" text="Confirmed donations will appear here." />
            ) : (
                <>
                <TableToolbar controls={table} searchPlaceholder="Search donor, patient or group" />
                <TableShell footer={<TablePagination controls={table} />}>
                    <thead>
                        <tr>
                            <Th>{t("text.Date")}</Th>
                            <Th>{t("text.Donor")}</Th>
                            <Th>{t("text.Patient")}</Th>
                            <Th>{t("text.Group")}</Th>
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
                                    <Td>{item.donor?.user?.fullName || item.donor?.bloodGroup || "—"}</Td>
                                    <Td>{item.request?.patientName || "—"}</Td>
                                    <Td>
                                        <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-extrabold text-primary">
                                            {item.request?.bloodGroup || "—"}
                                        </span>
                                    </Td>
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

export default DonationsAdmin;
