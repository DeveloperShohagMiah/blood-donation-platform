import { useEffect, useRef } from "react";
import L from "leaflet";

const LocationPicker = ({ lat, lng, onChange }) => {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return undefined;
        const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
            [23.8, 90.4],
            7
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
        map.on("click", (event) => {
            onChange({
                lat: Number(event.latlng.lat.toFixed(6)),
                lng: Number(event.latlng.lng.toFixed(6)),
            });
        });
        mapRef.current = map;
        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, [onChange]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        if (markerRef.current) {
            map.removeLayer(markerRef.current);
            markerRef.current = null;
        }
        if (typeof lat !== "number" || typeof lng !== "number") return;

        markerRef.current = L.marker([lat, lng], {
            draggable: true,
            icon: L.divIcon({
                className: "border-0 bg-transparent",
                html: '<span class="grid size-10 place-items-center rounded-full border-2 border-white bg-primary-hover text-primary-foreground text-[11px] font-extrabold shadow-[0_8px_18px_-8px_color-mix(in_srgb,var(--primary)_90%,transparent)]">●</span>',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
            }),
        }).addTo(map);
        markerRef.current.on("dragend", (event) => {
            const point = event.target.getLatLng();
            onChange({
                lat: Number(point.lat.toFixed(6)),
                lng: Number(point.lng.toFixed(6)),
            });
        });
        map.setView([lat, lng], 12);
    }, [lat, lng, onChange]);

    return (
        <div>
            <div ref={containerRef} className="z-0 h-64 w-full rounded-xl border border-border font-display" />
            <p className="mt-2 text-xs text-muted-foreground">
                Click the map (or drag the pin) to set your approximate location.
            </p>
        </div>
    );
};

export default LocationPicker;
