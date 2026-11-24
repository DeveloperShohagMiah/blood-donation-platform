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

export const ThemeProvider = ({ children }) => {
    const [mode, setModeState] = useState(() => read(MODE_KEY, MODES, "system"));
    const [accent, setAccentState] = useState(() => read(ACCENT_KEY, ACCENTS, "original"));
    const [resolved, setResolved] = useState(() => resolveMode(read(MODE_KEY, MODES, "system")));
    const timerRef = useRef(null);
    const modeRef = useRef(mode);
    const accentRef = useRef(accent);
    modeRef.current = mode;
    accentRef.current = accent;

    const apply = useCallback((nextMode, nextAccent, animate = true) => {
        const root = document.documentElement;
        const nextResolved = resolveMode(nextMode);

        if (animate && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            root.classList.add("theme-transition");
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                root.classList.remove("theme-transition");
            }, 460);
        }

        root.classList.toggle("dark", nextResolved === "dark");
        root.style.colorScheme = nextResolved;
        root.dataset.accent = nextAccent;
        document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute("content", nextResolved === "dark" ? "#0b1921" : "#f37820");
        setResolved(nextResolved);
    }, []);

    // Apply the saved theme on first mount.
    useEffect(() => {
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
