import { useEffect, useRef } from "react";
import L from "leaflet";

const PIN_BASE = "grid size-10 place-items-center rounded-full border-2 border-white bg-primary text-primary-foreground text-[11px] font-extrabold shadow-[0_8px_18px_-8px_color-mix(in_srgb,var(--primary)_90%,transparent)]";

const markerIcon = (label, active = false) =>
    L.divIcon({
        className: "border-0 bg-transparent",
        html: `<span class="${PIN_BASE}${active ? " bg-primary-hover" : ""}">${label}</span>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });

const DonorMap = ({ donors = [], className = "h-[420px]" }) => {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const layerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return undefined;

        const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
            [23.8, 90.4],
            7
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
        layerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
            layerRef.current = null;
        };
    }, []);

    useEffect(() => {
        const layer = layerRef.current;
        const map = mapRef.current;
        if (!layer || !map) return;
        layer.clearLayers();

        const points = donors.filter(
            (donor) =>
                typeof donor.lat === "number" &&
                typeof donor.lng === "number"
        );
        if (!points.length) return;

        points.forEach((donor) => {
            L.marker([donor.lat, donor.lng], {
                icon: markerIcon(donor.bloodGroup || "?", true),
            })
                .bindPopup(
                    `<strong>${donor.fullName || "Donor"}</strong><br/>${donor.bloodGroup || ""} · ${donor.district?.nameEn || "Bangladesh"}`
                )
                .addTo(layer);
        });

        if (points.length === 1) {
            map.setView([points[0].lat, points[0].lng], 12);
        } else {
            map.fitBounds(
                points.map((donor) => [donor.lat, donor.lng]),
                { padding: [40, 40], maxZoom: 12 }
            );
        }
    }, [donors]);

    return <div ref={containerRef} className={`z-0 w-full rounded-2xl font-display ${className}`} />;
};

export default DonorMap;
