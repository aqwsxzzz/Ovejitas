import { AnimalProfileCard } from "@/features/animal/components/single-animal-page/animal-profile-card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_privatelayout/farm/$farmId/$animalId/animal")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="p-4">
            <AnimalProfileCard />
        </div>
    );
}
