import { AnimalProfileCard } from "@/features/animal/components/single-animal-page/animal-profile-card";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { CircleChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_private/_privatelayout/farm/$farmId/$animalId/animal")({
    component: RouteComponent,
});

function RouteComponent() {
    const { farmId } = useParams({ strict: false });
    return (
        <div className="p-4">
            <Link to="/farm/$farmId/animals" params={{ farmId: farmId! }}>
                <CircleChevronLeft />
            </Link>
            <AnimalProfileCard />
        </div>
    );
}
