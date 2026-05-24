import { createFileRoute } from "@tanstack/react-router";

import { MaterialDetailPage } from "@/features/inventory/pages/material-detail-page";

export const Route = createFileRoute("/v2/inventory/materials/$materialId")({
	component: MaterialDetailRoute,
});

function MaterialDetailRoute() {
	const { materialId } = Route.useParams();
	return <MaterialDetailPage materialId={materialId} />;
}
