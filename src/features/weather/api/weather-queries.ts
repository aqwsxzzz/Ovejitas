import { useQuery } from "@tanstack/react-query";
import { getWeather } from "./weather-api";

export const weatherQueryKeys = {
	all: ["weather"] as const,
	currentFarm: () => ["weather", "current-farm"] as const,
	legacyFallbackCoords: (lat: number | null, lon: number | null) =>
		["weather", "legacy-fallback", lat ?? "na", lon ?? "na"] as const,
};

export const useGetWeather = ({
	enabled = true,
	latitude,
	longitude,
}: {
	enabled?: boolean;
	latitude?: number | null;
	longitude?: number | null;
} = {}) =>
	useQuery({
		queryKey:
			latitude != null || longitude != null
				? weatherQueryKeys.legacyFallbackCoords(
						latitude ?? null,
						longitude ?? null,
					)
				: weatherQueryKeys.currentFarm(),
		queryFn: () => getWeather({ latitude, longitude }),
		select: (data) => data.data,
		enabled,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
