import { useEffect, useRef } from "react";
import L from "leaflet";

const markerIcon = (label, active = false) =>
    L.divIcon({
        className: "bc-map-marker",
        html: `<span class="bc-map-pin${active ? " is-active" : ""}">${label}</span>`,
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

    return <div ref={containerRef} className={`w-full rounded-2xl ${className}`} />;
};

export default DonorMap;
