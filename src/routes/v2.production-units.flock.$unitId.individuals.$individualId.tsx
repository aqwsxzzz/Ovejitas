import { createFileRoute } from "@tanstack/react-router";
import { IndividualDetailPage } from "@/features/livestock/pages/individual-detail-page";

export const Route = createFileRoute(
	"/v2/production-units/flock/$unitId/individuals/$individualId",
)({
	component: ProductionUnitIndividualDetailRoute,
});

function ProductionUnitIndividualDetailRoute() {
	const { unitId, individualId } = Route.useParams();
	return (
		<IndividualDetailPage
			assetId={unitId}
			individualId={individualId}
		/>
	);
}
