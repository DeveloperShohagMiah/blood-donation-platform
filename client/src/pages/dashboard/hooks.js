import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";

/** Small helper for read-only dashboard lists. Returns { data, loading, error, reload }. */
export const useApiData = (path) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const result = await apiFetch(path);
                if (active) setData(result);
            } catch (err) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [path, reloadKey]);

    return {
        data,
        loading,
        error,
        reload: () => setReloadKey((key) => key + 1),
    };
};
