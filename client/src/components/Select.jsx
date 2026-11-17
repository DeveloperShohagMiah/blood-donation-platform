import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

/** Premium native select with a themed shell, focus ring and custom caret. */
const Select = forwardRef(
    ({ children, className = "", size = "default", invalid, disabled, ...props }, ref) => {
        const heights = {
            sm: "h-8 text-xs rounded-lg pr-8",
            default: "h-11 text-sm pr-10",
            lg: "h-12 text-sm pr-10",
        };

        return (
            <div className={`relative ${className}`}>
                <select
                    ref={ref}
                    disabled={disabled}
                    aria-invalid={invalid || undefined}
                    {...props}
                    className={[
                        "peer w-full cursor-pointer appearance-none rounded-xl border bg-background font-medium text-foreground outline-none transition duration-200",
                        "focus:border-primary focus:ring-4 focus:ring-primary/10",
                        "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
                        invalid ? "border-rose-400" : "border-border hover:border-primary/40",
                        heights[size] || heights.default,
                    ].join(" ")}
                >
                    {children}
                </select>
                <ChevronDown
                    size={size === "sm" ? 14 : 16}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-primary"
                />
            </div>
        );
    }
);

Select.displayName = "Select";

export default Select;
