import { useGetAnimalsByFarmId } from "@/features/animal/api/animal-queries";
import { AnimalCardContainer } from "@/features/animal/components/animal-card-container";
import { NewAnimalModal } from "@/features/animal/components/new-animal-modal/new-animal-modal";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { CircleChevronLeft } from "lucide-react";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/species/$speciesId/animals",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { farmId, speciesId } = useParams({ strict: false });
	const { data: animalsData, isPending } = useGetAnimalsByFarmId({
		farmId: farmId!,
		withLanguage: true,
		speciesId: speciesId!,
	});

	if (isPending) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-4">
				<Link
					to="/farm/$farmId/species"
					params={{ farmId: farmId! }}
				>
					<CircleChevronLeft />
				</Link>

				<NewAnimalModal />
			</div>
			<AnimalCardContainer
				animalsList={animalsData!}
				sex=""
			/>
		</div>
	);
}
