import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { apiFetch } from "../utils/api";
import { useAuth } from "../context/useAuth";
import Button from "../ui/Button";

const RequestMessages = ({ requestId, onClose }) => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const bottomRef = useRef(null);

    const load = useCallback(async () => {
        try {
            const data = await apiFetch(`/blood-requests/${requestId}/messages`);
            setItems(data?.items || []);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        // Initial fetch intentionally updates state; interval handles subsequent refreshes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
        const timer = setInterval(load, 10000);
        return () => clearInterval(timer);
    }, [load]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [items.length]);

    const send = async (event) => {
        event.preventDefault();
        if (!body.trim() || sending) return;
        setSending(true);
        setError("");
        try {
            await apiFetch(`/blood-requests/${requestId}/messages`, {
                method: "POST",
                body: { body: body.trim() },
            });
            setBody("");
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-overlay p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                onClick={(event) => event.stopPropagation()}
                className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            >
                <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-4">
                    <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                        <MessageCircle size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-base font-extrabold text-foreground">Request conversation</h2>
                        <p className="text-xs text-muted-foreground">Coordinators and the selected donor</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
                    {loading ? (
                        <div className="flex justify-center py-10 text-muted-foreground">
                            <Loader2 size={20} className="animate-spin" />
                        </div>
                    ) : items.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">
                            No messages yet. Start the conversation.
                        </p>
                    ) : (
                        items.map((item) => {
                            const mine = String(item.sender?._id || item.sender) === String(user?._id);
                            return (
                                <div key={item._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                                            mine
                                                ? "rounded-br-sm bg-primary text-primary-foreground"
                                                : "rounded-bl-sm bg-muted text-foreground"
                                        }`}
                                    >
                                        <p className="mb-1 text-[10px] font-bold opacity-70">
                                            {mine ? "You" : item.sender?.fullName || "Member"}
                                        </p>
                                        <p className="whitespace-pre-wrap break-words leading-relaxed">{item.body}</p>
                                        <p className="mt-1 text-[10px] opacity-60">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {error && (
                    <p role="alert" className="px-5 pb-2 text-xs font-medium text-destructive">{error}</p>
                )}

                <form onSubmit={send} className="flex shrink-0 items-end gap-2 border-t border-border p-4">
                    <textarea
                        rows={2}
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        placeholder="Write a message…"
                        className="input-premium min-h-[3rem] resize-none py-2.5 text-sm"
                    />
                    <Button type="submit" variant="primary" size="icon" disabled={sending || !body.trim()}>
                        {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default RequestMessages;
