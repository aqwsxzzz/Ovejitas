import { axiosHelper } from "@/lib/axios/axios-helper";
import { ApiRequestError } from "@/lib/axios/axios-helper";

export interface WeatherCurrent {
	temperature: number;
	apparentTemperature: number;
	weatherCode: number;
	weatherDescription: string;
	windSpeed: number;
	humidity: number;
	precipitation: number;
}

export interface WeatherDaily {
	date: string;
	temperatureMax: number;
	temperatureMin: number;
	precipitationSum: number;
	precipitationProbabilityMax: number;
	windSpeedMax: number;
	weatherCode: number;
	weatherDescription: string;
	sunrise: string;
	sunset: string;
	uvIndexMax: number;
}

export interface WeatherLocation {
	latitude: number;
	longitude: number;
}

export interface WeatherUnits {
	temperature: string;
	windSpeed: string;
	precipitation: string;
	humidity: string;
}

export interface WeatherData {
	current: WeatherCurrent;
	daily: WeatherDaily[];
	location: WeatherLocation;
	units: WeatherUnits;
}

export interface WeatherResponse {
	status: string;
	message: string;
	data: WeatherData;
	meta: {
		timestamp: string;
	};
}

const isMissingCoordinateValidationError = (error: unknown): boolean => {
	if (!(error instanceof ApiRequestError)) return false;
	if (error.statusCode !== 400) return false;
	const message = (error.message ?? "").toLowerCase();
	return (
		message.includes("required property 'latitude'") ||
		message.includes("required property 'longitude'")
	);
};

export const getWeather = async ({
	latitude,
	longitude,
}: {
	latitude?: number | null;
	longitude?: number | null;
} = {}) => {
	try {
		// New backend contract: weather uses farm coordinates from server-side settings.
		return await axiosHelper<WeatherResponse>({
			method: "get",
			url: `/weather`,
		});
	} catch (error) {
		// Backward compatibility for environments still on the old querystring contract.
		if (
			isMissingCoordinateValidationError(error) &&
			latitude != null &&
			longitude != null
		) {
			return axiosHelper<WeatherResponse>({
				method: "get",
				url: `/weather`,
				urlParams: { latitude, longitude },
			});
		}

		throw error;
	}
};
