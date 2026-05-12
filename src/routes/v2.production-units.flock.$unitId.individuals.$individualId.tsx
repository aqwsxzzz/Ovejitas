import { createFileRoute } from "@tanstack/react-router";
import { IndividualDetailPage } from "@/features/livestock/pages/individual-detail-page";

export const Route = createFileRoute(
	"/v2/production-units/flock/$unitId/individuals/$individualId",
)({
	validateSearch: (search: Record<string, unknown>) => ({
		edit: search.edit === true || search.edit === "true",
		eventType:
			typeof search.eventType === "string" ? search.eventType : undefined,
	}),
	component: ProductionUnitIndividualDetailRoute,
});

function ProductionUnitIndividualDetailRoute() {
	const { unitId, individualId } = Route.useParams();
	const search = Route.useSearch();
	return (
		<IndividualDetailPage
			assetId={unitId}
			individualId={individualId}
			startEditing={search.edit}
		/>
	);
}
