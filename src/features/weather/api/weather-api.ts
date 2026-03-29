import { axiosHelper } from "@/lib/axios/axios-helper";

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

export const getWeather = async (latitude: number, longitude: number) => {
	return axiosHelper<WeatherResponse>({
		method: "get",
		url: `/weather`,
		urlParams: { latitude, longitude },
	});
};
