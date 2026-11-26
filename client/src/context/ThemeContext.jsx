/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

const MODE_KEY = "bc:theme";
const ACCENT_KEY = "bc:accent";

const MODES = ["light", "dark", "system"];
const ACCENTS = ["original", "blue", "violet", "emerald", "rose"];

const ACCENT_VARS = [
    "--primary",
    "--primary-hover",
    "--ring",
    "--brand-light",
    "--brand-vivid",
    "--brand-deep",
    "--sidebar-primary",
    "--sidebar-ring",
    "--chart-1",
];

/* Accent palettes that used to live in index.css as [data-accent] rules.
   They now set the same Tailwind theme tokens as inline CSS variables. */
const ACCENT_TOKENS = {
    original: {},
    blue: {
        light: {
            "--primary": "#2563eb",
            "--primary-hover": "#1d4ed8",
            "--ring": "#2563eb",
            "--brand-light": "#93c5fd",
            "--brand-vivid": "#3b82f6",
            "--brand-deep": "#1e3a8a",
            "--sidebar-primary": "#2563eb",
            "--sidebar-ring": "#2563eb",
            "--chart-1": "#3b82f6",
        },
        dark: {
            "--primary": "#3b82f6",
            "--primary-hover": "#60a5fa",
            "--ring": "#60a5fa",
            "--brand-light": "#93c5fd",
            "--brand-vivid": "#3b82f6",
            "--brand-deep": "#1e40af",
            "--sidebar-primary": "#3b82f6",
            "--sidebar-ring": "#60a5fa",
            "--chart-1": "#60a5fa",
        },
    },
    violet: {
        light: {
            "--primary": "#7c3aed",
            "--primary-hover": "#6d28d9",
            "--ring": "#7c3aed",
            "--brand-light": "#c4b5fd",
            "--brand-vivid": "#8b5cf6",
            "--brand-deep": "#4c1d95",
            "--sidebar-primary": "#7c3aed",
            "--sidebar-ring": "#7c3aed",
            "--chart-1": "#8b5cf6",
        },
        dark: {
            "--primary": "#a78bfa",
            "--primary-hover": "#c4b5fd",
            "--ring": "#c4b5fd",
            "--brand-light": "#c4b5fd",
            "--brand-vivid": "#8b5cf6",
            "--brand-deep": "#5b21b6",
            "--sidebar-primary": "#a78bfa",
            "--sidebar-ring": "#c4b5fd",
            "--chart-1": "#a78bfa",
        },
    },
    emerald: {
        light: {
            "--primary": "#059669",
            "--primary-hover": "#047857",
            "--ring": "#059669",
            "--brand-light": "#6ee7b7",
            "--brand-vivid": "#10b981",
            "--brand-deep": "#064e3b",
            "--sidebar-primary": "#059669",
            "--sidebar-ring": "#059669",
            "--chart-1": "#10b981",
        },
        dark: {
            "--primary": "#34d399",
            "--primary-hover": "#6ee7b7",
            "--ring": "#6ee7b7",
            "--brand-light": "#6ee7b7",
            "--brand-vivid": "#10b981",
            "--brand-deep": "#065f46",
            "--sidebar-primary": "#34d399",
            "--sidebar-ring": "#6ee7b7",
            "--chart-1": "#34d399",
        },
    },
    rose: {
        light: {
            "--primary": "#e11d48",
            "--primary-hover": "#be123c",
            "--ring": "#e11d48",
            "--brand-light": "#fda4af",
            "--brand-vivid": "#f43f5e",
            "--brand-deep": "#881337",
            "--sidebar-primary": "#e11d48",
            "--sidebar-ring": "#e11d48",
            "--chart-1": "#f43f5e",
        },
        dark: {
            "--primary": "#fb7185",
            "--primary-hover": "#fda4af",
            "--ring": "#fda4af",
            "--brand-light": "#fda4af",
            "--brand-vivid": "#f43f5e",
            "--brand-deep": "#9f1239",
            "--sidebar-primary": "#fb7185",
            "--sidebar-ring": "#fda4af",
            "--chart-1": "#fb7185",
        },
    },
};

