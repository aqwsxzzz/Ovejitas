import { useCallback, useState } from "react";

import { getMaterialActionErrorMessage } from "@/features/inventory/components/material-action-utils";
import { useCreateMaterialConsumptionByFarmId } from "@/features/livestock/api/livestock-queries";

import { formatNextDayHint, formatRemainingDuration } from "./formatters";
import type { ManualFeedingFormState } from "./types";
import { validateProfileInputsForSubmission } from "./validation";

interface UseManualFeedingSubmitArgs {
	farmId: string;
	consumerAssetId: number;
	consumerAssetName: string;
	form: ManualFeedingFormState;
	effectiveCountForSelectedMaterial: number;
	effectiveLatestFeedAtForSelectedMaterial: string | null;
	onFeedSuccess: (materialAssetId: number, occurredAtIso: string) => void;
}

export function useManualFeedingSubmit({
	farmId,
	consumerAssetId,
	consumerAssetName,
	form,
	effectiveCountForSelectedMaterial,
	effectiveLatestFeedAtForSelectedMaterial,
	onFeedSuccess,
}: UseManualFeedingSubmitArgs) {
	const [feedError, setFeedError] = useState<string | null>(null);
	const [lastFeedAtIso, setLastFeedAtIso] = useState<string | null>(null);
	const [needsExtraFeedConfirmation, setNeedsExtraFeedConfirmation] =
		useState(false);
	const [feedConfirmationMessage, setFeedConfirmationMessage] = useState<
		string | null
	>(null);

	const createMaterialConsumptionMutation =
		useCreateMaterialConsumptionByFarmId();

	const clearFeedState = useCallback(() => {
		setFeedError(null);
		setNeedsExtraFeedConfirmation(false);
		setFeedConfirmationMessage(null);
	}, []);

	const handleLogFeedingNow = useCallback(async () => {
		if (!farmId) return;

		setFeedError(null);
		const validated = validateProfileInputsForSubmission(form);
		if (!validated.ok) {
			setFeedError(validated.error);
			return;
		}

		const warningMessages: string[] = [];
		const maxFeedsPerDayLimit = Math.max(
			1,
			Math.floor(validated.data.maxFeedsPerDay),
		);
		const reachedDailyLimit =
			effectiveCountForSelectedMaterial >= maxFeedsPerDayLimit;

		if (reachedDailyLimit) {
			warningMessages.push(
				`Este material ya alcanzo ${effectiveCountForSelectedMaterial} registro(s) hoy, y tu limite configurado es ${maxFeedsPerDayLimit}. Proximo registro sugerido: ${formatNextDayHint(new Date())}.`,
			);
		}

		if (
			!reachedDailyLimit &&
			validated.data.minHoursBetweenFeeds > 0 &&
			effectiveLatestFeedAtForSelectedMaterial
		) {
			const now = new Date();
			const latest = new Date(effectiveLatestFeedAtForSelectedMaterial);
			const elapsedHours =
				(now.getTime() - latest.getTime()) / (1000 * 60 * 60);
			if (elapsedHours < validated.data.minHoursBetweenFeeds) {
				warningMessages.push(
					`Aun no se cumple el intervalo minimo entre alimentaciones. Tiempo restante sugerido: ${formatRemainingDuration(Math.max(0, validated.data.minHoursBetweenFeeds - elapsedHours))}.`,
				);
			}
		}

		if (warningMessages.length > 0 && !needsExtraFeedConfirmation) {
			setFeedConfirmationMessage(warningMessages.join(" "));
			setNeedsExtraFeedConfirmation(true);
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
			setNeedsExtraFeedConfirmation(false);
			setFeedConfirmationMessage(null);
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
		effectiveCountForSelectedMaterial,
		effectiveLatestFeedAtForSelectedMaterial,
		needsExtraFeedConfirmation,
		createMaterialConsumptionMutation,
		consumerAssetId,
		consumerAssetName,
		onFeedSuccess,
	]);

	return {
		feedError,
		lastFeedAtIso,
		needsExtraFeedConfirmation,
		feedConfirmationMessage,
		isSubmittingFeed: createMaterialConsumptionMutation.isPending,
		clearFeedState,
		handleLogFeedingNow,
	};
}
