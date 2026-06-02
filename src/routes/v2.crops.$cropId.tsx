import { createFileRoute } from "@tanstack/react-router";

import { CropDetailPage } from "@/features/crops/pages/crop-detail-page";

export const Route = createFileRoute("/v2/crops/$cropId")({
	component: CropDetailRoute,
});

function CropDetailRoute() {
	const { cropId } = Route.useParams();
	return <CropDetailPage cropId={cropId} />;
}
