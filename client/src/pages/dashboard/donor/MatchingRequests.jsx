import { formatDate } from "../format";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, HeartHandshake, MapPin, Send } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { useApiData } from "../hooks";
import {
    EmptyState,
    ErrorBanner,
    PageHeader,
    StatusBadge,
} from "../components/UI";

const MatchingRequests = () => {
    const profileQuery = useApiData("/donors/me");
    const requestsQuery = useApiData("/blood-requests/public");
    const [busyId, setBusyId] = useState("");
    const [responded, setResponded] = useState([]);
    const [actionError, setActionError] = useState("");

    const profile = profileQuery.data?.profile;
    const myGroup = profile?.bloodGroup;
    const all = requestsQuery.data?.items || [];
    const matches = myGroup ? all.filter((item) => item.bloodGroup === myGroup) : all;

    const respond = async (id) => {
        setActionError("");
        setBusyId(id);
        try {
            await apiFetch(`/blood-requests/${id}/responses`, {
                method: "POST",
                body: { response: "interested" },
            });
            setResponded((current) => [...current, id]);
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    const unavailable = !profile || profile.availability !== "available";

    return (
        <>
            <PageHeader
                title="Matching requests"
                subtitle={
                    myGroup
                        ? `Verified requests looking for ${myGroup} donors.`
                        : "Verified requests looking for donors."
                }
            />

            <ErrorBanner
                message={
                    actionError ||
                    requestsQuery.error ||
                    profileQuery.error
                }
            />

            {unavailable && (
                <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Set your profile to <strong>Available</strong> before responding to requests.{" "}
                    <Link to="/dashboard/profile" className="font-bold underline">
                        Update profile
                    </Link>
                </div>
            )}

            {!requestsQuery.loading && !matches.length ? (
                <EmptyState
                    icon={HeartHandshake}
                    title="No matching requests right now"
                    text="New verified requests will appear here as soon as they are published."
                />
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {requestsQuery.loading
                        ? [1, 2].map((i) => (
                              <div key={i} className="h-44 animate-pulse rounded-2xl border border-border bg-card" />
                          ))
                        : matches.map((item) => {
                              const done = responded.includes(item._id);
                              return (
                                  <article
                                      key={item._id}
                                      className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                                  >
                                      <div className="flex items-start justify-between gap-3">
                                          <div className="flex items-center gap-3">
                                              <span className="grid size-12 place-items-center rounded-xl bg-primary text-lg font-extrabold text-white shadow-md shadow-primary/25">
                                                  {item.bloodGroup}
                                              </span>
                                              <div>
                                                  <h3 className="font-extrabold text-foreground">
                                                      {item.hospitalName}
                                                  </h3>
                                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                                      {formatDate(item.createdAt)} · {item.units} unit{item.units > 1 ? "s" : ""}
                                                  </p>
                                              </div>
                                          </div>
                                          <StatusBadge value={item.status} />
                                      </div>

                                      <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                                          <p className="font-semibold text-foreground">
                                              Patient: {item.patientName}
                                          </p>
                                          <p className="flex items-center gap-1.5">
                                              <MapPin size={14} /> {item.district?.nameEn || "Location not set"}
                                          </p>
                                      </div>

                                      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                                          <button
                                              type="button"
                                              disabled={done || busyId === item._id || unavailable}
                                              onClick={() => respond(item._id)}
                                              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                              {done ? (
                                                  <><CheckCircle2 size={16} /> Responded</>
                                              ) : (
                                                  <><Send size={15} /> {busyId === item._id ? "Sending…" : "I can help"}</>
                                              )}
                                          </button>
                                          <a
                                              href={`tel:${item.contactPhone}`}
                                              className="grid size-10 place-items-center rounded-xl border border-border text-foreground transition hover:border-primary hover:text-primary"
                                              aria-label="Call requester"
                                          >
                                              <HeartHandshake size={17} />
                                          </a>
                                      </div>
                                  </article>
                              );
                          })}
                </div>
            )}
        </>
    );
};

export default MatchingRequests;
