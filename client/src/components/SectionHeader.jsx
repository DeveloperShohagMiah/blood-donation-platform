
const SectionHeader = ({
    id,
    title,
    subtitle,
    label,
    icon,
    badge,
}) => {
    const BadgeIcon = badge?.icon;

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-[600px]">

                {BadgeIcon && (
                    <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-primary/10 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                        <BadgeIcon size={14} aria-hidden="true" />
                        {badge.label}
                    </div>
                )}

                {label && icon && (
                    <div className=" mb-2 border border-primary/10 flex gap-1 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                        {icon && (
                            <span className="text-primary">
                                {icon}
                            </span>
                        )}
                        {label}
                    </div>
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
