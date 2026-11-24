import { Link } from "react-router-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const VARIANTS = {
    primary: "btn-premium",
    secondary: "btn btn-secondary",
    outline: "btn btn-outline",
    destructive: "btn btn-destructive",
    ghost: "btn bg-transparent text-foreground hover:bg-muted",
    subtle: "btn bg-muted text-foreground hover:bg-muted/70",
    link: "btn h-auto bg-transparent p-0 text-primary underline-offset-4 hover:underline",
};

const SIZES = {
    sm: "min-h-9 px-3.5 text-[13px]",
    md: "min-h-11 px-5 text-sm",
    lg: "min-h-12 px-6 text-sm",
    xl: "min-h-[3.4rem] px-6 text-sm",
    icon: "size-10 p-0",
};

/**
 * Shared button used across the app.
 *
 * variant: primary | secondary | outline | destructive | ghost | subtle | link
 * size: sm | md | lg | xl | icon
 * `to` renders a react-router Link, `href` renders an anchor,
 * otherwise a native <button> is used.
 */
const Button = ({
    variant = "primary",
    size = "md",
    to,
    href,
    type = "button",
    className = "",
    children,
    ...props
}) => {
    const Component = to ? Link : href ? "a" : "button";

    return (
        <Component
            {...(to ? { to } : {})}
            {...(href ? { href } : {})}
            {...(!to && !href ? { type } : {})}
            className={cn(VARIANTS[variant], SIZES[size], className)}
            {...props}
        >
            {children}
        </Component>
    );
};

export default Button;
