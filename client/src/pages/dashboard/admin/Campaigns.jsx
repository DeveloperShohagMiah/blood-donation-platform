import { formatDate } from "../format";
import { useState } from "react";
import { Megaphone, Plus, X } from "lucide-react";
import { apiFetch } from "../../../utils/api";
import { useApiData } from "../hooks";
import {
    EmptyState,
    ErrorBanner,
    PageHeader,
    StatusBadge,
} from "../components/UI";

const emptyForm = {
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    venue: "",
    status: "published",
};

const inputClass =
    "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

const Campaigns = () => {
    const { data, loading, error, reload } = useApiData("/campaigns");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState("");
    const items = data?.items || [];

    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const create = async (event) => {
        event.preventDefault();
        setActionError("");
        setBusy(true);
        try {
            await apiFetch("/campaigns", {
                method: "POST",
                body: {
                    ...form,
                    startAt: form.startAt ? new Date(form.startAt).toISOString() : undefined,
                    endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
                },
            });
            setForm(emptyForm);
            setShowForm(false);
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const changeStatus = async (id, status) => {
        setActionError("");
        try {
            await apiFetch(`/campaigns/${id}`, { method: "PATCH", body: { status } });
            reload();
        } catch (err) {
            setActionError(err.message);
        }
    };

    return (
        <>
            <PageHeader
                title="Campaigns"
                subtitle="Donation drives and community events."
                actions={
                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:brightness-95"
                    >
                        <Plus size={16} /> New campaign
                    </button>
                }
            />
            <ErrorBanner message={error || actionError} />

            {showForm && (
                <form onSubmit={create} className="mb-6 grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
                    <div className="sm:col-span-2 flex items-center justify-between">
                        <h2 className="font-extrabold text-foreground">New campaign</h2>
                        <button type="button" onClick={() => setShowForm(false)} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
                            <X size={18} />
                        </button>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-foreground">Title</label>
                        <input required value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-foreground">Venue</label>
                        <input value={form.venue} onChange={(e) => update("venue", e.target.value)} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-bold text-foreground">Description</label>
                        <textarea required rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-foreground">Starts</label>
                        <input required type="datetime-local" value={form.startAt} onChange={(e) => update("startAt", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-foreground">Ends</label>
                        <input required type="datetime-local" value={form.endAt} onChange={(e) => update("endAt", e.target.value)} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                        <button type="submit" disabled={busy} className="inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-60">
                            {busy ? "Creating…" : "Create campaign"}
                        </button>
                    </div>
                </form>
            )}

            {!loading && !items.length ? (
                <EmptyState icon={Megaphone} title="No campaigns yet" text="Create a campaign to promote an upcoming blood drive." />
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {loading
                        ? [1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl border border-border bg-card" />)
                        : items.map((item) => (
                              <article key={item._id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                  <div className="flex items-start justify-between gap-3">
                                      <div>
                                          <h3 className="font-extrabold text-foreground">{item.title}</h3>
                                          <p className="mt-1 text-sm text-muted-foreground">{item.description || "No description"}</p>
                                      </div>
                                      <StatusBadge value={item.status} />
                                  </div>
                                  <p className="mt-3 text-xs text-muted-foreground">
                                      {formatDate(item.startAt)} {item.venue ? `· ${item.venue}` : ""}
                                  </p>
                                  <div className="mt-4 flex gap-2 border-t border-border pt-4">
                                      <button
                                          type="button"
                                          onClick={() => changeStatus(item._id, item.status === "published" ? "draft" : "published")}
                                          className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-xs font-bold text-foreground transition hover:border-primary hover:text-primary"
                                      >
                                          {item.status === "published" ? "Unpublish" : "Publish"}
                                      </button>
                                  </div>
                              </article>
                          ))}
                </div>
            )}
        </>
    );
};

export default Campaigns;
