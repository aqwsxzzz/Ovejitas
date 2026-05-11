import { createFileRoute } from "@tanstack/react-router";

import { FlockDetailPage } from "@/features/livestock/pages/flock-detail-page";
import type { LivestockEventType } from "@/features/livestock/types/livestock-types";

export const Route = createFileRoute("/v2/production-units/flock/$unitId")({
	validateSearch: (search: Record<string, unknown>) => ({
		eventType:
			typeof search.eventType === "string" ? search.eventType : undefined,
	}),
	component: ProductionUnitFlockPage,
});

function ProductionUnitFlockPage() {
	const { unitId } = Route.useParams();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	const handleEventTypeFilterChange = (next: LivestockEventType | "all") => {
		void navigate({
			replace: true,
			resetScroll: false,
			search: (previous) => ({
				...previous,
				eventType: next === "all" ? undefined : next,
			}),
		});
	};

	return (
		<FlockDetailPage
			unitId={unitId}
			eventTypeFilter={search.eventType}
			onEventTypeFilterChange={handleEventTypeFilterChange}
		/>
	);
}
