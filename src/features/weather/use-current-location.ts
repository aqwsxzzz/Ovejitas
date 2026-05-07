import { useState, useEffect } from "react";

export interface GeolocationState {
	lat: number | null;
	lon: number | null;
	loading: boolean;
	error: string | null;
}

export function useCurrentLocation(): GeolocationState {
	const [state, setState] = useState<GeolocationState>({
		lat: null,
		lon: null,
		loading: true,
		error: null,
	});

	useEffect(() => {
		if (!navigator.geolocation) {
			setState((s) => ({
				...s,
				loading: false,
				error: "Geolocation not supported",
			}));
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setState({
					lat: pos.coords.latitude,
					lon: pos.coords.longitude,
					loading: false,
					error: null,
				});
			},
			(err) => {
				setState((s) => ({ ...s, loading: false, error: err.message }));
			},
			{ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
		);
	}, []);

	return state;
}
