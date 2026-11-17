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
            <div className="max-w-[640px]">
                {(BadgeIcon || (label && icon)) && (
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/12 via-primary/5 to-accent/40 px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.14em] text-primary uppercase shadow-sm backdrop-blur">
                        <span className="grid size-5 place-items-center rounded-full bg-primary/15">
                            {BadgeIcon ? <BadgeIcon size={13} /> : icon}
                        </span>
                        {BadgeIcon ? badge.label : label}
                    </div>
                )}

                <h2
                    id={id}
                    className="text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.035em] text-foreground"
                >
                    {title}
                </h2>

                <span className="mt-4 block h-1 w-14 rounded-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />

                {subtitle && (
                    <p className="mt-4 max-w-[560px] text-[15px] leading-7 text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SectionHeader;
