import {
	createFileRoute,
	useParams,
	Link,
	useNavigate,
} from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";
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
	CheckCircle2,
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
	const healthAlerts = 0; // TODO: Calculate from animal health data
	const { t } = useTranslation("dashboard");

	// Mock recent activity data
	const recentActivity = [
		{
			id: "1",
			icon: Plus,
			iconColor: "bg-success/10 text-success",
			title: t("recentActivities.animalAdded.title"),
			description: t("recentActivities.animalAdded.description"),
			timestamp: t("recentActivities.animalAdded.timestamp"),
			action: {
				label: t("recentActivities.animalAdded.viewButton"),
				onClick: () => console.log("View animal"),
			},
		},
		{
			id: "2",
			icon: Stethoscope,
			iconColor: "bg-info/10 text-info",
			title: t("recentActivities.healthCheck.title"),
			description: t("recentActivities.healthCheck.description"),
			timestamp: t("recentActivities.healthCheck.timestamp"),
		},
		{
			id: "3",
			icon: CheckCircle2,
			iconColor: "bg-primary/10 text-primary",
			title: t("recentActivities.tasks.title"),
			description: t("recentActivities.tasks.description"),
			timestamp: t("recentActivities.tasks.timestamp"),
		},
	];

	return (
		<div className="max-w-6xl mx-auto space-y-6 pb-6">
			<PageHeader
				title={t("title")}
				description={t("dashboardSubtitle")}
			/>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
					borderColor={healthAlerts > 0 ? "border-l-error" : "border-l-success"}
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
				<h2 className="text-h2 text-foreground mb-4">
					{t("quickActions.title")}
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
						onClick={() => console.log("Health check")}
					/>
					<QuickActionCard
						icon={Heart}
						iconColor="text-breeding"
						title={t("quickActions.breedingLog.title")}
						description={t("quickActions.breedingLog.description")}
						onClick={() => console.log("Breeding log")}
					/>
				</div>
			</div>

			{/* Recent Activity */}
			<div>
				<h2 className="text-h2 text-foreground mb-4">
					{t("recentActivities.title")}
				</h2>
				<ActivityFeed
					items={recentActivity}
					emptyMessage={t("recentActivities.noActivityMessage")}
				/>
			</div>
		</div>
	);
}
