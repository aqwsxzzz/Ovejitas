import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	useGetAggregateReport,
	useGetProfitabilityReport,
} from "@/features/reports/api/reports-queries";
import {
	useGetLivestockAssetById,
	useListEventCategoriesByFarmId,
} from "@/features/livestock/api/livestock-queries";

export function useCropData(cropId: string) {
	const parsedAssetId = Number(cropId);
	const hasValidAssetId = Number.isInteger(parsedAssetId);
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";
	const enabled = !!farmId && hasValidAssetId;

	const assetQuery = useGetLivestockAssetById({
		farmId,
		assetId: parsedAssetId,
		enabled,
	});
	const asset = assetQuery.data;

	const linkedProduceQuery = useGetLivestockAssetById({
		farmId,
		assetId: asset?.produce_asset_id ?? Number.NaN,
		enabled: !!farmId && asset?.produce_asset_id != null,
	});

	const profitabilityQuery = useGetProfitabilityReport(
		{ farmId, asset_id: parsedAssetId },
		enabled,
	);

	const productionAggregateQuery = useGetAggregateReport(
		{ farmId, type: "production", bucket: "month", asset_id: parsedAssetId },
		enabled,
	);

	const expenseCategoriesQuery = useListEventCategoriesByFarmId({
		farmId,
		filters: { type: "expense", archived: false, page: 1, pageSize: 100 },
		enabled: !!farmId,
	});

	const produceName =
		asset?.produce_asset_id == null
			? null
			: linkedProduceQuery.isLoading
				? `#${asset.produce_asset_id}`
				: (linkedProduceQuery.data?.name ?? `#${asset.produce_asset_id}`);

	return {
		farmId,
		hasValidAssetId,
		asset,
		isLoadingAsset: assetQuery.isLoading,
		produceName,
		profitabilityQuery,
		profitabilityTotals: profitabilityQuery.data?.totals ?? [],
		productionAggregateQuery,
		productionRows: productionAggregateQuery.data?.data ?? [],
		categories: expenseCategoriesQuery.data ?? [],
	};
}
