import { useMemo } from "react";

import {
	useListEventCategoriesByFarmId,
	useListLivestockAssetsByFarmId,
} from "@/features/livestock/api/livestock-queries";
import { useGetInventorySummaryReport } from "@/features/reports/api/reports-queries";

import { parseNumeric } from "./flock-detail-utils";

interface UseFlockMaterialActionsParams {
	farmId: string;
	assetId: number;
}

export function useFlockMaterialActions({
	farmId,
	assetId,
}: UseFlockMaterialActionsParams) {
	const { data: inventorySummaryReport } = useGetInventorySummaryReport(
		{ farmId, asset_id: assetId },
		!!farmId,
	);
	const { data: consumerAssetsResponse } = useListLivestockAssetsByFarmId({
		farmId,
		filters: { kind: "animal", pageSize: 100 },
		enabled: !!farmId,
	});
	const { data: incomeCategories } = useListEventCategoriesByFarmId({
		farmId,
		filters: { type: "income", archived: false, page: 1, pageSize: 100 },
		enabled: !!farmId,
	});

	const inventoryRows = useMemo(
		() =>
			(inventorySummaryReport?.data ?? []).map((row) => ({
				...row,
				onHand: parseNumeric(row.on_hand),
			})),
		[inventorySummaryReport],
	);
	const consumerAssets = useMemo(
		() =>
			(consumerAssetsResponse?.data ?? []).map((item) => ({
				id: item.id,
				name: item.name,
			})),
		[consumerAssetsResponse?.data],
	);
	const categoryOptions = useMemo(
		() =>
			(incomeCategories ?? []).map((category) => ({
				id: category.id,
				name: category.name,
			})),
		[incomeCategories],
	);
	const totalOnHand = useMemo(
		() => inventoryRows.reduce((sum, row) => sum + row.onHand, 0),
		[inventoryRows],
	);
	const inventoryStatus = useMemo<"ok" | "low" | "critical">(() => {
		if (!inventoryRows.length) return "critical";
		if (totalOnHand <= 0) return "critical";
		if (totalOnHand <= 10) return "low";
		return "ok";
	}, [inventoryRows.length, totalOnHand]);

	return {
		inventoryRows,
		consumerAssets,
		categoryOptions,
		inventoryStatus,
	};
}
