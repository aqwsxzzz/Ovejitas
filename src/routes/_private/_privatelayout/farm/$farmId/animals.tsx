import { useGetAnimalsByFarmId } from "@/features/animal/api/animal-queries";
import { AnimalsDashboard } from "@/features/animal/components/animals-dashboard/animals-dashboard";
import { NewAnimalModal } from "@/features/animal/components/new-animal-modal/new-animal-modal";
import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/animals",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { farmId } = useParams({ strict: false });
	const include = "";
	const { data: animalData, isPending } = useGetAnimalsByFarmId({
		farmId: farmId!,
		include,
		withLanguage: true,
	});

	if (isPending) {
		void animalData;
		return <div>Loading...</div>;
	}

	return (
		<div className="flex flex-col gap-2">
			<NewAnimalModal />
			{/* <AnimalCardContainer animalsList={animalData!} /> */}
			<AnimalsDashboard />
		</div>
	);
}
