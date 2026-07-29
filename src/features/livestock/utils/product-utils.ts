import type { ILivestockEventCategory } from "@/features/livestock/types/livestock-types";

/**
 * A product is a `production` event category, and it owns the produce pool that
 * holds its stock (`category.produce_asset_id`, provisioned by the backend).
 *
 * Producer assets still store their default product the other way round — as a
 * pool id in `asset.produce_asset_id` — so reading a saved default back into a
 * product picker means walking the categories to find the one owning that pool.
 */
export function findCategoryIdByPool(
	categories: ILivestockEventCategory[],
	produceAssetId: number | null | undefined,
): string {
	if (produceAssetId == null) return "";
	const owner = categories.find(
		(category) => category.produce_asset_id === produceAssetId,
	);
	return owner ? String(owner.id) : "";
}

/** The pool a product's stock lands in, for fields that store a pool id. */
export function findPoolIdByCategory(
	categories: ILivestockEventCategory[],
	categoryId: string,
): number | null {
	const category = categories.find(
		(candidate) => String(candidate.id) === categoryId,
	);
	return category?.produce_asset_id ?? null;
}
