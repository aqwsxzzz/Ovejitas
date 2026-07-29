import { useState } from "react";

import { useCreateEventByAssetId } from "@/features/livestock/api/livestock-queries";
import { getErrorMessage } from "@/features/crops/utils/crop-utils";

export interface CropExpensePayload {
	occurred_at: string;
	amount: number;
	currency_id?: number;
	category_id?: number | null;
	notes?: string | null;
}

export function useCropActions(farmId: string, cropId: string) {
	const [expenseError, setExpenseError] = useState<string | null>(null);

	const createEventMutation = useCreateEventByAssetId();

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
		expenseError,
		handleExpenseSubmit,
		isSubmittingExpense: createEventMutation.isPending,
	};
}
