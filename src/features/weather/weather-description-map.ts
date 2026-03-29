// Maps WMO weather codes to i18n keys for weather descriptions
export const weatherDescriptionKeyByCode: Record<number, string> = {
	0: "clearSky", // Clear sky
	1: "mainlyClear", // Mainly clear
	2: "partlyCloudy", // Partly cloudy
	3: "overcast", // Overcast
	45: "fog", // Fog
	48: "depositingRimeFog", // Depositing rime fog
	51: "drizzleLight", // Drizzle: Light
	53: "drizzleModerate", // Drizzle: Moderate
	55: "drizzleDense", // Drizzle: Dense
	56: "freezingDrizzleLight", // Freezing Drizzle: Light
	57: "freezingDrizzleDense", // Freezing Drizzle: Dense
	61: "rainSlight", // Rain: Slight
	63: "rainModerate", // Rain: Moderate
	65: "rainHeavy", // Rain: Heavy
	66: "freezingRainLight", // Freezing Rain: Light
	67: "freezingRainHeavy", // Freezing Rain: Heavy
	71: "snowFallSlight", // Snow fall: Slight
	73: "snowFallModerate", // Snow fall: Moderate
	75: "snowFallHeavy", // Snow fall: Heavy
	77: "snowGrains", // Snow grains
	80: "rainShowersSlight", // Rain showers: Slight
	81: "rainShowersModerate", // Rain showers: Moderate
	82: "rainShowersViolent", // Rain showers: Violent
	85: "snowShowersSlight", // Snow showers: Slight
	86: "snowShowersHeavy", // Snow showers: Heavy
	95: "thunderstorm", // Thunderstorm: Slight or moderate
	96: "thunderstormHailSlight", // Thunderstorm with slight hail
	99: "thunderstormHailHeavy", // Thunderstorm with heavy hail
};
