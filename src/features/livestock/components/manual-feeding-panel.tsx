import { useCallback, useState } from "react";

import { ManualFeedingActionRow } from "@/features/livestock/components/manual-feeding/manual-feeding-action-row";
import { ManualFeedingFormSection } from "@/features/livestock/components/manual-feeding/manual-feeding-form-section";
import { ManualFeedingToggle } from "@/features/livestock/components/manual-feeding/manual-feeding-toggle";
import { ManualFeedingStats } from "@/features/livestock/components/manual-feeding/manual-feeding-stats";
import type { ManualFeedingPanelProps } from "@/features/livestock/components/manual-feeding/types";
import { useManualFeedingForm } from "@/features/livestock/components/manual-feeding/use-manual-feeding-form";
import { useManualFeedingMetrics } from "@/features/livestock/components/manual-feeding/use-manual-feeding-metrics";
import { useManualFeedingSubmit } from "@/features/livestock/components/manual-feeding/use-manual-feeding-submit";
import { SectionCard } from "@/components/common/section-card";
import { Separator } from "@/components/ui/separator";

export function ManualFeedingPanel({
	farmId,
	consumerAssetId,
	consumerAssetName,
}: ManualFeedingPanelProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const { form, updateField } = useManualFeedingForm();

	const selectedMaterialAssetId = Number(form.materialAssetId);
	const hasSelectedMaterial = Number.isInteger(selectedMaterialAssetId);

	const {
		isLoadingMaterials,
		materialOptions,
		selectedMaterial,
		selectedMaterialOnHand,
		todaysFeeds,
		applyOptimisticFeed,
	} = useManualFeedingMetrics({
		farmId,
		consumerAssetId,
		selectedMaterialAssetId,
		selectedUnit: form.unit,
		hasSelectedMaterial,
	});

	const { feedError, lastFeedAtIso, isSubmittingFeed, handleLogFeedingNow } =
		useManualFeedingSubmit({
			farmId,
			consumerAssetId,
			consumerAssetName,
			form,
			onFeedSuccess: applyOptimisticFeed,
		});

	const handleLogFeedingClick = useCallback(() => {
		void handleLogFeedingNow();
	}, [handleLogFeedingNow]);

	return (
		<SectionCard
			title="Alimentacion manual"
			description="Registra el alimento en el momento que lo das."
			action={
				<ManualFeedingToggle
					todayFeedCount={todaysFeeds.count}
					isExpanded={isExpanded}
					onToggle={() => setIsExpanded((current) => !current)}
				/>
			}
		>
			{isExpanded ? (
				<div className="flex flex-col gap-6">
					<ManualFeedingFormSection
						form={form}
						materialOptions={materialOptions}
						isLoadingMaterials={isLoadingMaterials}
						onFieldChange={updateField}
					/>

					<ManualFeedingActionRow
						onLogFeeding={handleLogFeedingClick}
						isSubmittingFeed={isSubmittingFeed}
					/>

					<Separator />

					<ManualFeedingStats
						selectedMaterialName={selectedMaterial?.name ?? null}
						selectedMaterialOnHand={selectedMaterialOnHand}
						unit={form.unit}
						totalForSelectedMaterialAndUnit={
							todaysFeeds.totalForSelectedMaterialAndUnit
						}
						lastFeedAtIso={lastFeedAtIso}
					/>

					{feedError ? (
						<p className="text-sm text-destructive">{feedError}</p>
					) : null}
				</div>
			) : null}
		</SectionCard>
	);
}
