import { useGetAnimalsByFarmId } from "@/features/animal/api/animal-queries";
import { AnimalCardContainer } from "@/features/animal/components/animal-card-container";
import { NewAnimalModal } from "@/features/animal/components/new-animal-modal/new-animal-modal";
import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_privatelayout/farm/$farmId/animals")({
    component: RouteComponent,
});

function RouteComponent() {
    const { farmId } = useParams({ strict: false });
    const { data: animalData, isPending } = useGetAnimalsByFarmId(farmId!);

    if (isPending) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <NewAnimalModal />
            <AnimalCardContainer animalsList={animalData!} />
        </div>
    );
}
