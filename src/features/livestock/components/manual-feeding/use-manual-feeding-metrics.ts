import { useMemo } from "react";

import {
	useListLivestockAssetsByFarmId,
	useListMaterialConsumptionsByFarmId,
} from "@/features/livestock/api/livestock-queries";
import { useGetInventorySummaryReport } from "@/features/reports/api/reports-queries";
import { toDateParam } from "@/lib/datetime";

import type { TodaysFeedMetrics } from "./types";

interface UseManualFeedingMetricsArgs {
	farmId: string;
	consumerAssetId: number;
	selectedMaterialAssetId: number;
	selectedUnit: string;
	hasSelectedMaterial: boolean;
}

export function useManualFeedingMetrics({
	farmId,
	consumerAssetId,
	selectedMaterialAssetId,
	selectedUnit,
	hasSelectedMaterial,
}: UseManualFeedingMetricsArgs) {
	const { data: materialAssetsResponse, isLoading: isLoadingMaterials } =
		useListLivestockAssetsByFarmId({
			farmId,
			filters: { kind: "material", page: 1, pageSize: 100 },
			enabled: !!farmId,
		});

	const { data: selectedMaterialInventory } = useGetInventorySummaryReport(
		{
			farmId,
			asset_id: hasSelectedMaterial ? selectedMaterialAssetId : undefined,
		},
		!!farmId && hasSelectedMaterial,
	);

	// Today as a bare date on both ends: the backend reads a naive bound as the
	// farm's wall clock and rolls `to` to the next farm-local midnight, so this
	// covers exactly the farm's today whatever the hour.
	const today = useMemo(() => toDateParam(), []);

	const { data: todaysFeedingResponse } = useListMaterialConsumptionsByFarmId({
		farmId,
		filters: {
			consumerAssetId,
			reason: "feeding",
			from: today,
			to: today,
			page: 1,
			pageSize: 100,
		},
		enabled: !!farmId,
	});

	const materialOptions = useMemo(
		() => materialAssetsResponse?.data ?? [],
		[materialAssetsResponse?.data],
	);

	const selectedMaterial = useMemo(
		() => materialOptions.find((asset) => asset.id === selectedMaterialAssetId),
		[materialOptions, selectedMaterialAssetId],
	);

	const selectedMaterialOnHand = useMemo(() => {
		if (!selectedMaterialInventory?.data?.length) return null;
		return selectedMaterialInventory.data.reduce((sum, row) => {
			const onHand = Number(row.on_hand);
			return Number.isFinite(onHand) ? sum + onHand : sum;
		}, 0);
	}, [selectedMaterialInventory?.data]);

	const todaysFeeds = useMemo<TodaysFeedMetrics>(() => {
		const rows = todaysFeedingResponse?.data ?? [];
		const totalForSelectedMaterialAndUnit = hasSelectedMaterial
			? rows.reduce((sum, row) => {
					if (
						row.material_asset_id !== selectedMaterialAssetId ||
						row.unit !== selectedUnit
					) {
						return sum;
					}
					const consumed = Number(row.quantity);
					return Number.isFinite(consumed) ? sum + consumed : sum;
				}, 0)
			: 0;

		return {
			count: rows.length,
			totalForSelectedMaterialAndUnit,
		};
	}, [
		todaysFeedingResponse?.data,
		hasSelectedMaterial,
		selectedMaterialAssetId,
		selectedUnit,
	]);

	return {
		isLoadingMaterials,
		materialOptions,
		selectedMaterial,
		selectedMaterialOnHand,
		todaysFeeds,
	};
}
