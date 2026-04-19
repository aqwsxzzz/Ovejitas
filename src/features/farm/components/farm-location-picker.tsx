import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import L from "leaflet";

interface FarmLocationPickerProps {
	latitude: number | null;
	longitude: number | null;
	onChange: (coords: { latitude: number; longitude: number }) => void;
}

const FALLBACK_CENTER: [number, number] = [-34.6037, -58.3816];

export const FarmLocationPicker = ({
	latitude,
	longitude,
	onChange,
}: FarmLocationPickerProps) => {
	const mapElementRef = useRef<HTMLDivElement | null>(null);
	const mapInstanceRef = useRef<L.Map | null>(null);
	const markerRef = useRef<L.CircleMarker | null>(null);
	const hasCoordinates = latitude != null && longitude != null;
	const center: [number, number] = hasCoordinates
		? [latitude, longitude]
		: FALLBACK_CENTER;

	useEffect(() => {
		if (!mapElementRef.current || mapInstanceRef.current) {
			return;
		}

		const map = L.map(mapElementRef.current, {
			center,
			zoom: hasCoordinates ? 13 : 4,
			scrollWheelZoom: true,
		});

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map);

		map.on("click", (event: L.LeafletMouseEvent) => {
			onChange({
				latitude: Number(event.latlng.lat.toFixed(6)),
				longitude: Number(event.latlng.lng.toFixed(6)),
			});
		});

		mapInstanceRef.current = map;

		return () => {
			map.remove();
			mapInstanceRef.current = null;
			markerRef.current = null;
		};
	}, [center, hasCoordinates, onChange]);

	useEffect(() => {
		const map = mapInstanceRef.current;
		if (!map) return;

		if (hasCoordinates) {
			const location: [number, number] = [latitude, longitude];

			if (!markerRef.current) {
				markerRef.current = L.circleMarker(location, {
					radius: 8,
					color: "#2563eb",
					fillColor: "#2563eb",
					fillOpacity: 0.8,
				}).addTo(map);
			} else {
				markerRef.current.setLatLng(location);
			}

			map.setView(location, Math.max(map.getZoom(), 13));
			return;
		}

		if (markerRef.current) {
			map.removeLayer(markerRef.current);
			markerRef.current = null;
		}

		map.setView(FALLBACK_CENTER, 4);
	}, [hasCoordinates, latitude, longitude]);

	return (
		<div className="space-y-2">
			<p className="text-sm text-muted-foreground">
				Click on the map to set your farm location.
			</p>
			<div
				ref={mapElementRef}
				className="farm-location-map relative z-0 isolate h-80 w-full overflow-hidden rounded-md border"
			/>
		</div>
	);
};
