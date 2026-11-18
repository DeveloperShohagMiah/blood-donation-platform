import { useMemo, useState } from "react";

const getField = (item, field) => {
    if (typeof field === "function") return field(item);
    return String(field)
        .split(".")
        .reduce((value, key) => value?.[key], item);
};

const initialFilters = (definitions) =>
    Object.fromEntries(definitions.map((definition) => [definition.key, definition.defaultValue ?? ""]));

/**
 * Search, filter and pagination state shared by every dashboard table.
 *
 * options:
 *   searchFields: string[] | ((item) => unknown)[]   fields included in the text search
 *   filters:      { key, label, options, defaultValue?, match? }[]
 *   pageSize:     number
 */
export function useTableControls(items = [], options = {}) {
    const { searchFields = [], filters: filterDefinitions = [], pageSize = 8 } = options;

    const [query, setQueryState] = useState("");
    const [filterValues, setFilterValues] = useState(() => initialFilters(filterDefinitions));
    const [page, setPageState] = useState(1);
    const [size, setSizeState] = useState(pageSize);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        return items.filter((item) => {
            if (term) {
                const matches = searchFields.some((field) => {
                    const value = getField(item, field);
                    return value != null && String(value).toLowerCase().includes(term);
                });
                if (!matches) return false;
            }

            return filterDefinitions.every((definition) => {
                const selected = filterValues[definition.key];
                if (selected === "" || selected == null) return true;
                if (definition.match) return definition.match(item, selected);
                return String(getField(item, definition.key) ?? "") === String(selected);
            });
        });
    }, [items, query, filterValues, searchFields, filterDefinitions]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / size));
    const currentPage = Math.min(page, pageCount);
    const start = (currentPage - 1) * size;

    const rows = useMemo(
        () => filtered.slice(start, start + size),
        [filtered, start, size]
    );

    const setQuery = (value) => {
        setQueryState(value);
        setPageState(1);
    };

    const setFilter = (key, value) => {
        setFilterValues((previous) => ({ ...previous, [key]: value }));
        setPageState(1);
    };

    const setPage = (value) => setPageState(Math.min(Math.max(1, value), pageCount));

    const setPageSize = (value) => {
        setSizeState(Number(value));
        setPageState(1);
    };

    const reset = () => {
        setQueryState("");
        setFilterValues(initialFilters(filterDefinitions));
        setPageState(1);
    };

    return {
        query,
        setQuery,
        filters: filterValues,
        filterDefs: filterDefinitions,
        setFilter,
        page: currentPage,
        setPage,
        pageSize: size,
        setPageSize,
        rows,
        total: filtered.length,
        pageCount,
        from: filtered.length ? start + 1 : 0,
        to: Math.min(start + size, filtered.length),
        reset,
    };
}