/* Tailwind utilities used in place of the old global `.theme-transition` CSS. */
const TRANSITION_CLASSES = [
    "transition-[background-color,border-color,color,fill,stroke,box-shadow,transform]",
    "duration-500",
    "ease-[var(--ease-premium)]",
    "[&_*]:transition-[background-color,border-color,color,fill,stroke,box-shadow,transform]",
    "[&_*]:duration-500",
    "[&_*]:ease-[var(--ease-premium)]",
];

const ThemeContext = createContext(null);

const read = (key, allowed, fallback) => {
    try {
        const value = localStorage.getItem(key);
        return allowed.includes(value) ? value : fallback;
    } catch {
        return fallback;
    }
};

const write = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Storage can be blocked; the selection still applies this session.
    }
};

const prefersDark = () =>
    typeof window !== "undefined" &&
    Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches);

const resolveMode = (mode) => (mode === "system" ? (prefersDark() ? "dark" : "light") : mode);

const applyAccent = (accent, resolved) => {
    const root = document.documentElement;
    ACCENT_VARS.forEach((name) => root.style.removeProperty(name));
    const tokens = ACCENT_TOKENS[accent]?.[resolved === "dark" ? "dark" : "light"];
    if (!tokens) return;
    Object.entries(tokens).forEach(([name, value]) => root.style.setProperty(name, value));
};

export const ThemeProvider = ({ children }) => {
    const [mode, setModeState] = useState(() => read(MODE_KEY, MODES, "system"));
    const [accent, setAccentState] = useState(() => read(ACCENT_KEY, ACCENTS, "original"));
    const [resolved, setResolved] = useState(() => resolveMode(read(MODE_KEY, MODES, "system")));
    const timerRef = useRef(null);
    const modeRef = useRef(mode);
    const accentRef = useRef(accent);

    useEffect(() => {
        modeRef.current = mode;
        accentRef.current = accent;
    }, [mode, accent]);

    const apply = useCallback((nextMode, nextAccent, animate = true) => {
        const root = document.documentElement;
        const nextResolved = resolveMode(nextMode);

        if (animate && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            root.classList.add(...TRANSITION_CLASSES);
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                root.classList.remove(...TRANSITION_CLASSES);
            }, 520);
        }

        root.classList.toggle("dark", nextResolved === "dark");
        root.style.colorScheme = nextResolved;
        root.dataset.accent = nextAccent;
        applyAccent(nextAccent, nextResolved);
        document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute("content", nextResolved === "dark" ? "#0b1921" : "#f37820");
        setResolved(nextResolved);
    }, []);

    // Apply the saved theme on first mount.
    useEffect(() => {
        // One-time hydration of the DOM from persisted preferences.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        apply(mode, accent, false);
        return () => window.clearTimeout(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Follow OS changes while in "system" mode.
    useEffect(() => {
        if (mode !== "system") return undefined;
        const query = window.matchMedia?.("(prefers-color-scheme: dark)");
        if (!query) return undefined;
        const onChange = () => apply("system", accentRef.current);
        query.addEventListener?.("change", onChange);
        return () => query.removeEventListener?.("change", onChange);
    }, [mode, accent, apply]);

    const setMode = useCallback(
        (next) => {
            if (!MODES.includes(next)) return;
            setModeState(next);
            write(MODE_KEY, next);
            apply(next, accentRef.current);
        },
        [apply]
    );

    const setAccent = useCallback(
        (next) => {
            if (!ACCENTS.includes(next)) return;
            setAccentState(next);
            write(ACCENT_KEY, next);
            apply(modeRef.current, next);
        },
        [apply]
    );

    const toggle = useCallback(
        () => setMode(resolved === "dark" ? "light" : "dark"),
        [resolved, setMode]
    );

    const value = useMemo(
        () => ({ mode, resolved, accent, setMode, setAccent, toggle, MODES, ACCENTS }),
        [mode, resolved, accent, setMode, setAccent, toggle]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used inside ThemeProvider");
    return context;
};
