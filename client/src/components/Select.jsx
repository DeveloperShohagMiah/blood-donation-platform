import {
    Children,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import "./Select.css";

/** Modern dropdown component. Design lives in Select.css; this handles behavior. */
const Select = forwardRef(
    (
        {
            children,
            value,
            defaultValue,
            onChange,
            onBlur,
            className = "",
            size = "default",
            invalid,
            disabled,
            name,
            id,
            ...props
        },
        forwardedRef
    ) => {
        const nativeRef = useRef(null);
        const rootRef = useRef(null);
        const buttonRef = useRef(null);
        const panelRef = useRef(null);
        useImperativeHandle(forwardedRef, () => nativeRef.current, []);

        const options = Children.toArray(children).map((child, index) => ({
            key: `${String(child.props?.value ?? "")}-${index}`,
            value: String(child.props?.value ?? ""),
            label: child.props?.children ?? "",
            disabled: Boolean(child.props?.disabled),
        }));

        const current = value !== undefined ? String(value) : undefined;
        const [localValue, setLocalValue] = useState(
            () => String(value ?? defaultValue ?? "")
        );
        const selected = current ?? localValue;
        const selectedOption = options.find((option) => option.value === selected);

        const [open, setOpen] = useState(false);
        const [active, setActive] = useState(0);
        const [position, setPosition] = useState({
            top: 0,
            left: 0,
            width: 0,
            above: false,
        });

        const updatePosition = () => {
            const rect = buttonRef.current?.getBoundingClientRect();
            if (!rect) return;

            const spaceBelow = window.innerHeight - rect.bottom;
            const above = spaceBelow < 240 && rect.top > 240;

            setPosition({
                top: above ? rect.top - 6 : rect.bottom + 6,
                left: rect.left,
                width: rect.width,
                above,
            });
        };

        const choose = (option) => {
            const native = nativeRef.current;
            if (!native || option.disabled) return;

            native.value = option.value;
            native.dispatchEvent(new Event("change", { bubbles: true }));
            setLocalValue(option.value);
            setOpen(false);
        };

        useEffect(() => {
            if (!open) return undefined;

            const onPointerDown = (event) => {
                if (
                    rootRef.current?.contains(event.target) ||
                    panelRef.current?.contains(event.target)
                ) {
                    return;
                }
                setOpen(false);
                onBlur?.({ target: nativeRef.current });
            };

            const onKeyDown = (event) => {
                if (event.key === "Escape") {
                    setOpen(false);
                } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActive((index) => Math.min(index + 1, options.length - 1));
                } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActive((index) => Math.max(index - 1, 0));
                } else if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    const option = options[active];
                    if (option && !option.disabled) choose(option);
                }
            };

            document.addEventListener("pointerdown", onPointerDown);
            document.addEventListener("keydown", onKeyDown);
            window.addEventListener("scroll", updatePosition, true);
            window.addEventListener("resize", updatePosition);

            return () => {
                document.removeEventListener("pointerdown", onPointerDown);
                document.removeEventListener("keydown", onKeyDown);
                window.removeEventListener("scroll", updatePosition, true);
                window.removeEventListener("resize", updatePosition);
            };
        }, [open, active, options, onBlur]);

        const openMenu = () => {
            if (disabled) return;
            const index = options.findIndex((option) => option.value === selected);
            setActive(index >= 0 ? index : 0);
            updatePosition();
            setOpen((previous) => !previous);
        };

        const triggerClass = [
            "bc-select__trigger",
            `size-${size}`,
            open ? "is-open" : "",
            invalid ? "is-invalid" : "",
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <div ref={rootRef} className={`bc-select ${className}`}>
                <select
                    ref={nativeRef}
                    name={name}
                    id={id}
                    value={current}
                    defaultValue={current === undefined ? defaultValue : undefined}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    aria-invalid={invalid || undefined}
                    {...props}
                    className="bc-select__native"
                    tabIndex={-1}
                >
                    {children}
                </select>

                <button
                    ref={buttonRef}
                    type="button"
                    onClick={openMenu}
                    onKeyDown={(event) => {
                        if (
                            event.key === "ArrowDown" ||
                            event.key === "Enter" ||
                            event.key === " "
                        ) {
                            event.preventDefault();
                            if (!open) openMenu();
                        }
                    }}
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    className={triggerClass}
                >
                    <span
                        className={`bc-select__value ${selectedOption ? "" : "is-placeholder"}`}
                    >
                        {selectedOption ? selectedOption.label : "Select…"}
                    </span>
                    <ChevronDown
                        size={size === "sm" ? 14 : 16}
                        aria-hidden="true"
                        className={`bc-select__chevron ${open ? "is-open" : ""}`}
                    />
                </button>

                {open &&
                    createPortal(
                        <div
                            style={{
                                position: "fixed",
                                top: position.top,
                                left: position.left,
                                width: position.width,
                                transform: position.above ? "translateY(-100%)" : undefined,
                                zIndex: 9999,
                            }}
                        >
                            <div
                                ref={panelRef}
                                role="listbox"
                                className="bc-select__panel"
                            >
                                {options.map((option, index) => {
                                    const isSelected = option.value === selected;
                                    const optionClass = [
                                        "bc-select__option",
                                        index === active ? "is-active" : "",
                                        isSelected ? "is-selected" : "",
                                        option.disabled ? "is-disabled" : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ");

                                    return (
                                        <button
                                            key={option.key}
                                            type="button"
                                            role="option"
                                            aria-selected={isSelected}
                                            disabled={option.disabled}
                                            onMouseEnter={() => setActive(index)}
                                            onClick={() => choose(option)}
                                            className={optionClass}
                                        >
                                            <span className="bc-select__option-label">
                                                {option.label}
                                            </span>
                                            {isSelected && (
                                                <Check size={15} className="bc-select__check" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>,
                        document.body
                    )}
            </div>
        );
    }
);

Select.displayName = "Select";

export default Select;
