import { createFileRoute } from "@tanstack/react-router";

import { FlockDetailPage } from "@/features/livestock/pages/flock-detail-page";

export const Route = createFileRoute("/v2/production-units/flock/$unitId")({
	component: ProductionUnitFlockPage,
});

function ProductionUnitFlockPage() {
	const { unitId } = Route.useParams();
	return <FlockDetailPage unitId={unitId} />;
}
