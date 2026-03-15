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
import { useGetAnimalsByFarmId } from "@/features/animal/api/animal-queries";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/dashboard",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { farmId } = useParams({ strict: false });
	const navigate = useNavigate();
	const { data: animalData, isLoading } = useGetAnimalsByFarmId({
		farmId: farmId!,
		include: "species.translations,breed",
		withLanguage: true,
	});

	const totalAnimals = animalData?.length || 0;
	const healthAlerts =
		animalData?.filter((animal) => animal.status !== "alive").length || 0;
	const { t } = useTranslation("dashboard");

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
						to="/farm/$farmId/species"
						params={{ farmId: farmId! }}
					>
						<StatsWidget
							icon={Beef}
							iconColor="text-primary"
							borderColor="border-l-primary"
							label={t("resumes.resumeAnimalsCard.label")}
							value={isLoading ? "..." : totalAnimals}
							trend={
								totalAnimals > 0
									? {
											value: t("resumes.resumeAnimalsCard.trendValue"),
											direction: "up",
										}
									: undefined
							}
						/>
					</Link>

					<StatsWidget
						icon={Cloud}
						iconColor="text-info"
						borderColor="border-l-info"
						label={t("resumes.resumeWeatherCard.label")}
						value="24°C"
						trend={{
							value: t("resumes.resumeWeatherCard.trendValue"),
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
							onClick={() =>
								navigate({
									to: "/farm/$farmId/species",
									params: { farmId: farmId! },
								})
							}
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
	);
}
