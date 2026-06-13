import { useEffect, useMemo, useState } from "react";

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
	const [optimisticMaterialFeedAdds, setOptimisticMaterialFeedAdds] = useState<
		Record<number, number>
	>({});
	const [optimisticLastFeedAtByMaterial, setOptimisticLastFeedAtByMaterial] =
		useState<Record<number, string>>({});

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
		if (!hasSelectedMaterial) {
			return {
				count: rows.length,
				countForSelectedMaterial: 0,
				totalForSelectedMaterialAndUnit: 0,
				latestFeedAtForSelectedMaterial: null,
			};
		}

		const materialRows = rows.filter(
			(row) => row.material_asset_id === selectedMaterialAssetId,
		);
		const totalForSelectedMaterialAndUnit = materialRows.reduce((sum, row) => {
			if (row.unit !== selectedUnit) return sum;
			const consumed = Number(row.quantity);
			return Number.isFinite(consumed) ? sum + consumed : sum;
		}, 0);
		const latestFeedAtForSelectedMaterial = materialRows
			.map((row) => row.occurred_at)
			.reduce<string | null>((latest, current) => {
				if (!latest) return current;
				return new Date(current).getTime() > new Date(latest).getTime()
					? current
					: latest;
			}, null);

		return {
			count: rows.length,
			countForSelectedMaterial: materialRows.length,
			totalForSelectedMaterialAndUnit,
			latestFeedAtForSelectedMaterial,
		};
	}, [
		todaysFeedingResponse?.data,
		hasSelectedMaterial,
		selectedMaterialAssetId,
		selectedUnit,
	]);

	useEffect(() => {
		setOptimisticMaterialFeedAdds({});
		setOptimisticLastFeedAtByMaterial({});
	}, [todaysFeedingResponse?.data]);

	const effectiveCountForSelectedMaterial = useMemo(() => {
		if (!hasSelectedMaterial) return 0;
		return (
			todaysFeeds.countForSelectedMaterial +
			(optimisticMaterialFeedAdds[selectedMaterialAssetId] ?? 0)
		);
	}, [
		hasSelectedMaterial,
		todaysFeeds.countForSelectedMaterial,
		optimisticMaterialFeedAdds,
		selectedMaterialAssetId,
	]);

	const effectiveLatestFeedAtForSelectedMaterial = useMemo(() => {
		if (!hasSelectedMaterial) return null;
		const serverLatest = todaysFeeds.latestFeedAtForSelectedMaterial;
		const optimisticLatest =
			optimisticLastFeedAtByMaterial[selectedMaterialAssetId] ?? null;
		if (!serverLatest) return optimisticLatest;
		if (!optimisticLatest) return serverLatest;
		return new Date(optimisticLatest).getTime() >
			new Date(serverLatest).getTime()
			? optimisticLatest
			: serverLatest;
	}, [
		hasSelectedMaterial,
		todaysFeeds.latestFeedAtForSelectedMaterial,
		optimisticLastFeedAtByMaterial,
		selectedMaterialAssetId,
	]);

	function applyOptimisticFeed(materialAssetId: number, occurredAtIso: string) {
		setOptimisticMaterialFeedAdds((current) => ({
			...current,
			[materialAssetId]: (current[materialAssetId] ?? 0) + 1,
		}));
		setOptimisticLastFeedAtByMaterial((current) => ({
			...current,
			[materialAssetId]: occurredAtIso,
		}));
	}

	return {
		isLoadingMaterials,
		materialOptions,
		selectedMaterial,
		selectedMaterialOnHand,
		todaysFeeds,
		effectiveCountForSelectedMaterial,
		effectiveLatestFeedAtForSelectedMaterial,
		applyOptimisticFeed,
	};
}
