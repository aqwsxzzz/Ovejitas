import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
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
import i18next from "i18next";

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
		animalFilters: {
			language: i18next.language.slice(0, 2) as "es" | "en",
		},
	});

	const totalAnimals = animalData?.length || 0;
	const healthAlerts = 0; // TODO: Calculate from animal health data

	// Mock recent activity data
	const recentActivity = [
		{
			id: "1",
			icon: Plus,
			iconColor: "bg-success/10 text-success",
			title: "New animal added",
			description: "Sheep #247 added to the flock",
			timestamp: "2 hours ago",
			action: {
				label: "View",
				onClick: () => console.log("View animal"),
			},
		},
		{
			id: "2",
			icon: Stethoscope,
			iconColor: "bg-info/10 text-info",
			title: "Health check completed",
			description: "5 animals checked by Dr. Smith",
			timestamp: "5 hours ago",
		},
		{
			id: "3",
			icon: CheckCircle2,
			iconColor: "bg-primary/10 text-primary",
			title: "Task completed",
			description: "Morning feeding completed",
			timestamp: "8 hours ago",
		},
	];

	return (
		<div className="max-w-6xl mx-auto space-y-6 pb-6">
			<PageHeader
				title="Dashboard"
				description="Welcome back to your digital farmhouse"
			/>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Link to="/farm/$farmId/species" params={{ farmId: farmId! }}>
					<StatsWidget
						icon={Beef}
						iconColor="text-primary"
						borderColor="border-l-primary"
						label="Total Animals"
						value={isLoading ? "..." : totalAnimals}
						trend={
							totalAnimals > 0
								? { value: "+2 this week", direction: "up" }
								: undefined
						}
					/>
				</Link>

				<StatsWidget
					icon={Cloud}
					iconColor="text-info"
					borderColor="border-l-info"
					label="Weather"
					value="24°C"
					trend={{ value: "Sunny", direction: "neutral" }}
				/>

				<StatsWidget
					icon={AlertTriangle}
					iconColor={healthAlerts > 0 ? "text-error" : "text-success"}
					borderColor={
						healthAlerts > 0 ? "border-l-error" : "border-l-success"
					}
					label="Health Alerts"
					value={healthAlerts}
					trend={
						healthAlerts === 0
							? { value: "All healthy", direction: "neutral" }
							: undefined
					}
				/>
			</div>

			{/* Quick Actions */}
			<div>
				<h2 className="text-h2 text-foreground mb-4">Quick Actions</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					<QuickActionCard
						icon={Plus}
						iconColor="text-primary"
						title="Add Animal"
						description="Register a new animal to your farm"
						onClick={() => navigate({ to: "/farm/$farmId/species", params: { farmId: farmId! } })}
					/>
					<QuickActionCard
						icon={Stethoscope}
						iconColor="text-info"
						title="Health Check"
						description="Record health observations"
						onClick={() => console.log("Health check")}
					/>
					<QuickActionCard
						icon={Heart}
						iconColor="text-breeding"
						title="Breeding Log"
						description="Track breeding activities"
						onClick={() => console.log("Breeding log")}
					/>
				</div>
			</div>

			{/* Recent Activity */}
			<div>
				<h2 className="text-h2 text-foreground mb-4">Recent Activity</h2>
				<ActivityFeed
					items={recentActivity}
					emptyMessage="No recent activity to show"
				/>
			</div>
		</div>
	);
}
