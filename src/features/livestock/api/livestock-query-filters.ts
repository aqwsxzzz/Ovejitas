import type {
	ILivestockIndividual,
	LivestockAssetKind,
	LivestockAssetMode,
	LivestockEventType,
	MaterialConsumptionReason,
} from "@/features/livestock/types/livestock-types";

export interface ListLivestockAssetsFilters {
	q?: string;
	sort?: string;
	dateFrom?: string;
	dateTo?: string;
	kind?: LivestockAssetKind;
	mode?: LivestockAssetMode;
	page?: number;
	pageSize?: number;
}

export interface ListIndividualsFilters {
	q?: string;
	sort?: string;
	status?: ILivestockIndividual["status"];
	dateFrom?: string;
	dateTo?: string;
	page?: number;
	pageSize?: number;
}

export interface ListEventsFilters {
	q?: string;
	sort?: string;
	type?: LivestockEventType;
	categoryId?: number;
	individualId?: number;
	page?: number;
	pageSize?: number;
}

export interface ListEventCategoriesFilters {
	q?: string;
	sort?: string;
	type?: LivestockEventType;
	archived?: boolean;
	page?: number;
	pageSize?: number;
}

export interface ListMaterialPurchasesFilters {
	materialAssetId?: number;
	from?: string;
	to?: string;
	page?: number;
	pageSize?: number;
}

export interface ListMaterialConsumptionsFilters {
	materialAssetId?: number;
	consumerAssetId?: number;
	reason?: MaterialConsumptionReason;
	from?: string;
	to?: string;
	page?: number;
	pageSize?: number;
}
