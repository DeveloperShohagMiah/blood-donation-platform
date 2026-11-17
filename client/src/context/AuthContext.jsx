import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, toInternationalPhone } from "../utils/api";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const data = await apiFetch("/auth/me");
            setUser(data?.user ?? null);
            return data?.user ?? null;
        } catch {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await apiFetch("/auth/me");
                if (active) setUser(data?.user ?? null);
            } catch {
                if (active) setUser(null);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const login = useCallback(async ({ identifier, password, remember }, signal) => {
        const data = await apiFetch(
            "/auth/login",
            {
                method: "POST",
                body: {
                    identifier: toInternationalPhone(identifier),
                    password,
                    remember,
                },
                signal,
            }
        );
        setUser(data?.user ?? null);
        return data?.user ?? null;
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiFetch("/auth/logout", { method: "POST" });
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: Boolean(user),
            login,
            logout,
            refresh,
        }),
        [user, loading, login, logout, refresh]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
