import { useMemo } from "react";

import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { useGetLivestockAssetById } from "@/features/livestock/api/livestock-queries";
import { ManualFeedingPanel } from "@/features/livestock/components/manual-feeding-panel";

import { CoopLayingRateCard } from "./coop-laying-rate-card";
import type { FlockDetailPageProps } from "./flock-detail-types";
import { FlockEventsSection } from "./flock-events-section";
import { FlockHeaderCard } from "./flock-header-card";
import { FlockHeadcountAdjustmentCard } from "./flock-headcount-adjustment-card";
import { FlockIndividualsSection } from "./flock-individuals-section";
import { FlockMaterialInventorySection } from "@/features/livestock/components/flock-detail/flock-material-inventory-section";
import { FlockNetMetricCard } from "./flock-net-metric-card";
import {
	FlockAssetNotFoundState,
	FlockLoadingAssetState,
	FlockSelectFarmState,
} from "./flock-page-states";
import { FlockProductionOverviewSection } from "./flock-production-overview-section";
import { useFlockBackNavigationGuard } from "./use-flock-back-navigation-guard";

export function FlockDetailPageContent({
	unitId,
	eventTypeFilter,
	onEventTypeFilterChange,
}: FlockDetailPageProps) {
	useFlockBackNavigationGuard();

	const { data: currentUser } = useGetUserProfile();
	const parsedAssetId = Number(unitId);
	const hasValidAssetId = Number.isInteger(parsedAssetId);
	const farmId = currentUser?.lastVisitedFarmId ?? "";

	const { data: asset, isFetching: isAssetFetching } = useGetLivestockAssetById(
		{
			farmId,
			assetId: parsedAssetId,
			enabled: hasValidAssetId && !!farmId,
		},
	);

	const assetFlags = useMemo(
		() => ({
			isAnimalAsset: asset?.kind === "animal",
			isMaterialAsset: asset?.kind === "material",
			isAggregatedAnimal:
				asset?.kind === "animal" && asset?.mode === "aggregated",
			isIndividualAnimal:
				asset?.kind === "animal" && asset?.mode !== "aggregated",
		}),
		[asset?.kind, asset?.mode],
	);

	if (!farmId) return <FlockSelectFarmState />;
	if (hasValidAssetId && !asset && isAssetFetching)
		return <FlockLoadingAssetState />;
	if (!asset) return <FlockAssetNotFoundState />;

	return (
		<section className="space-y-4">
			<FlockHeaderCard asset={asset} />

			{assetFlags.isMaterialAsset ? (
				<FlockMaterialInventorySection
					farmId={farmId}
					assetId={asset.id}
				/>
			) : null}

			{!assetFlags.isMaterialAsset ? (
				<FlockProductionOverviewSection
					farmId={farmId}
					assetId={parsedAssetId}
				/>
			) : null}

			<div className="grid gap-3 md:grid-cols-2">
				{assetFlags.isAggregatedAnimal ? (
					<FlockHeadcountAdjustmentCard
						farmId={farmId}
						unitId={unitId}
					/>
				) : null}
				<FlockNetMetricCard
					farmId={farmId}
					assetId={parsedAssetId}
					isMaterialAsset={assetFlags.isMaterialAsset}
				/>
			</div>

		{assetFlags.isAnimalAsset ? (
				<ManualFeedingPanel
					farmId={farmId}
					consumerAssetId={asset.id}
					consumerAssetName={asset.name}
				/>
			) : null}

			{assetFlags.isAggregatedAnimal ? (
				<CoopLayingRateCard
					farmId={farmId}
					asset={asset}
				/>
			) : null}

			<FlockEventsSection
				farmId={farmId}
				unitId={unitId}
				asset={asset}
				eventTypeFilter={eventTypeFilter}
				onEventTypeFilterChange={onEventTypeFilterChange}
			/>

			{assetFlags.isIndividualAnimal ? (
				<FlockIndividualsSection
					farmId={farmId}
					unitId={unitId}
					eventTypeFilter={eventTypeFilter}
				/>
			) : null}
		</section>
	);
}
