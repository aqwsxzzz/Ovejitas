import { useState } from "react";

import {
	useCreateEventByAssetId,
	useCreateHarvestByAssetId,
} from "@/features/livestock/api/livestock-queries";
import type { IHarvestCreatePayload } from "@/features/livestock/api/livestock-api";
import { getErrorMessage } from "@/features/crops/utils/crop-utils";

export interface CropExpensePayload {
	occurred_at: string;
	amount: number;
	currency_id?: number;
	category_id?: number | null;
	notes?: string | null;
}

export function useCropActions(farmId: string, cropId: string) {
	const [harvestError, setHarvestError] = useState<string | null>(null);
	const [expenseError, setExpenseError] = useState<string | null>(null);

	const createHarvestMutation = useCreateHarvestByAssetId();
	const createEventMutation = useCreateEventByAssetId();

	const handleHarvestSubmit = async (payload: IHarvestCreatePayload) => {
		setHarvestError(null);
		try {
			await createHarvestMutation.mutateAsync({ farmId, assetId: cropId, data: payload });
		} catch (error) {
			setHarvestError(getErrorMessage(error, "No se pudo registrar la cosecha."));
		}
	};

	const handleExpenseSubmit = async (payload: CropExpensePayload) => {
		setExpenseError(null);
		try {
			await createEventMutation.mutateAsync({
				farmId,
				assetId: cropId,
				data: {
					type: "expense",
					occurred_at: payload.occurred_at,
					amount: payload.amount,
					currency_id: payload.currency_id,
					category_id: payload.category_id ?? undefined,
					notes: payload.notes ?? undefined,
				},
			});
		} catch (error) {
			setExpenseError(getErrorMessage(error, "No se pudo registrar el gasto."));
		}
	};

	return {
		harvestError,
		expenseError,
		handleHarvestSubmit,
		handleExpenseSubmit,
		isSubmittingHarvest: createHarvestMutation.isPending,
		isSubmittingExpense: createEventMutation.isPending,
	};
}
