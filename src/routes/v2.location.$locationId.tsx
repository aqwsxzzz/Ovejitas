import { createFileRoute } from "@tanstack/react-router";

import { LocationDetailPage } from "@/features/location/pages/location-detail-page";

export const Route = createFileRoute("/v2/location/$locationId")({
	component: LocationDetailRoute,
});

function LocationDetailRoute() {
	const { locationId } = Route.useParams();
	return <LocationDetailPage locationId={locationId} />;
}
