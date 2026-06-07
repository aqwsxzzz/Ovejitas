import { useCallback } from "react";

import { ManualFeedingActionRow } from "@/features/livestock/components/manual-feeding/manual-feeding-action-row";
import { ManualFeedingConfirmation } from "@/features/livestock/components/manual-feeding/manual-feeding-confirmation";
import { ManualFeedingFormSection } from "@/features/livestock/components/manual-feeding/manual-feeding-form-section";
import { ManualFeedingHeader } from "@/features/livestock/components/manual-feeding/manual-feeding-header";
import { ManualFeedingStats } from "@/features/livestock/components/manual-feeding/manual-feeding-stats";
import type { ManualFeedingPanelProps } from "@/features/livestock/components/manual-feeding/types";
import { useManualFeedingMetrics } from "@/features/livestock/components/manual-feeding/use-manual-feeding-metrics";
import { useManualFeedingProfile } from "@/features/livestock/components/manual-feeding/use-manual-feeding-profile";
import { useManualFeedingSubmit } from "@/features/livestock/components/manual-feeding/use-manual-feeding-submit";
import { Separator } from "@/components/ui/separator";

export function ManualFeedingPanel({
	farmId,
	consumerAssetId,
	consumerAssetName,
}: ManualFeedingPanelProps) {
	const profileStorageId = `${farmId}:${consumerAssetId}`;
	const { form, saveError, updateField, saveProfile, clearProfile } =
		useManualFeedingProfile(farmId, profileStorageId);

	const selectedMaterialAssetId = Number(form.materialAssetId);
	const hasSelectedMaterial = Number.isInteger(selectedMaterialAssetId);

	const {
		isLoadingMaterials,
		materialOptions,
		selectedMaterial,
		selectedMaterialOnHand,
		todaysFeeds,
		effectiveCountForSelectedMaterial,
		effectiveLatestFeedAtForSelectedMaterial,
		applyOptimisticFeed,
	} = useManualFeedingMetrics({
		farmId,
		consumerAssetId,
		selectedMaterialAssetId,
		selectedUnit: form.unit,
		hasSelectedMaterial,
	});

	const {
		feedError,
		lastFeedAtIso,
		needsExtraFeedConfirmation,
		feedConfirmationMessage,
		isSubmittingFeed,
		clearFeedState,
		handleLogFeedingNow,
	} = useManualFeedingSubmit({
		farmId,
		consumerAssetId,
		consumerAssetName,
		form,
		effectiveCountForSelectedMaterial,
		effectiveLatestFeedAtForSelectedMaterial,
		onFeedSuccess: applyOptimisticFeed,
	});

	const handleFieldChange = useCallback(
		<K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
			updateField(field, value);
			clearFeedState();
		},
		[updateField, clearFeedState],
	);

	const handleLogFeedingClick = useCallback(() => {
		void handleLogFeedingNow();
	}, [handleLogFeedingNow]);

	const handleClearProfile = useCallback(() => {
		clearProfile();
		clearFeedState();
	}, [clearProfile, clearFeedState]);

	return (
		<div className="v2-card p-4 flex flex-col gap-8">
			<ManualFeedingHeader todayFeedCount={todaysFeeds.count} />

			<ManualFeedingFormSection
				form={form}
				materialOptions={materialOptions}
				isLoadingMaterials={isLoadingMaterials}
				onFieldChange={handleFieldChange}
			/>

			<ManualFeedingActionRow
				onSaveProfile={saveProfile}
				onClearProfile={handleClearProfile}
				onLogFeeding={handleLogFeedingClick}
				isSubmittingFeed={isSubmittingFeed}
			/>

			<Separator />

			<ManualFeedingConfirmation
				isVisible={needsExtraFeedConfirmation}
				message={feedConfirmationMessage}
				isSubmittingFeed={isSubmittingFeed}
				onConfirm={handleLogFeedingClick}
				onCancel={clearFeedState}
			/>

			<ManualFeedingStats
				selectedMaterialName={selectedMaterial?.name ?? null}
				selectedMaterialOnHand={selectedMaterialOnHand}
				unit={form.unit}
				totalForSelectedMaterialAndUnit={
					todaysFeeds.totalForSelectedMaterialAndUnit
				}
				lastFeedAtIso={lastFeedAtIso}
			/>

			{saveError ? (
				<p className="mt-2 text-sm text-destructive">{saveError}</p>
			) : null}
			{feedError ? (
				<p className="mt-2 text-sm text-destructive">{feedError}</p>
			) : null}
		</div>
	);
}
