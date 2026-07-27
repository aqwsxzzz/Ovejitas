import { useState } from "react";
import { toast } from "sonner";

import {
	useCreateEventCategoryByFarmId,
	useCreateHarvestByAssetId,
	useListEventCategoriesByFarmId,
	useListLivestockAssetsByFarmId,
} from "@/features/livestock/api/livestock-queries";
import type { IHarvestCreatePayload } from "@/features/livestock/api/livestock-api";
import type { CreateEventCategoryInput } from "@/features/livestock/components/event-category-select-field";
import { getMaterialActionErrorMessage } from "@/features/inventory/components/material-action-utils";

interface UseHarvestArgs {
	farmId: string;
	producerAssetId: number;
	enabled: boolean;
}

export function useHarvest({
	farmId,
	producerAssetId,
	enabled,
}: UseHarvestArgs) {
	const [error, setError] = useState<string | null>(null);

	// Harvest MUST deposit into a `produce` asset — a material target is rejected 422.
	const materialsQuery = useListLivestockAssetsByFarmId({
		farmId,
		filters: { kind: "produce", page: 1, pageSize: 100 },
		enabled: enabled && !!farmId,
	});
	const { data: categories = [] } = useListEventCategoriesByFarmId({
		farmId,
		filters: { type: "production", archived: false, pageSize: 100 },
		enabled: enabled && !!farmId,
	});

	const harvestMutation = useCreateHarvestByAssetId();
	const createCategoryMutation = useCreateEventCategoryByFarmId();

	const submit = async (payload: IHarvestCreatePayload): Promise<boolean> => {
		setError(null);
		try {
			await harvestMutation.mutateAsync({
				farmId,
				assetId: String(producerAssetId),
				data: payload,
			});
			toast.success("Producción registrada");
			return true;
		} catch (caught) {
			setError(
				getMaterialActionErrorMessage(
					caught,
					"No se pudo registrar la cosecha.",
				),
			);
			return false;
		}
	};

	const createCategory = async (input: CreateEventCategoryInput) => {
		const created = await createCategoryMutation.mutateAsync({
			farmId,
			data: input,
		});
		return created.id;
	};

	return {
		produceAssets: (materialsQuery.data?.data ?? []).map((asset) => ({
			id: asset.id,
			name: asset.name,
		})),
		categories,
		error,
		isSubmitting: harvestMutation.isPending,
		submit,
		createCategory,
	};
}
