import { createFileRoute } from "@tanstack/react-router";

import { LivestockSpeciesPage } from "@/features/livestock/pages/livestock-species-page";

export const Route = createFileRoute("/v2/production-units/$speciesKey")({
	component: ProductionUnitSpeciesPage,
});

function ProductionUnitSpeciesPage() {
	const { speciesKey } = Route.useParams();
	return <LivestockSpeciesPage speciesKey={speciesKey} />;
}
