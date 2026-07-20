import { useMemo } from "react";

import {
	useListLivestockAssetsByFarmId,
	useListMaterialConsumptionsByFarmId,
} from "@/features/livestock/api/livestock-queries";
import { useGetInventorySummaryReport } from "@/features/reports/api/reports-queries";

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

	const { startOfTodayIso, endOfTodayIso } = useMemo(() => {
		const now = new Date();
		const start = new Date(now);
		start.setHours(0, 0, 0, 0);

		const end = new Date(now);
		end.setHours(23, 59, 59, 999);

		return {
			startOfTodayIso: start.toISOString(),
			endOfTodayIso: end.toISOString(),
		};
	}, []);

	const { data: todaysFeedingResponse } = useListMaterialConsumptionsByFarmId({
		farmId,
		filters: {
			consumerAssetId,
			reason: "feeding",
			from: startOfTodayIso,
			to: endOfTodayIso,
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
