import { createFileRoute, useParams } from "@tanstack/react-router";
import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { cowHead } from "@lucide/lab";
import { Sun } from "lucide-react";
import { Icon } from "lucide-react";
import { useGetAnimalsByFarmId } from "@/features/animal/api/animal-queries";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/dashboard",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { farmId } = useParams({ strict: false });
	const { data: animalData } = useGetAnimalsByFarmId(farmId!);

	return (
		<div className="flex gap-2 justify-center p-4">
			<DashboardCard
				cardProps={{
					icon: <Icon iconNode={cowHead} />,
					title: "Total Animals",
					value: animalData?.length.toString() || "0",
				}}
			/>
			<DashboardCard
				cardProps={{ icon: <Sun />, title: "Weather", value: "32°" }}
			/>
		</div>
	);
}
