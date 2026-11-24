import React from 'react'

const HeroBadge = ({ icon, label }) => {
    return (
        <span className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 py-2 pr-4 pl-3 text-xs font-semibold text-primary shadow-sm backdrop-blur uppercase">
            {icon}
            {label}
        </span>
    )
}

export default HeroBadge