import { NewAnimalModal } from "@/features/animal/components/new-animal-modal/new-animal-modal";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_privatelayout/farm/$farmId/animals")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <div>Hello "/_private/_privatelayout/farm/$farmId/animals"!</div>
            <NewAnimalModal />
        </div>
    );
}
