import { createFileRoute } from "@tanstack/react-router";

import { EquipmentDetailPage } from "@/features/equipment/pages/equipment-detail-page";

export const Route = createFileRoute("/v2/equipment/$equipmentId")({
	component: EquipmentDetailRoute,
});

function EquipmentDetailRoute() {
	const { equipmentId } = Route.useParams();
	return <EquipmentDetailPage equipmentId={equipmentId} />;
}
