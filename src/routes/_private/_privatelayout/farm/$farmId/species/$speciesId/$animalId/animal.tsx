import { AnimalProfileCard } from "@/features/animal/components/animal-profile-view/animal-profile-basic-card";
import { AnimalProfileHealthCard } from "@/features/animal/components/animal-profile-view/animal-profile-health-card/animal-profile-health-card";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { CircleChevronLeft, HeartPulse, Baby, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/species/$speciesId/$animalId/animal",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { farmId, speciesId } = useParams({ strict: false });
	return (
		<div className="p-4 flex flex-col gap-4">
			<Link
				to="/farm/$farmId/species/$speciesId/animals"
				params={{ farmId: farmId!, speciesId: speciesId! }}
			>
				<CircleChevronLeft />
			</Link>
			<AnimalProfileCard />

			{/* Quick Action Buttons */}
			<div className="grid grid-cols-3 gap-3">
				<Button
					variant="outline"
					className="flex flex-col items-center gap-2 h-auto py-4"
					onClick={() => console.log("Health Check")}
				>
					<HeartPulse className="h-6 w-6 text-info" />
					<span className="text-caption font-medium">Health Check</span>
				</Button>
				<Button
					variant="outline"
					className="flex flex-col items-center gap-2 h-auto py-4"
					onClick={() => console.log("Breeding Log")}
				>
					<Baby className="h-6 w-6 text-breeding" />
					<span className="text-caption font-medium">Breeding</span>
				</Button>
				<Button
					variant="outline"
					className="flex flex-col items-center gap-2 h-auto py-4"
					onClick={() => console.log("Notes")}
				>
					<FileText className="h-6 w-6 text-warning" />
					<span className="text-caption font-medium">Notes</span>
				</Button>
			</div>

			<AnimalProfileHealthCard />
		</div>
	);
}
