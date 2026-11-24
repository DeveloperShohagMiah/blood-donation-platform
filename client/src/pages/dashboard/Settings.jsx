import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { PageHeader } from "./components/UI";

const MODE_OPTIONS = [
    {
        value: "light",
        label: "Light",
        hint: "Bright and clear",
        icon: Sun,
    },
    {
        value: "dark",
        label: "Dark",
        hint: "Easy on the eyes",
        icon: Moon,
    },
    {
        value: "system",
        label: "System",
        hint: "Follow your device",
        icon: Monitor,
    },
];

const ACCENT_OPTIONS = [
    { value: "original", label: "Original", swatch: "linear-gradient(135deg,#f37820,#0791d5)" },
    { value: "blue", label: "Ocean", swatch: "#2563eb" },
    { value: "violet", label: "Violet", swatch: "#7c3aed" },
    { value: "emerald", label: "Emerald", swatch: "#059669" },
    { value: "rose", label: "Rose", swatch: "#e11d48" },
];

const Settings = () => {
    const { mode, accent, setMode, setAccent } = useTheme();

    return (
        <>
            <PageHeader
                title="Settings"
                subtitle="Personalise how Blood Connect looks and feels."
            />

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Palette size={19} />
                    </span>
                    <div>
                        <h2 className="text-lg font-extrabold text-foreground">Appearance</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Your choices are saved on this device.
                        </p>
                    </div>
                </div>

                <h3 className="mt-7 text-sm font-bold text-foreground">Theme mode</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {MODE_OPTIONS.map(({ value, label, hint, icon: Icon }) => {
                        const active = mode === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setMode(value)}
                                aria-pressed={active}
                                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                                    active
                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                        : "border-border hover:border-primary/40"
                                }`}
                            >
                                <span
                                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                                        active
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    <Icon size={19} />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-bold text-foreground">
                                        {label}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        {hint}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                <h3 className="mt-8 text-sm font-bold text-foreground">Accent colour</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                    Applied to buttons, links, badges and active states.
                </p>
                <div className="mt-4 flex flex-wrap gap-4">
                    {ACCENT_OPTIONS.map(({ value, label, swatch }) => {
                        const active = accent === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setAccent(value)}
                                aria-pressed={active}
                                className="flex flex-col items-center gap-2"
                            >
                                <span
                                    className={`grid size-11 place-items-center rounded-full ring-offset-2 ring-offset-card transition ${
                                        active ? "ring-2 ring-primary" : "ring-1 ring-border"
                                    }`}
                                >
                                    <span
                                        className="size-8 rounded-full"
                                        style={{ background: swatch }}
                                    />
                                </span>
                                <span
                                    className={`text-xs font-semibold ${
                                        active ? "text-primary" : "text-muted-foreground"
                                    }`}
                                >
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>
        </>
    );
};

export default Settings;
