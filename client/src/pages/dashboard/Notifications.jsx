import { formatDate } from "./format";
import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { apiFetch } from "../../utils/api";
import { useApiData } from "./hooks";
import {
    EmptyState,
    ErrorBanner,
    PageHeader,
} from "./components/UI";

const Notifications = () => {
    const { data, loading, error, reload } = useApiData("/notifications");
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState("");
    const items = data?.items || [];

    const markOne = async (id) => {
        setActionError("");
        try {
            await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
            reload();
        } catch (err) {
            setActionError(err.message);
        }
    };

    const markAll = async () => {
        setBusy(true);
        setActionError("");
        try {
            await apiFetch("/notifications/read-all", { method: "PATCH" });
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Notifications"
                subtitle="Updates about your requests, profile and assignments."
                actions={
                    items.some((item) => !item.readAt) ? (
                        <button
                            type="button"
                            onClick={markAll}
                            disabled={busy}
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary disabled:opacity-60"
                        >
                            <CheckCheck size={16} /> {busy ? "Updating…" : "Mark all read"}
                        </button>
                    ) : null
                }
            />

            <ErrorBanner message={error || actionError} />

            {!loading && !items.length ? (
                <EmptyState
                    icon={Bell}
                    title="You're all caught up"
                    text="Notifications about your activity will show up here."
                />
            ) : (
                <div className="space-y-3">
                    {loading
                        ? [1, 2, 3].map((i) => (
                              <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-card" />
                          ))
                        : items.map((item) => (
                              <div
                                  key={item._id}
                                  className={`flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
                                      item.readAt ? "border-border" : "border-primary/30"
                                  }`}
                              >
                                  <div className="flex gap-3">
                                      <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${item.readAt ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                                          <Bell size={17} />
                                      </span>
                                      <div>
                                          <p className="font-bold text-foreground">{item.title}</p>
                                          <p className="mt-0.5 text-sm text-muted-foreground">
                                              {item.message}
                                          </p>
                                          <p className="mt-1 text-[11px] text-muted-foreground">
                                              {formatDate(item.createdAt)}
                                          </p>
                                      </div>
                                  </div>
                                  {!item.readAt && (
                                      <button
                                          type="button"
                                          onClick={() => markOne(item._id)}
                                          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-bold text-primary transition hover:border-primary"
                                      >
                                          <CheckCheck size={14} /> Mark read
                                      </button>
                                  )}
                              </div>
                          ))}
                </div>
            )}
        </>
    );
};

export default Notifications;
