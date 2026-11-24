import { useEffect, useState } from "react";
import {
    Activity,
    CalendarCheck,
    Download,
    Droplets,
    Target,
    TrendingUp,
    Users,
} from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { PageHeader } from "../components/UI";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const StatCard = ({ icon: Icon, label, value, hint }) => (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="mt-2 font-display text-3xl font-extrabold text-foreground">{value}</p>
                {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon size={20} />
            </span>
        </div>
    </div>
);

const Analytics = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        apiFetch("/analytics")
            .then((result) => setData(result))
            .catch((err) => setError(err.message));
    }, []);

    const statusEntries = Object.entries(data?.requests?.byStatus || {}).sort(
        (a, b) => b[1] - a[1]
    );
    const maxStatus = Math.max(1, ...statusEntries.map(([, count]) => count));
    const trend = data?.trend || [];
    const maxTrend = Math.max(1, ...trend.map((item) => item.count));

    return (
        <>
            <PageHeader
                title="Analytics"
                subtitle="Requests, donations and engagement across the platform."
            />

            <ErrorBanner message={error} />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard icon={Users} label="Users" value={data?.users?.total ?? "—"} />
                <StatCard icon={Droplets} label="Blood requests" value={data?.requests?.total ?? "—"} />
                <StatCard
                    icon={Target}
                    label="Fulfillment rate"
                    value={data ? `${data.requests.fulfillmentRate}%` : "—"}
                />
                <StatCard
                    icon={Activity}
                    label="Donations recorded"
                    value={data?.donations?.count ?? "—"}
                    hint={data ? `${data.donations.units} units collected` : undefined}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Donor responses"
                    value={data?.donorResponses ?? "—"}
                />
                <StatCard
                    icon={CalendarCheck}
                    label="Camp registrations"
                    value={data?.camps?.registrations ?? "—"}
                    hint={data ? `${data.camps.publishedCampaigns} published camps` : undefined}
                />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-base font-extrabold text-foreground">Requests by status</h2>
                    <div className="mt-5 space-y-4">
                        {statusEntries.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No data yet.</p>
                        ) : (
                            statusEntries.map(([status, count]) => (
                                <div key={status}>
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="capitalize text-foreground">
                                            {status.replaceAll("_", " ")}
                                        </span>
                                        <span className="text-muted-foreground">{count}</span>
                                    </div>
                                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{ width: `${(count / maxStatus) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-base font-extrabold text-foreground">Requests over time</h2>
                    {trend.length === 0 ? (
                        <p className="mt-5 text-sm text-muted-foreground">No data yet.</p>
                    ) : (
                        <div className="mt-6 flex h-44 items-end gap-3">
                            {trend.map((item) => (
                                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                                    <div
                                        className="w-full max-w-10 rounded-t-lg bg-primary/80 transition-all"
                                        style={{ height: `${Math.max(8, (item.count / maxTrend) * 130)}px` }}
                                        title={`${item.count} requests`}
                                    />
                                    <span className="text-[10px] font-semibold text-muted-foreground">
                                        {item.month.slice(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-base font-extrabold text-foreground">Export data</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    Download reports as CSV for record-keeping or further analysis.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                    <a
                        href={`${API_BASE}/analytics/export/requests.csv`}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover"
                    >
                        <Download size={16} /> Blood requests
                    </a>
                    <a
                        href={`${API_BASE}/analytics/export/donations.csv`}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
                    >
                        <Download size={16} /> Donations
                    </a>
                </div>
            </section>
        </>
    );
};

const ErrorBanner = ({ message }) =>
    message ? (
        <div role="alert" className="mb-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {message}
        </div>
    ) : null;

export default Analytics;
