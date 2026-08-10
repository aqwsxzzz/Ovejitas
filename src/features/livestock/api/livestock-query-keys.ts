import type {
	ListEventCategoriesFilters,
	ListEventsFilters,
	ListIndividualsFilters,
	ListLivestockAssetsFilters,
	ListMaterialConsumptionsFilters,
	ListMaterialPurchasesFilters,
} from "@/features/livestock/api/livestock-query-filters";

export const livestockQueryKeys = {
	all: ["livestock"] as const,
	assetsByFarm: (farmId: string, filters?: ListLivestockAssetsFilters) =>
		[
			...livestockQueryKeys.all,
			"assetsByFarm",
			farmId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.dateFrom ?? "",
			filters?.dateTo ?? "",
			filters?.kind ?? "",
			filters?.mode ?? "",
			filters?.page ?? 1,
			filters?.pageSize ?? 20,
		] as const,
	assetById: (farmId: string, assetId: number) =>
		[...livestockQueryKeys.all, "assetById", farmId, assetId] as const,
	assetSummary: (farmId: string) =>
		[...livestockQueryKeys.all, "assetSummary", farmId] as const,
	individualsByAsset: (
		farmId: string,
		assetId: string,
		filters?: ListIndividualsFilters,
	) =>
		[
			...livestockQueryKeys.all,
			"individualsByAsset",
			farmId,
			assetId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.status ?? "",
			filters?.dateFrom ?? "",
			filters?.dateTo ?? "",
			filters?.page ?? 1,
			filters?.pageSize ?? 20,
		] as const,
	individualById: (farmId: string, assetId: string, individualId: string) =>
		[
			...livestockQueryKeys.all,
			"individualById",
			farmId,
			assetId,
			individualId,
		] as const,
	eventsByAsset: (
		farmId: string,
		assetId: string,
		filters?: ListEventsFilters,
	) =>
		[
			...livestockQueryKeys.all,
			"eventsByAsset",
			farmId,
			assetId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.type ?? "",
			filters?.categoryId ?? "",
			filters?.individualId ?? "",
			filters?.page ?? 1,
			filters?.pageSize ?? 20,
		] as const,
	eventsByAssetInfinite: (
		farmId: string,
		assetId: string,
		filters?: Omit<ListEventsFilters, "page" | "pageSize">,
		pageSize = 20,
	) =>
		[
			...livestockQueryKeys.all,
			"eventsByAssetInfinite",
			farmId,
			assetId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.type ?? "",
			filters?.categoryId ?? "",
			filters?.individualId ?? "",
			pageSize,
		] as const,
	inventoryBalanceByAsset: (farmId: string, assetId: string) =>
		[
			...livestockQueryKeys.all,
			"inventoryBalanceByAsset",
			farmId,
			assetId,
		] as const,
	materialPurchases: (farmId: string, filters?: ListMaterialPurchasesFilters) =>
		[
			...livestockQueryKeys.all,
			"materialPurchases",
			farmId,
			filters?.materialAssetId ?? "",
			filters?.from ?? "",
			filters?.to ?? "",
			filters?.page ?? 1,
			filters?.pageSize ?? 20,
		] as const,
	materialPurchaseById: (farmId: string, purchaseId: number) =>
		[
			...livestockQueryKeys.all,
			"materialPurchaseById",
			farmId,
			purchaseId,
		] as const,
	materialConsumptions: (
		farmId: string,
		filters?: ListMaterialConsumptionsFilters,
	) =>
		[
			...livestockQueryKeys.all,
			"materialConsumptions",
			farmId,
			filters?.materialAssetId ?? "",
			filters?.consumerAssetId ?? "",
			filters?.reason ?? "",
			filters?.from ?? "",
			filters?.to ?? "",
			filters?.page ?? 1,
			filters?.pageSize ?? 20,
		] as const,
	materialConsumptionById: (farmId: string, consumptionId: number) =>
		[
			...livestockQueryKeys.all,
			"materialConsumptionById",
			farmId,
			consumptionId,
		] as const,
	eventCategoriesByFarm: (
		farmId: string,
		filters?: ListEventCategoriesFilters,
	) =>
		[
			...livestockQueryKeys.all,
			"eventCategoriesByFarm",
			farmId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.type ?? "",
			filters?.archived ?? false,
			filters?.page ?? 1,
			filters?.pageSize ?? 100,
		] as const,
};
