import { useCallback, useState } from "react";

import { getMaterialActionErrorMessage } from "@/features/inventory/components/material-action-utils";
import { useCreateMaterialConsumptionByFarmId } from "@/features/livestock/api/livestock-queries";

import type { ManualFeedingFormState } from "./types";
import { validateFeedingInputs } from "./validation";

interface UseManualFeedingSubmitArgs {
	farmId: string;
	consumerAssetId: number;
	consumerAssetName: string;
	form: ManualFeedingFormState;
	onFeedSuccess: (materialAssetId: number, occurredAtIso: string) => void;
}

export function useManualFeedingSubmit({
	farmId,
	consumerAssetId,
	consumerAssetName,
	form,
	onFeedSuccess,
}: UseManualFeedingSubmitArgs) {
	const [feedError, setFeedError] = useState<string | null>(null);
	const [lastFeedAtIso, setLastFeedAtIso] = useState<string | null>(null);

	const createMaterialConsumptionMutation =
		useCreateMaterialConsumptionByFarmId();

	const handleLogFeedingNow = useCallback(async () => {
		if (!farmId) return;

		setFeedError(null);
		const validated = validateFeedingInputs(form);
		if (!validated.ok) {
			setFeedError(validated.error);
			return;
		}

		try {
			const occurredAtIso = new Date().toISOString();
			await createMaterialConsumptionMutation.mutateAsync({
				farmId,
				data: {
					material_asset_id: validated.data.materialAssetId,
					consumer_asset_id: consumerAssetId,
					individual_id: null,
					occurred_at: occurredAtIso,
					quantity: validated.data.quantity,
					unit: form.unit,
					reason: "feeding",
					notes: `Registro rapido desde ${consumerAssetName}`,
					idempotency_key: crypto.randomUUID(),
				},
			});
			onFeedSuccess(validated.data.materialAssetId, occurredAtIso);
			setLastFeedAtIso(occurredAtIso);
			setFeedError(null);
		} catch (error) {
			setFeedError(
				getMaterialActionErrorMessage(
					error,
					"No se pudo registrar la alimentacion del activo.",
				),
			);
		}
	}, [
		farmId,
		form,
		createMaterialConsumptionMutation,
		consumerAssetId,
		consumerAssetName,
		onFeedSuccess,
	]);

	return {
		feedError,
		lastFeedAtIso,
		isSubmittingFeed: createMaterialConsumptionMutation.isPending,
		handleLogFeedingNow,
	};
}
