import { useQuery } from "@tanstack/react-query";
import { getWeather } from "./weather-api";

export const weatherQueryKeys = {
	all: ["weather"] as const,
	byCoords: (lat: number, lon: number) => ["weather", lat, lon] as const,
};

export const useGetWeather = (
	lat: number | null,
	lon: number | null,
	enabled = true,
) =>
	useQuery({
		queryKey:
			lat && lon ? weatherQueryKeys.byCoords(lat, lon) : weatherQueryKeys.all,
		queryFn: () => {
			if (lat == null || lon == null) throw new Error("Missing coordinates");
			return getWeather(lat, lon);
		},
		select: (data) => data.data,
		enabled: enabled && lat != null && lon != null,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
