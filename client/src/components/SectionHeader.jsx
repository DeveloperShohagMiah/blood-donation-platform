
const SectionHeader = ({
    id,
    title,
    subtitle,
    label,
    icon,
    tone = "light",
}) => {
    const dark = tone === "dark";

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-[600px]">

                {label && (
                    <p className="mb-2 flex gap-1 w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                        {icon && (
                            <div className="">
                                <span className={dark ? "text-primary" : "text-primary"}>
                                    {icon}
                                </span>
                            </div>
                        )}
                        {label}
                    </p>
                )}



                <h2
                    id={id}
                    className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
                >
                    {title}
                </h2>

                {subtitle && (
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SectionHeader;
