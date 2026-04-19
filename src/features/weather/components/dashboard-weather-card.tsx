import { Cloud } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WeatherData } from "@/features/weather/api/weather-api";
import { weatherDescriptionKeyByCode } from "@/features/weather/weather-description-map";

interface DashboardWeatherCardProps {
	weatherData: WeatherData | undefined;
	isWeatherLoading: boolean;
	isWeatherError: boolean;
	weatherErrorMessage?: string | null;
	farmId: string;
	borderColor?: string;
	className?: string;
}

interface MetricProps {
	label: string;
	value: string;
}

function WeatherMetric({ label, value }: MetricProps) {
	return (
		<div className="rounded-md bg-muted/40 p-2.5 min-w-0">
			<p className="text-[11px] leading-4 text-muted-foreground truncate">
				{label}
			</p>
			<p className="text-sm font-semibold text-foreground wrap-break-word leading-5">
				{value}
			</p>
		</div>
	);
}

export function DashboardWeatherCard({
	weatherData,
	isWeatherLoading,
	isWeatherError,
	weatherErrorMessage,
	farmId,
	borderColor,
	className,
}: DashboardWeatherCardProps) {
	const { t } = useTranslation("dashboard");

	const isLoading = isWeatherLoading;
	const hasError = isWeatherError || !weatherData?.current;
	const isLocationMissing =
		(weatherErrorMessage ?? "").toLowerCase().includes("location is not set") ||
		(weatherErrorMessage ?? "")
			.toLowerCase()
			.includes("configure latitude and longitude");

	const headlineValue = isLoading
		? "..."
		: isLocationMissing
			? t("resumes.resumeWeatherCard.locationError")
			: hasError
				? t("resumes.resumeWeatherCard.apiError")
				: `${Math.round(weatherData.current.temperature)}${weatherData.units.temperature}`;

	const weatherDescription =
		!isLoading && !hasError
			? (() => {
					const code = weatherData?.current?.weatherCode;
					if (code == null)
						return weatherData?.current?.weatherDescription || "";
					const key = weatherDescriptionKeyByCode[code];
					return key
						? t("weatherDescriptions." + key, {
								ns: "dashboard",
								defaultValue: weatherData?.current?.weatherDescription || "",
							})
						: weatherData?.current?.weatherDescription || "";
				})()
			: "";

	const feelsLikeValue =
		weatherData?.current && weatherData?.units
			? `${Math.round(weatherData.current.apparentTemperature)}${weatherData.units.temperature}`
			: "-";
	const windValue =
		weatherData?.current && weatherData?.units
			? `${Math.round(weatherData.current.windSpeed)} ${weatherData.units.windSpeed}`
			: "-";
	const humidityValue =
		weatherData?.current && weatherData?.units
			? `${weatherData.current.humidity}${weatherData.units.humidity}`
			: "-";
	const rainChanceValue =
		weatherData?.daily[0]?.precipitationProbabilityMax != null
			? `${weatherData.daily[0].precipitationProbabilityMax}%`
			: "-";

	return (
		<Card
			className={cn(
				"h-full border-l-4 py-4 gap-0",
				borderColor ?? "border-l-info",
				"min-h-34",
				className,
			)}
		>
			<CardContent className="px-4">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<p className="text-body text-muted-foreground">
							{t("resumes.resumeWeatherCard.label")}
						</p>
						<p className="text-h1 sm:text-display font-bold text-foreground leading-none wrap-break-word">
							{headlineValue}
						</p>
						{weatherDescription ? (
							<p className="text-small text-muted-foreground mt-1 wrap-break-word">
								{weatherDescription}
							</p>
						) : null}{" "}
						{isLocationMissing && !isLoading ? (
							<Button
								asChild
								size="sm"
								variant="link"
								className="px-0 mt-1 h-auto text-xs"
							>
								<Link
									to="/farm/$farmId/farms"
									params={{ farmId }}
								>
									{t("resumes.resumeWeatherCard.configureLocation")}
								</Link>
							</Button>
						) : null}{" "}
					</div>
					<Cloud
						className="w-7 h-7 text-info shrink-0 mt-1"
						aria-hidden="true"
					/>
				</div>

				{!isLoading && !hasError ? (
					<div className="mt-4 grid grid-cols-2 gap-2 sm:gap-2.5">
						<WeatherMetric
							label={t("resumes.resumeWeatherCard.feelsLike")}
							value={feelsLikeValue}
						/>
						<WeatherMetric
							label={t("resumes.resumeWeatherCard.wind")}
							value={windValue}
						/>
						<WeatherMetric
							label={t("resumes.resumeWeatherCard.humidity")}
							value={humidityValue}
						/>
						<WeatherMetric
							label={t("resumes.resumeWeatherCard.rainChance")}
							value={rainChanceValue}
						/>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
