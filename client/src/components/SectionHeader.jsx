import { Badge } from "@/components/ui/badge"

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
                    <Badge
                        variant="outline"
                        className="mb-4 gap-2 rounded-full border-primary/20 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--primary)_12%,transparent),color-mix(in_srgb,var(--primary)_5%,transparent),color-mix(in_srgb,var(--accent)_40%,transparent))] px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.14em] text-primary uppercase shadow-sm backdrop-blur"
                    >
                        <span className="grid size-5 place-items-center rounded-full bg-primary/15">
                            {BadgeIcon ? <BadgeIcon size={13} /> : icon}
                        </span>
                        {BadgeIcon ? badge.label : label}
                    </Badge>
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
