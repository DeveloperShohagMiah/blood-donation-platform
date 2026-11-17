const toneClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    info: "bg-sky-500/10 text-sky-600",
    violet: "bg-violet-500/10 text-violet-600",
};

export const StatCard = ({ icon: Icon, label, value, hint, tone = "primary" }) => (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                    {value ?? "—"}
                </p>
                {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
            </div>
            {Icon && (
                <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${toneClasses[tone] || toneClasses.primary}`}>
                    <Icon size={20} />
                </span>
            )}
        </div>
    </div>
);

const statusTones = {
    submitted: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
    pending: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
    pending_verification: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
    verified: "bg-sky-500/10 text-sky-700 ring-sky-500/20",
    approved: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
    matching: "bg-violet-500/10 text-violet-700 ring-violet-500/20",
    in_progress: "bg-indigo-500/10 text-indigo-700 ring-indigo-500/20",
    active: "bg-indigo-500/10 text-indigo-700 ring-indigo-500/20",
    fulfilled: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
    contacted: "bg-sky-500/10 text-sky-700 ring-sky-500/20",
    rejected: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
    cancelled: "bg-slate-500/10 text-slate-600 ring-slate-500/20",
    closed: "bg-slate-500/10 text-slate-600 ring-slate-500/20",
    expired: "bg-slate-500/10 text-slate-600 ring-slate-500/20",
    suspended: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
    available: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
    unavailable: "bg-slate-500/10 text-slate-600 ring-slate-500/20",
};

export const StatusBadge = ({ value }) => {
    const key = String(value || "—").toLowerCase();
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${statusTones[key] || "bg-muted text-muted-foreground ring-border"}`}>
            {key.replaceAll("_", " ")}
        </span>
    );
};

export const PageHeader = ({ title, subtitle, actions }) => (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
);

export const EmptyState = ({ icon: Icon, title, text, action }) => (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
        {Icon && (
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Icon size={26} />
            </span>
        )}
        <h3 className="mt-4 font-bold text-foreground">{title}</h3>
        {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
        {action && <div className="mt-5">{action}</div>}
    </div>
);

export const TableShell = ({ children }) => (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">{children}</table>
    </div>
);

export const Th = ({ children, className = "" }) => (
    <th className={`border-b border-border bg-muted/40 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground ${className}`}>
        {children}
    </th>
);

export const Td = ({ children, className = "" }) => (
    <td className={`border-b border-border px-4 py-3 align-middle text-foreground ${className}`}>
        {children}
    </td>
);

export const ErrorBanner = ({ message }) =>
    message ? (
        <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
        </div>
    ) : null;

export const LoadingRow = ({ cols = 4 }) => (
    <tr>
        {Array.from({ length: cols }).map((_, i) => (
            <Td key={i}>
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </Td>
        ))}
    </tr>
);
