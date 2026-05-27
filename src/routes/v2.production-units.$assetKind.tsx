import { createFileRoute } from "@tanstack/react-router";

import { isLivestockAssetKind } from "@/features/livestock/constants/asset-kind-options";
import { LivestockKindPage } from "@/features/livestock/pages/livestock-kind-page";

export const Route = createFileRoute("/v2/production-units/$assetKind")({
	component: ProductionUnitKindPage,
});

function ProductionUnitKindPage() {
	const { assetKind } = Route.useParams();

	if (!isLivestockAssetKind(assetKind)) {
		return <LivestockKindPage selectedKind="animal" />;
	}

	return <LivestockKindPage selectedKind={assetKind} />;
}
