import { Badge } from "@/components/ui/badge"

const HeroBadge = ({ icon, label }) => {
    return (
        <Badge
            variant="outline"
            className="gap-2.5 rounded-full border-primary/20 bg-primary/5 py-2 pr-4 pl-3 text-xs font-semibold text-primary shadow-sm backdrop-blur uppercase"
        >
            {icon}
            {label}
        </Badge>
    )
}

export default HeroBadge
