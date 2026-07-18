import { useMemo } from "react";

import {
	useCreateEventCategoryByFarmId,
	useListEventCategoriesByFarmId,
} from "@/features/livestock/api/livestock-queries";
import {
	useCreateProductionTargetByFarmId,
	useDeleteProductionTargetById,
	useListProductionTargetsByFarmId,
	useUpdateProductionTargetById,
} from "@/features/livestock/api/production-targets-queries";
import type {
	IAssetProductionTargetRead,
	ProductionTargetBasis,
	ProductionTargetPeriod,
} from "@/features/livestock/types/production-targets-types";

import type { CreateEventCategoryInput } from "@/features/livestock/components/event-category-select-field";

import { isTargetActive, todayISODate } from "./production-targets-utils";

export interface AddTargetInput {
	categoryId: number;
	basis: ProductionTargetBasis;
	expectedRate: string;
	period: ProductionTargetPeriod | null;
	effectiveFrom: string;
}

export function useAssetProductionTargets(farmId: string, assetId: number) {
	const { data: allTargets = [] } = useListProductionTargetsByFarmId({ farmId });
	const { data: categories = [] } = useListEventCategoriesByFarmId({
		farmId,
		filters: { type: "production", archived: false, pageSize: 100 },
		enabled: !!farmId,
	});

	const createMutation = useCreateProductionTargetByFarmId();
	const updateMutation = useUpdateProductionTargetById();
	const deleteMutation = useDeleteProductionTargetById();
	const createCategoryMutation = useCreateEventCategoryByFarmId();

	const today = todayISODate();
	const targets = useMemo(
		() =>
			allTargets.filter(
				(target) =>
					target.asset_id === assetId && isTargetActive(target, today),
			),
		[allTargets, assetId, today],
	);

	const categoryNameById = useMemo(
		() => new Map(categories.map((category) => [category.id, category.name])),
		[categories],
	);

	const addTarget = (input: AddTargetInput) =>
		createMutation.mutateAsync({
			farmId,
			data: {
				asset_id: assetId,
				category_id: input.categoryId,
				basis: input.basis,
				expected_rate: input.expectedRate,
				period: input.period,
				effective_from: input.effectiveFrom,
			},
		});

	// Correct the current target's rate. This is the one documented, unambiguous
	// write (PATCH expected_rate) — it avoids guessing at effective-window
	// boundary/overlap semantics the backend docs don't define. A forward-dated
	// rate change is done by adding a new target with a later effective_from.
	const adjustRate = (target: IAssetProductionTargetRead, expectedRate: string) =>
		updateMutation.mutateAsync({
			farmId,
			targetId: target.id,
			data: { expected_rate: expectedRate },
		});

	const archiveTarget = (target: IAssetProductionTargetRead) =>
		deleteMutation.mutateAsync({ farmId, targetId: target.id });

	// Create a production category inline so a first product can be defined
	// without leaving the flock detail view; returns the new category id.
	const createCategory = async (input: CreateEventCategoryInput) => {
		const created = await createCategoryMutation.mutateAsync({
			farmId,
			data: input,
		});
		return created.id;
	};

	return {
		targets,
		categories,
		categoryNameById,
		addTarget,
		adjustRate,
		archiveTarget,
		createCategory,
		isMutating:
			createMutation.isPending ||
			updateMutation.isPending ||
			deleteMutation.isPending,
	};
}
