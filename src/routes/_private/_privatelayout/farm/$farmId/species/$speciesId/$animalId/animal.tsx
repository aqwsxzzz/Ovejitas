import { AnimalProfileCard } from "@/features/animal/components/animal-profile-view/animal-profile-basic-card";
import { AnimalProfileHealthCard } from "@/features/animal/components/animal-profile-view/animal-profile-health-card/animal-profile-health-card";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { CircleChevronLeft } from "lucide-react";

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
			<AnimalProfileHealthCard />
		</div>
	);
}
