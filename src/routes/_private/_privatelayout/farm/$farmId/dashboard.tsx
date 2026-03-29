import {
	createFileRoute,
	useParams,
	Link,
	useNavigate,
} from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";
import { ScrollablePageLayout } from "@/components/layout/scrollable-page-layout";
import { StatsWidget } from "@/components/common/stats-widget";
import { ActivityFeed } from "@/components/common/activity-feed";
import { QuickActionCard } from "@/components/common/quick-action-card";
import {
	Beef,
	Cloud,
	AlertTriangle,
	Plus,
	Stethoscope,
	Heart,
} from "lucide-react";
import {
	useGetAnimalStats,
	useGetAnimalsByFarmId,
} from "@/features/animal/api/animal-queries";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useCurrentLocation } from "@/features/weather/use-current-location";
import { useGetWeather } from "@/features/weather/api/weather-queries";
import { weatherDescriptionKeyByCode } from "@/features/weather/weather-description-map";
import { NewAnimalModal } from "@/features/animal/components/new-animal-modal/new-animal-modal";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/dashboard",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { farmId } = useParams({ strict: false });
	const navigate = useNavigate();
	const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
	const { data: animalData } = useGetAnimalsByFarmId({
		farmId: farmId!,
		include: "species.translations,breed",
		withLanguage: true,
	});

	const { data: animalStats, isLoading: isAnimalStatsLoading } =
		useGetAnimalStats(farmId!);
	const totalAnimals = animalStats?.total ?? 0;
	const animalsAddedLast7Days = animalStats?.lastSevenDays ?? 0;
	const healthAlerts =
		animalData?.filter((animal) => animal.status !== "alive").length || 0;
	const { t } = useTranslation("dashboard");

	// Weather: get user location and fetch weather
	const {
		lat,
		lon,
		loading: geoLoading,
		error: geoError,
	} = useCurrentLocation();
	const {
		data: weatherData,
		isLoading: isWeatherLoading,
		isError: isWeatherError,
	} = useGetWeather(lat, lon, !geoLoading && !geoError);

	const recentActivity = (animalData ?? []).slice(0, 3).map((animal) => ({
		id: animal.id,
		icon: animal.status === "alive" ? Plus : Stethoscope,
		iconColor:
			animal.status === "alive"
				? "bg-success/10 text-success"
				: "bg-warning/10 text-warning",
		title: t("recentActivities.animalSnapshot.title"),
		description: t("recentActivities.animalSnapshot.description", {
			name: animal.name ?? t("recentActivities.animalSnapshot.unnamed"),
			tag: animal.tagNumber,
			status: t(`recentActivities.status.${animal.status ?? "unknown"}`),
		}),
		timestamp: t("recentActivities.animalSnapshot.timestamp"),
		action: {
			label: t("recentActivities.animalAdded.viewButton"),
			onClick: () =>
				navigate({
					to: "/farm/$farmId/species/$speciesId/$animalId/animal",
					params: {
						farmId: farmId!,
						speciesId: animal.speciesId,
						animalId: animal.id,
					},
				}),
		},
	}));

	return (
		<>
			<ScrollablePageLayout
				className="max-w-6xl mx-auto pb-6"
				header={
					<PageHeader
						title={t("title")}
						description={t("dashboardSubtitle")}
					/>
				}
			>
				<div className="space-y-6">
					{/* Stats Grid */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<Link
							className="block h-full"
							to="/farm/$farmId/species"
							params={{ farmId: farmId! }}
						>
							<StatsWidget
								icon={Beef}
								iconColor="text-primary"
								borderColor="border-l-primary"
								label={t("resumes.resumeAnimalsCard.label")}
								value={isAnimalStatsLoading ? "..." : totalAnimals}
								trend={
									!isAnimalStatsLoading
										? {
												value: t("resumes.resumeAnimalsCard.trendValue", {
													count: animalsAddedLast7Days,
												}),
												direction: animalsAddedLast7Days > 0 ? "up" : "neutral",
											}
										: undefined
								}
								className="h-full"
							/>
						</Link>

						<StatsWidget
							icon={Cloud}
							iconColor="text-info"
							borderColor="border-l-info"
							label={t("resumes.resumeWeatherCard.label")}
							value={
								geoLoading
									? "..."
									: geoError
										? t("resumes.resumeWeatherCard.locationError")
										: isWeatherLoading
											? "..."
											: isWeatherError || !weatherData?.current
												? t("resumes.resumeWeatherCard.apiError")
												: `${Math.round(weatherData.current.temperature)}${weatherData.units.temperature}`
							}
							trend={{
								value:
									isWeatherLoading || geoLoading
										? ""
										: (() => {
												const code = weatherData?.current?.weatherCode;
												if (code == null)
													return weatherData?.current?.weatherDescription || "";
												const key = weatherDescriptionKeyByCode[code];
												return key
													? t("weatherDescriptions." + key, {
															ns: "dashboard",
															defaultValue:
																weatherData?.current?.weatherDescription || "",
														})
													: weatherData?.current?.weatherDescription || "";
											})(),
								direction: "neutral",
							}}
						/>

						<StatsWidget
							icon={AlertTriangle}
							iconColor={healthAlerts > 0 ? "text-error" : "text-success"}
							borderColor={
								healthAlerts > 0 ? "border-l-error" : "border-l-success"
							}
							label={t("resumes.resumeHealthCard.label")}
							value={healthAlerts}
							trend={
								healthAlerts === 0
									? {
											value: t("resumes.resumeHealthCard.trendValue"),
											direction: "neutral",
										}
									: undefined
							}
						/>
					</div>

					{/* Quick Actions */}
					<div>
						<h2 className="mb-4 text-h2 text-foreground">
							{t("quickActions.title")}
						</h2>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
							<QuickActionCard
								icon={Plus}
								iconColor="text-primary"
								title={t("quickActions.addAnimal.title")}
								description={t("quickActions.addAnimal.description")}
								onClick={() => setIsAddAnimalOpen(true)}
							/>
							<QuickActionCard
								icon={Stethoscope}
								iconColor="text-info"
								title={t("quickActions.healthCheck.title")}
								description={t("quickActions.healthCheck.description")}
								onClick={() =>
									navigate({
										to: "/farm/$farmId/species",
										params: { farmId: farmId! },
									})
								}
							/>
							<QuickActionCard
								icon={Heart}
								iconColor="text-breeding"
								title={t("quickActions.breedingLog.title")}
								description={t("quickActions.breedingLog.description")}
								onClick={() =>
									navigate({
										to: "/farm/$farmId/species",
										params: { farmId: farmId! },
									})
								}
							/>
						</div>
					</div>

					{/* Recent Activity */}
					<div>
						<h2 className="mb-4 text-h2 text-foreground">
							{t("recentActivities.title")}
						</h2>
						<ActivityFeed
							items={recentActivity}
							emptyMessage={t("recentActivities.noActivityMessage")}
						/>
					</div>
				</div>
			</ScrollablePageLayout>
			<NewAnimalModal
				open={isAddAnimalOpen}
				onOpenChange={setIsAddAnimalOpen}
			/>
		</>
	);
}
