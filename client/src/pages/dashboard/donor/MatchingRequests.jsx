import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, HeartHandshake, MapPin, Send, X } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { formatDate } from "../format";
import { useApiData } from "../hooks";
import {
    EmptyState,
    ErrorBanner,
    PageHeader,
    StatusBadge,
} from "../components/UI";

const MatchingRequests = () => {
    const { t } = useTranslation();
    const profileQuery = useApiData("/donors/me");
    const requestsQuery = useApiData("/blood-requests/public");
    const [searchParams, setSearchParams] = useSearchParams();
    const [busyId, setBusyId] = useState("");
    const [responded, setResponded] = useState([]);
    const [withdrawnIds, setWithdrawnIds] = useState([]);
    const [localResponses, setLocalResponses] = useState({});
    const [actionError, setActionError] = useState("");

    const focusId = searchParams.get("request");
    const autoRespond = searchParams.get("respond") === "1";
    const autoRespondedRef = useRef(false);
    const targetRef = useRef(null);

    const profile = profileQuery.data?.profile;
    const myGroup = profile?.bloodGroup;
    const all = requestsQuery.data?.items || [];

    const responseStatus = useMemo(() => {
        const map = {};
        all.forEach((item) => {
            map[item._id] = item.hasDonated
                ? "donated"
                : item.myResponse || null;
        });
        Object.entries(localResponses).forEach(([id, status]) => {
            map[id] = status;
        });
        withdrawnIds.forEach((id) => {
            map[id] = "withdrawn";
        });
        return map;
    }, [all, localResponses, withdrawnIds]);

    const respondedIds = useMemo(() => {
        const ids = new Set(responded);
        all.forEach((item) => {
            if (item.hasResponded) ids.add(item._id);
        });
        Object.entries(responseStatus).forEach(([id, status]) => {
            if (["interested", "accepted", "donated"].includes(status)) ids.add(id);
            else ids.delete(id);
        });
        return ids;
    }, [responded, all, responseStatus]);

    // A deep link keeps the chosen request visible even if its group differs.
    const matches = myGroup
        ? all.filter((item) => item.bloodGroup === myGroup || item._id === focusId)
        : all;

    const unavailable = !profile || profile.availability !== "available";

    const respond = async (id, response = "interested") => {
        setActionError("");
        setBusyId(id);
        try {
            await apiFetch(`/blood-requests/${id}/responses`, {
                method: "POST",
                body: { response },
            });
            setResponded((current) =>
                response === "withdrawn"
                    ? current.filter((value) => value !== id)
                    : [...new Set([...current, id])]
            );
            setWithdrawnIds((current) =>
                response === "withdrawn"
                    ? [...new Set([...current, id])]
                    : current.filter((value) => value !== id)
            );
            setLocalResponses((current) => ({
                ...current,
                [id]: response === "withdrawn" ? "withdrawn" : "interested",
            }));
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId("");
        }
    };

    const withdraw = (id) => respond(id, "withdrawn");

    // Arriving from "I can donate" after login: complete that single response,
    // then drop the auto flag while keeping the request highlighted.
    useEffect(() => {
        if (
            !autoRespond ||
            !focusId ||
            autoRespondedRef.current ||
            profileQuery.loading ||
            requestsQuery.loading
        )
            return;
        autoRespondedRef.current = true;

        const needsResponse = !respondedIds.has(focusId) && !unavailable;
        setSearchParams(
            (previous) => {
                const next = new URLSearchParams(previous);
                next.delete("respond");
                return next;
            },
            { replace: true }
        );

        if (needsResponse) queueMicrotask(() => void respond(focusId));
    }, [
        autoRespond,
        focusId,
        profileQuery.loading,
        requestsQuery.loading,
        respondedIds,
        unavailable,
        respond,
        setSearchParams,
    ]);

    useEffect(() => {
        if (focusId && !requestsQuery.loading) {
            targetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [focusId, requestsQuery.loading]);

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
                message={actionError || requestsQuery.error || profileQuery.error}
            />

            {unavailable && (
                <div className="mb-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                    Set your profile to <strong>{t("text.Available", "Available")}</strong> before responding to requests.{" "}
                    <Link to="/dashboard/profile" className="font-bold underline">
                        {t("text.Update profile", "Update profile")}
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
                              const done = respondedIds.has(item._id);
                              const status = responseStatus[item._id] || null;
                              const focused = item._id === focusId;
                              return (
                                  <article
                                      key={item._id}
                                      ref={focused ? targetRef : null}
                                      className={`rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md ${
                                          focused
                                              ? "border-primary ring-2 ring-primary/20"
                                              : "border-border"
                                      }`}
                                  >
                                      <div className="flex items-start justify-between gap-3">
                                          <div className="flex items-center gap-3">
                                              <span className="grid size-12 place-items-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground shadow-md shadow-primary/25">
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
                                              className={`inline-flex h-10 flex-1 items-center justify-center gap-2 px-4 text-sm font-bold disabled:cursor-not-allowed ${
                                                  done
                                                      ? "rounded-xl bg-success/15 text-success-deep ring-1 ring-success/30"
                                                      : "btn-premium"
                                              }`}
                                          >
                                              {done ? (
                                                  <>
                                                      <CheckCircle2 size={16} />
                                                      {status === "donated"
                                                          ? "Donation confirmed"
                                                          : status === "accepted"
                                                            ? "You're selected"
                                                            : t("text.Responded", "Responded")}
                                                  </>
                                              ) : (
                                                  <><Send size={15} /> {busyId === item._id ? t("text.Sending_DOT__DOT__DOT_", "Sending...") : t("text.I can donate", "I can donate")}</>
                                              )}
                                          </button>
                                          {status === "interested" && (
                                              <button
                                                  type="button"
                                                  disabled={busyId === item._id}
                                                  onClick={() => withdraw(item._id)}
                                                  className="grid size-10 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-destructive hover:text-destructive disabled:opacity-60"
                                                  aria-label={t("text.Withdraw offer", "Can't donate anymore?")}
                                                  title={t("text.Withdraw offer", "Can't donate anymore?")}
                                              >
                                                  <X size={16} />
                                              </button>
                                          )}
                                          <a href={`tel:${item.contactPhone}`}
                                              className="grid size-10 place-items-center rounded-xl border border-border text-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                                              aria-label={t("text.Call requester", "Call requester")}
                                          >
                                              <HeartHandshake size={17} />
                                          </a>
                                      </div>

                                      {status && (
                                          <p
                                              className={`mt-3 text-xs font-semibold ${
                                                  status === "declined" || status === "withdrawn"
                                                      ? "text-muted-foreground"
                                                      : "text-success-deep"
                                              }`}
                                          >
                                              {status === "interested"
                                                  ? "Offer sent — a coordinator will review it shortly."
                                                  : status === "accepted"
                                                    ? "You've been selected! A volunteer will contact you soon."
                                                    : status === "donated"
                                                      ? "Your donation has been recorded. Thank you!"
                                                      : status === "declined"
                                                        ? "Your offer wasn't selected this time. Thank you for being ready to help."
                                                        : "You withdrew this offer."}
                                          </p>
                                      )}
                                  </article>
                              );
                          })}
                </div>
            )}
        </>
    );
};

export default MatchingRequests;
