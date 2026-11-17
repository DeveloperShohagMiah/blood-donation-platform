import { formatDate } from "../format";
import { useState } from "react";
import { ClipboardList, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../../utils/api";
import { useApiData } from "../hooks";
import {
    EmptyState,
    ErrorBanner,
    PageHeader,
    StatusBadge,
} from "../components/UI";

const AssignedRequests = () => {
    const { data, loading, error, reload } = useApiData("/assignments/me");
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState("");
    const items = data?.items || [];

    const updateStatus = async (id, status) => {
        setActionError("");
        setBusyId(id);
        try {
            await apiFetch(`/assignments/${id}/status`, {
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
                title="My assignments"
                subtitle="Requests assigned to you for coordination and verification."
                actions={
                    <Link
                        to="/dashboard/queue"
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:brightness-95"
                    >
                        <ShieldCheck size={16} /> Verification queue
                    </Link>
                }
            />

            <ErrorBanner message={error || actionError} />

            {!loading && !items.length ? (
                <EmptyState
                    icon={ClipboardList}
                    title="No assignments yet"
                    text="When an admin assigns you a request, it will appear here."
                />
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {loading
                        ? [1, 2].map((i) => (
                              <div key={i} className="h-44 animate-pulse rounded-2xl border border-border bg-card" />
                          ))
                        : items.map((item) => {
                              const request = item.request || {};
                              return (
                                  <article key={item._id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                      <div className="flex items-start justify-between gap-3">
                                          <div className="flex items-center gap-3">
                                              <span className="grid size-12 place-items-center rounded-xl bg-primary text-lg font-extrabold text-white">
                                                  {request.bloodGroup || "?"}
                                              </span>
                                              <div>
                                                  <h3 className="font-extrabold text-foreground">
                                                      {request.hospitalName || "Blood request"}
                                                  </h3>
                                                  <p className="text-xs text-muted-foreground">
                                                      {request.patientName || "—"} · {formatDate(request.createdAt)}
                                                  </p>
                                              </div>
                                          </div>
                                          <StatusBadge value={item.status} />
                                      </div>

                                      <div className="mt-4 flex flex-wrap gap-2">
                                          <StatusBadge value={request.status} />
                                          {request.district?.nameEn && (
                                              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                                                  {request.district.nameEn}
                                              </span>
                                          )}
                                      </div>

                                      {item.status === "active" && (
                                          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                                              <button
                                                  type="button"
                                                  disabled={busyId === item._id}
                                                  onClick={() => updateStatus(item._id, "completed")}
                                                  className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95 disabled:opacity-60"
                                              >
                                                  Mark completed
                                              </button>
                                              <button
                                                  type="button"
                                                  disabled={busyId === item._id}
                                                  onClick={() => updateStatus(item._id, "cancelled")}
                                                  className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-xs font-bold text-muted-foreground transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-60"
                                              >
                                                  Cancel assignment
                                              </button>
                                          </div>
                                      )}
                                  </article>
                              );
                          })}
                </div>
            )}
        </>
    );
};

export default AssignedRequests;
