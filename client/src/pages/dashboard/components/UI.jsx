import { Children, cloneElement, isValidElement } from "react";
import { Badge } from "@/components/ui/badge";

const toneClasses = {
    primary: "bg-primary/10 text-primary ring-primary/15",
    success: "bg-success/10 text-success ring-success/15",
    warning: "bg-chart-3/10 text-warning ring-warning/15",
    info: "bg-info/10 text-info ring-info/15",
    violet: "bg-violet/10 text-violet ring-violet/15",
};

export const StatCard = ({ icon: Icon, label, value, hint, tone = "primary" }) => (
    <div className="premium-card relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="eyebrow text-[10px]">{label}</p>
                <p className="mt-2 text-[2rem] leading-none font-extrabold tracking-[-0.045em] text-foreground">
                    {value ?? "—"}
                </p>
                {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
            </div>
            {Icon && (
                <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ring-1 ring-inset ${toneClasses[tone] || toneClasses.primary}`}>
                    <Icon size={21} strokeWidth={2.1} />
                </span>
            )}
        </div>
    </div>
);

const statusTones = {
    submitted: "bg-chart-3/10 text-warning ring-warning/20",
    pending: "bg-chart-3/10 text-warning ring-warning/20",
    pending_verification: "bg-chart-3/10 text-warning ring-warning/20",
    verified: "bg-info/10 text-info ring-info/20",
    approved: "bg-success/10 text-success-deep ring-success/20",
    matching: "bg-violet/10 text-violet ring-violet/20",
    in_progress: "bg-indigo/10 text-indigo ring-indigo/20",
    active: "bg-indigo/10 text-indigo ring-indigo/20",
    fulfilled: "bg-success/10 text-success-deep ring-success/20",
    contacted: "bg-info/10 text-info ring-info/20",
    rejected: "bg-destructive/10 text-destructive ring-destructive/20",
    cancelled: "bg-muted-foreground/10 text-muted-foreground ring-muted-foreground/20",
    closed: "bg-muted-foreground/10 text-muted-foreground ring-muted-foreground/20",
    expired: "bg-muted-foreground/10 text-muted-foreground ring-muted-foreground/20",
    suspended: "bg-destructive/10 text-destructive ring-destructive/20",
    available: "bg-success/10 text-success-deep ring-success/20",
    unavailable: "bg-muted-foreground/10 text-muted-foreground ring-muted-foreground/20",
};

export const StatusBadge = ({ value }) => {
    const key = String(value || "—").toLowerCase();
    return (
        <Badge
            variant="secondary"
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${statusTones[key] || "bg-muted text-muted-foreground ring-border"}`}
        >
            {key.replaceAll("_", " ")}
        </Badge>
    );
};

export const PageHeader = ({ title, subtitle, actions }) => (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
            <h1 className="text-[clamp(1.6rem,2.6vw,2.15rem)] leading-tight font-extrabold tracking-[-0.04em] text-foreground">
                {title}
            </h1>
            <span className="mt-2 block h-0.5 w-10 rounded-full bg-gradient-to-r from-primary to-transparent" />
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
);

export const EmptyState = ({ icon: Icon, title, text, action }) => (
    <div className="grid place-items-center rounded-3xl border border-dashed border-primary/25 bg-gradient-to-b from-primary/5 to-transparent px-6 py-14 text-center">
        {Icon && (
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <Icon size={26} />
            </span>
        )}
        <h3 className="mt-4 font-bold text-foreground">{title}</h3>
        {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
        {action && <div className="mt-5">{action}</div>}
    </div>
);

/* --------------------------------------------------------------------------
   Tables
   Header labels are copied onto matching cells so the exact same markup can
   collapse into labelled cards on small screens.
   -------------------------------------------------------------------------- */

const nodeText = (node) => {
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(nodeText).join(" ").trim();
    if (isValidElement(node)) return nodeText(node.props.children);
    return "";
};

const headerLabels = (children) => {
    const labels = [];
    Children.forEach(children, (child) => {
        if (!isValidElement(child)) return;
        if (child.type === "th" || child.type === Th) {
            labels.push(nodeText(child.props.children));
        } else if (child.props.children) {
            labels.push(...headerLabels(child.props.children));
        }
    });
    return labels;
};

const withCellLabels = (children, labels) =>
    Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        if (child.type === "td" || child.type === Td) {
            const label = child.props.colSpan
                ? undefined
                : child.props.label ?? labels[index] ?? "";
            return cloneElement(child, { label });
        }
        if (!child.props.children) return child;
        return cloneElement(child, {}, withCellLabels(child.props.children, labels));
    });

export const TableShell = ({ children, footer, className = "" }) => {
    const labels = headerLabels(children);

    return (
        <div className={`overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${className}`}>
            <div className="overflow-x-auto">
                <table className="bc-table w-full text-left text-sm">
                    {withCellLabels(children, labels)}
                </table>
            </div>
            {footer && <div className="border-t border-border">{footer}</div>}
        </div>
    );
};

export const Th = ({ children, className = "" }) => (
    <th scope="col" className={`px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground ${className}`}>
        {children}
    </th>
);

export const Td = ({ children, className = "", label, ...props }) => (
    <td data-label={label} className={`px-4 py-3.5 align-middle text-foreground ${className}`} {...props}>
        {children}
    </td>
);

const iconButtonTones = {
    default: "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
    danger: "border-destructive/25 bg-card text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive",
    success: "border-success/30 bg-card text-success hover:border-success/40 hover:bg-success-soft hover:text-success-deep",
};

/** Consistent, accessible icon button for table row actions. */
export const IconButton = ({ icon: Icon, label, tone = "default", className = "", disabled, ...props }) => (
    <button
        type="button"
        title={label}
        aria-label={label}
        disabled={disabled}
        className={`inline-grid size-8 shrink-0 place-items-center rounded-lg border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${iconButtonTones[tone] || iconButtonTones.default} ${className}`}
        {...props}
    >
        <Icon size={14} strokeWidth={2} />
    </button>
);

/** Keeps row actions on a single, tidy line instead of wrapping. */
export const ActionGroup = ({ children, className = "" }) => (
    <div className={`table-actions flex items-center justify-end gap-1.5 whitespace-nowrap ${className}`}>
        {children}
    </div>
);

export const ErrorBanner = ({ message }) =>
    message ? (
        <div role="alert" className="mb-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
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
