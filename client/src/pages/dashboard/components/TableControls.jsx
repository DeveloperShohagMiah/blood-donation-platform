import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Select from "../../../components/Select";

export function TableToolbar({ controls, searchPlaceholder = "Search…" }) {
    const isFiltered =
        Boolean(controls.query) || Object.values(controls.filters).some(Boolean);

    return (
        <div className="mb-4 grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative w-full sm:w-56 lg:w-64">
                    <Search
                        size={15}
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        type="search"
                        value={controls.query}
                        onChange={(event) => controls.setQuery(event.target.value)}
                        placeholder={searchPlaceholder}
                        aria-label={searchPlaceholder}
                        className="h-9 w-full rounded-xl border border-border bg-background pr-3 pl-9 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                </label>

                {controls.filterDefs.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {controls.filterDefs.map((definition) => (
                            <Select
                                key={definition.key}
                                size="sm"
                                value={controls.filters[definition.key] ?? ""}
                                onChange={(event) =>
                                    controls.setFilter(definition.key, event.target.value)
                                }
                                aria-label={definition.label}
                                className="w-full min-w-[8.5rem] sm:w-32 lg:w-36"
                            >
                                <option value="">{definition.label}</option>
                                {definition.options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-3 lg:justify-end">
                <span className="text-xs font-semibold text-muted-foreground">
                    {controls.total} {controls.total === 1 ? "result" : "results"}
                </span>
                {isFiltered && (
                    <button
                        type="button"
                        onClick={controls.reset}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}

const pageList = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

    const pages = [1];
    if (current > 3) pages.push("…");
    const from = Math.max(2, current - 1);
    const to = Math.min(total - 1, current + 1);
    for (let page = from; page <= to; page += 1) pages.push(page);
    if (current < total - 2) pages.push("…");
    pages.push(total);
    return pages;
};

export function TablePagination({ controls }) {
    return (
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
                Showing{" "}
                <strong className="font-bold text-foreground">{controls.from}</strong>–
                <strong className="font-bold text-foreground">{controls.to}</strong> of{" "}
                <strong className="font-bold text-foreground">{controls.total}</strong>
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    Rows
                    <Select
                        size="sm"
                        className="w-16"
                        value={controls.pageSize}
                        onChange={(event) => controls.setPageSize(event.target.value)}
                        aria-label="Rows per page"
                    >
                        {[5, 8, 10, 20, 50].map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </Select>
                </label>

                <nav className="flex items-center gap-1" aria-label="Pagination">
                    <button
                        type="button"
                        aria-label="Previous page"
                        disabled={controls.page === 1}
                        onClick={() => controls.setPage(controls.page - 1)}
                        className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft size={15} />
                    </button>

                    {pageList(controls.page, controls.pageCount).map((value, index) =>
                        value === "…" ? (
                            <span key={`gap-${index}`} className="px-1 text-xs text-muted-foreground">
                                …
                            </span>
                        ) : (
                            <button
                                key={value}
                                type="button"
                                aria-current={value === controls.page ? "page" : undefined}
                                onClick={() => controls.setPage(value)}
                                className={`grid size-8 place-items-center rounded-lg border text-xs font-bold transition ${
                                    value === controls.page
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                                }`}
                            >
                                {value}
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        aria-label="Next page"
                        disabled={controls.page === controls.pageCount}
                        onClick={() => controls.setPage(controls.page + 1)}
                        className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight size={15} />
                    </button>
                </nav>
            </div>
        </div>
    );
}
