import { axiosHelper } from "@/lib/axios/axios-helper";
import { EVENT_UNITS } from "@/shared/types/unit-types";
import type {
	ILivestockAsset,
	ILivestockEvent,
	ILivestockAssetListResponse,
	ILivestockEventCategoryListResponse,
	ILivestockEventListResponse,
	ILivestockIndividual,
	ILivestockIndividualListResponse,
	IInventoryBalance,
	IMaterialPurchaseRead,
	IMaterialPurchaseListResponse,
	IMaterialConsumptionRead,
	IMaterialConsumptionListResponse,
	IMaterialSaleRead,
	MaterialConsumptionReason,
	LivestockEventType,
	LivestockEventUnit,
	LivestockAssetKind,
	LivestockAssetMode,
	ReportBucket,
	IProfitabilityReport,
	IProductionReport,
	ICostPerUnitReport,
} from "@/features/livestock/types/livestock-types";

interface ListLivestockAssetsFilters {
	q?: string;
	sort?: string;
	dateFrom?: string;
	dateTo?: string;
	kind?: LivestockAssetKind;
	mode?: LivestockAssetMode;
	page?: number;
	pageSize?: number;
}

interface ListIndividualsFilters {
	q?: string;
	sort?: string;
	status?: ILivestockIndividual["status"];
	dateFrom?: string;
	dateTo?: string;
	page?: number;
	pageSize?: number;
}

interface ListEventsFilters {
	q?: string;
	sort?: string;
	type?: LivestockEventType;
	categoryId?: number;
	individualId?: number;
	page?: number;
	pageSize?: number;
}

interface ListEventCategoriesFilters {
	q?: string;
	sort?: string;
	type?: LivestockEventType;
	archived?: boolean;
	page?: number;
	pageSize?: number;
}

interface ListMaterialPurchasesFilters {
	materialAssetId?: number;
	from?: string;
	to?: string;
	page?: number;
	pageSize?: number;
}

interface ListMaterialConsumptionsFilters {
	materialAssetId?: number;
	consumerAssetId?: number;
	reason?: MaterialConsumptionReason;
	from?: string;
	to?: string;
	page?: number;
	pageSize?: number;
}

export interface IFlockActionRead {
	inventory_event_id: number;
	paired_event_id: number | null;
	headcount: string;
}

export interface IFlockAcquisitionCreatePayload {
	occurred_at?: string;
	quantity: number;
	amount?: number | null;
}

export interface IFlockSaleCreatePayload {
	occurred_at?: string;
	quantity: number;
	amount: number;
	buyer?: string | null;
}

export interface IFlockMortalityCreatePayload {
	occurred_at?: string;
	quantity: number;
	cause?: string | null;
}

export interface IMaterialPurchaseCreatePayload {
	material_asset_id: number;
	occurred_at: string;
	quantity: number;
	unit: LivestockEventUnit;
	amount: number;
	supplier?: string | null;
	notes?: string | null;
	meta?: Record<string, unknown>;
	idempotency_key?: string | null;
}

export interface IMaterialPurchaseUpdatePayload {
	occurred_at?: string | null;
	quantity?: number | null;
	unit?: LivestockEventUnit | null;
	amount?: number | null;
	supplier?: string | null;
	notes?: string | null;
	meta?: Record<string, unknown> | null;
}

export interface IMaterialConsumptionCreatePayload {
	material_asset_id: number;
	consumer_asset_id?: number | null;
	individual_id?: number | null;
	occurred_at: string;
	quantity: number;
	unit: LivestockEventUnit;
	reason: MaterialConsumptionReason;
	notes?: string | null;
	meta?: Record<string, unknown>;
	idempotency_key?: string | null;
}

export interface IMaterialConsumptionUpdatePayload {
	consumer_asset_id?: number | null;
	individual_id?: number | null;
	occurred_at?: string | null;
	quantity?: number | null;
	unit?: LivestockEventUnit | null;
	reason?: MaterialConsumptionReason | null;
	notes?: string | null;
	meta?: Record<string, unknown> | null;
}

export interface IMaterialSaleCreatePayload {
	occurred_at?: string;
	quantity: number;
	unit: LivestockEventUnit;
	amount: number;
	buyer?: string | null;
	category_id?: number | null;
	notes?: string | null;
}

export const listLivestockAssetsByFarmId = ({
	farmId,
	filters,
}: {
	farmId: string;
	filters?: ListLivestockAssetsFilters;
}) =>
	axiosHelper<ILivestockAssetListResponse>({
		method: "get",
		url: `/api/v1/farms/${farmId}/assets`,
		urlParams: {
			q: filters?.q,
			sort: filters?.sort,
			date_from: filters?.dateFrom,
			date_to: filters?.dateTo,
			kind: filters?.kind,
			mode: filters?.mode,
			page: filters?.page,
			page_size: filters?.pageSize,
		},
	});

export const getLivestockAssetById = ({
	farmId,
	assetId,
}: {
	farmId: string;
	assetId: number;
}) =>
	axiosHelper<ILivestockAsset>({
		method: "get",
		url: `/api/v1/farms/${farmId}/assets/${assetId}`,
	});

export const createLivestockAsset = ({
	farmId,
	data,
}: {
	farmId: string;
	data: {
		name: string;
		description?: string;
		kind?: LivestockAssetKind;
		location?: string;
		mode?: LivestockAssetMode;
	};
}) =>
	axiosHelper<ILivestockAsset>({
		method: "post",
		url: `/api/v1/farms/${farmId}/assets`,
		data,
	});

export const updateLivestockAssetById = ({
	farmId,
	assetId,
	data,
}: {
	farmId: string;
	assetId: number;
	data: Partial<{
		name: string | null;
		description: string | null;
		kind: LivestockAssetKind | null;
		location: string | null;
		mode: LivestockAssetMode | null;
	}>;
}) =>
	axiosHelper<ILivestockAsset>({
		method: "patch",
		url: `/api/v1/farms/${farmId}/assets/${assetId}`,
		data,
	});

export const deleteLivestockAssetById = ({
	farmId,
	assetId,
}: {
	farmId: string;
	assetId: number;
}) =>
	axiosHelper<void>({
		method: "delete",
		url: `/api/v1/farms/${farmId}/assets/${assetId}`,
	});

/** List individuals under an asset */
export const listIndividualsByAssetId = ({
	farmId,
	assetId,
	filters,
}: {
	farmId: string;
	assetId: string;
	filters?: ListIndividualsFilters;
}) =>
	axiosHelper<ILivestockIndividualListResponse>({
		method: "get",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/individuals`,
		urlParams: {
			q: filters?.q,
			sort: filters?.sort,
			status: filters?.status,
			date_from: filters?.dateFrom,
			date_to: filters?.dateTo,
			page: filters?.page,
			page_size: filters?.pageSize,
		},
	});

/** Get a single individual */
export const getIndividualById = ({
	farmId,
	assetId,
	individualId,
}: {
	farmId: string;
	assetId: string;
	individualId: string;
}) =>
	axiosHelper<ILivestockIndividual>({
		method: "get",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/individuals/${individualId}`,
	});

/** Create a new individual */
export const createIndividual = ({
	farmId,
	assetId,
	data,
}: {
	farmId: string;
	assetId: string;
	data: {
		name: string;
		tag?: string | null;
		birth_date?: string | null;
		mother_id?: number | null;
		father_id?: number | null;
		extra?: Record<string, unknown>;
	};
}) =>
	axiosHelper<ILivestockIndividual>({
		method: "post",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/individuals`,
		data,
	});

/** Update an individual */
export const updateIndividual = ({
	farmId,
	assetId,
	individualId,
	data,
}: {
	farmId: string;
	assetId: string;
	individualId: string;
	data: Partial<{
		name: string | null;
		tag: string | null;
		status: "active" | "sold" | "deceased" | "archived" | null;
		mother_id: number | null;
		father_id: number | null;
		extra: Record<string, unknown> | null;
	}>;
}) =>
	axiosHelper<ILivestockIndividual>({
		method: "patch",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/individuals/${individualId}`,
		data,
	});

/** Delete an individual */
export const deleteIndividual = ({
	farmId,
	assetId,
	individualId,
}: {
	farmId: string;
	assetId: string;
	individualId: string;
}) =>
	axiosHelper<void>({
		method: "delete",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/individuals/${individualId}`,
	});

export const listEventsByAssetId = ({
	farmId,
	assetId,
	filters,
}: {
	farmId: string;
	assetId: string;
	filters?: ListEventsFilters;
}) =>
	axiosHelper<ILivestockEventListResponse>({
		method: "get",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/events`,
		urlParams: {
			q: filters?.q,
			sort: filters?.sort,
			type: filters?.type,
			category_id: filters?.categoryId,
			individual_id: filters?.individualId,
			page: filters?.page,
			page_size: filters?.pageSize,
		},
	});

export const getInventoryBalanceByAssetId = ({
	farmId,
	assetId,
}: {
	farmId: string;
	assetId: string;
}) =>
	axiosHelper<IInventoryBalance>({
		method: "get",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/events/balance`,
	});

export const listMaterialPurchasesByFarmId = ({
	farmId,
	filters,
}: {
	farmId: string;
	filters?: ListMaterialPurchasesFilters;
}) =>
	axiosHelper<IMaterialPurchaseListResponse>({
		method: "get",
		url: `/api/v1/farms/${farmId}/material-purchases`,
		urlParams: {
			material_asset_id: filters?.materialAssetId,
			from: filters?.from,
			to: filters?.to,
			page: filters?.page,
			page_size: filters?.pageSize,
		},
	});

export const createMaterialPurchaseByFarmId = ({
	farmId,
	data,
}: {
	farmId: string;
	data: IMaterialPurchaseCreatePayload;
}) =>
	axiosHelper<IMaterialPurchaseRead>({
		method: "post",
		url: `/api/v1/farms/${farmId}/material-purchases`,
		data,
	});

export const getMaterialPurchaseById = ({
	farmId,
	purchaseId,
}: {
	farmId: string;
	purchaseId: number;
}) =>
	axiosHelper<IMaterialPurchaseRead>({
		method: "get",
		url: `/api/v1/farms/${farmId}/material-purchases/${purchaseId}`,
	});

export const updateMaterialPurchaseById = ({
	farmId,
	purchaseId,
	data,
}: {
	farmId: string;
	purchaseId: number;
	data: IMaterialPurchaseUpdatePayload;
}) =>
	axiosHelper<IMaterialPurchaseRead>({
		method: "patch",
		url: `/api/v1/farms/${farmId}/material-purchases/${purchaseId}`,
		data,
	});

export const deleteMaterialPurchaseById = ({
	farmId,
	purchaseId,
}: {
	farmId: string;
	purchaseId: number;
}) =>
	axiosHelper<void>({
		method: "delete",
		url: `/api/v1/farms/${farmId}/material-purchases/${purchaseId}`,
	});

export const listMaterialConsumptionsByFarmId = ({
	farmId,
	filters,
}: {
	farmId: string;
	filters?: ListMaterialConsumptionsFilters;
}) =>
	axiosHelper<IMaterialConsumptionListResponse>({
		method: "get",
		url: `/api/v1/farms/${farmId}/material-consumptions`,
		urlParams: {
			material_asset_id: filters?.materialAssetId,
			consumer_asset_id: filters?.consumerAssetId,
			reason: filters?.reason,
			from: filters?.from,
			to: filters?.to,
			page: filters?.page,
			page_size: filters?.pageSize,
		},
	});

export const createMaterialConsumptionByFarmId = ({
	farmId,
	data,
}: {
	farmId: string;
	data: IMaterialConsumptionCreatePayload;
}) =>
	axiosHelper<IMaterialConsumptionRead>({
		method: "post",
		url: `/api/v1/farms/${farmId}/material-consumptions`,
		data,
	});

export const getMaterialConsumptionById = ({
	farmId,
	consumptionId,
}: {
	farmId: string;
	consumptionId: number;
}) =>
	axiosHelper<IMaterialConsumptionRead>({
		method: "get",
		url: `/api/v1/farms/${farmId}/material-consumptions/${consumptionId}`,
	});

export const updateMaterialConsumptionById = ({
	farmId,
	consumptionId,
	data,
}: {
	farmId: string;
	consumptionId: number;
	data: IMaterialConsumptionUpdatePayload;
}) =>
	axiosHelper<IMaterialConsumptionRead>({
		method: "patch",
		url: `/api/v1/farms/${farmId}/material-consumptions/${consumptionId}`,
		data,
	});

export const deleteMaterialConsumptionById = ({
	farmId,
	consumptionId,
}: {
	farmId: string;
	consumptionId: number;
}) =>
	axiosHelper<void>({
		method: "delete",
		url: `/api/v1/farms/${farmId}/material-consumptions/${consumptionId}`,
	});

export const createMaterialSaleByAssetId = ({
	farmId,
	assetId,
	data,
}: {
	farmId: string;
	assetId: string;
	data: IMaterialSaleCreatePayload;
}) =>
	axiosHelper<IMaterialSaleRead>({
		method: "post",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/sales`,
		data,
	});

export const listEventCategoriesByFarmId = ({
	farmId,
	filters,
}: {
	farmId: string;
	filters?: ListEventCategoriesFilters;
}) =>
	axiosHelper<ILivestockEventCategoryListResponse>({
		method: "get",
		url: `/api/v1/farms/${farmId}/event-categories`,
		urlParams: {
			q: filters?.q,
			sort: filters?.sort,
			type: filters?.type,
			archived: filters?.archived,
			page: filters?.page,
			page_size: filters?.pageSize,
		},
	});

export const createEventCategoryByFarmId = ({
	farmId,
	data,
}: {
	farmId: string;
	data: {
		type: LivestockEventType;
		name: string;
		color?: string;
	};
}) =>
	axiosHelper<{
		id: number;
		farm_id: number;
		type: LivestockEventType;
		name: string;
		color: string | null;
		archived_at: string | null;
		created_at: string;
		updated_at: string;
	}>({
		method: "post",
		url: `/api/v1/farms/${farmId}/event-categories`,
		data,
	});

export const updateEventCategoryById = ({
	farmId,
	categoryId,
	data,
}: {
	farmId: string;
	categoryId: number;
	data: Partial<{
		name: string | null;
		color: string | null;
		archived_at: string | null;
	}>;
}) =>
	axiosHelper<{
		id: number;
		farm_id: number;
		type: LivestockEventType;
		name: string;
		color: string | null;
		archived_at: string | null;
		created_at: string;
		updated_at: string;
	}>({
		method: "patch",
		url: `/api/v1/farms/${farmId}/event-categories/${categoryId}`,
		data,
	});

export const deleteEventCategoryById = ({
	farmId,
	categoryId,
}: {
	farmId: string;
	categoryId: number;
}) =>
	axiosHelper<void>({
		method: "delete",
		url: `/api/v1/farms/${farmId}/event-categories/${categoryId}`,
	});

export type LivestockEventCreatePayload =
	| {
			type: "production";
			occurred_at: string;
			quantity: number;
			unit: LivestockEventUnit;
			category_id?: number;
			individual_id?: number;
			notes?: string;
			payload?: Record<string, unknown>;
			idempotency_key?: string;
	  }
	| {
			type: "expense" | "income";
			occurred_at: string;
			amount: number;
			currency?: string;
			category_id?: number;
			individual_id?: number;
			notes?: string;
			payload?: Record<string, unknown>;
			idempotency_key?: string;
	  }
	| {
			type: "observation";
			occurred_at: string;
			quantity?: number;
			unit?: LivestockEventUnit;
			category_id?: number;
			individual_id?: number;
			notes?: string;
			payload?: Record<string, unknown>;
			idempotency_key?: string;
	  }
	| {
			type: "acquisition";
			occurred_at: string;
			quantity: number;
			amount?: number;
			currency?: string;
			category_id?: number;
			individual_id?: number;
			notes?: string;
			payload?: Record<string, unknown>;
			idempotency_key?: string;
	  }
	| {
			type: "mortality";
			occurred_at: string;
			quantity: number;
			category_id?: number;
			individual_id?: number;
			notes?: string;
			payload?: Record<string, unknown>;
			idempotency_key?: string;
	  }
	| {
			type: "reproductive";
			occurred_at: string;
			individual_id: number;
			category_id?: number;
			notes?: string;
			payload?: Record<string, unknown>;
			idempotency_key?: string;
	  }
	| {
			type: "inventory";
			occurred_at: string;
			adjustment: "increment" | "decrement" | "reset";
			quantity: number;
			unit: LivestockEventUnit;
			category_id?: number;
			individual_id?: number;
			notes?: string;
			payload?: Record<string, unknown>;
			idempotency_key?: string;
	  };

export interface LivestockEventUpdatePayload {
	occurred_at?: string | null;
	individual_id?: number | null;
	category_id?: number | null;
	quantity?: number | null;
	unit?: LivestockEventUnit | null;
	amount?: number | null;
	adjustment?: "increment" | "decrement" | "reset" | null;
	notes?: string | null;
	payload?: Record<string, unknown> | null;
}

export const createEventByAssetId = ({
	farmId,
	assetId,
	data,
}: {
	farmId: string;
	assetId: string;
	data: LivestockEventCreatePayload;
}) =>
	axiosHelper<ILivestockEvent>({
		method: "post",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/events`,
		data,
	});

export const updateEventByAssetId = ({
	farmId,
	assetId,
	eventId,
	data,
}: {
	farmId: string;
	assetId: string;
	eventId: number;
	data: LivestockEventUpdatePayload;
}) =>
	axiosHelper<ILivestockEvent>({
		method: "patch",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/events/${eventId}`,
		data,
	});

export const deleteEventByAssetId = ({
	farmId,
	assetId,
	eventId,
}: {
	farmId: string;
	assetId: string;
	eventId: number;
}) =>
	axiosHelper<void>({
		method: "delete",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/events/${eventId}`,
	});

export const createFlockAcquisitionByAssetId = ({
	farmId,
	assetId,
	payload,
}: {
	farmId: string;
	assetId: string;
	payload: IFlockAcquisitionCreatePayload;
}) =>
	axiosHelper<IFlockActionRead>({
		method: "post",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/flock/acquisitions`,
		data: payload,
	});

export const createFlockSaleByAssetId = ({
	farmId,
	assetId,
	payload,
}: {
	farmId: string;
	assetId: string;
	payload: IFlockSaleCreatePayload;
}) =>
	axiosHelper<IFlockActionRead>({
		method: "post",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/flock/sales`,
		data: payload,
	});

export const createFlockMortalityByAssetId = ({
	farmId,
	assetId,
	payload,
}: {
	farmId: string;
	assetId: string;
	payload: IFlockMortalityCreatePayload;
}) =>
	axiosHelper<IFlockActionRead>({
		method: "post",
		url: `/api/v1/farms/${farmId}/assets/${assetId}/flock/mortalities`,
		data: payload,
	});

// --- Reports ---

interface ReportBaseFilters {
	assetId?: number;
	dateFrom?: string;
	dateTo?: string;
}

export const getProfitabilityReport = ({
	farmId,
	filters,
}: {
	farmId: string;
	filters?: ReportBaseFilters;
}) =>
	axiosHelper<IProfitabilityReport>({
		method: "get",
		url: `/api/v1/farms/${farmId}/reports/profitability`,
		urlParams: {
			asset_id: filters?.assetId,
			date_from: filters?.dateFrom,
			date_to: filters?.dateTo,
		},
	});

interface ProductionReportFilters extends ReportBaseFilters {
	type?: LivestockEventType;
	unit?: LivestockEventUnit;
	bucket?: ReportBucket;
}

interface IAggregateReportRow {
	bucket: string;
	group: string | null;
	measure: "sum_quantity" | "sum_amount" | "count";
	value: string;
}

interface IAggregateReportResponse {
	data: IAggregateReportRow[];
	meta: {
		type: LivestockEventType;
		measure: "sum_quantity" | "sum_amount" | "count";
		bucket: ReportBucket;
		group_key: string | null;
	};
}

const isLivestockEventUnit = (value: string): value is LivestockEventUnit =>
	(EVENT_UNITS as readonly string[]).includes(value);

export const getProductionReport = ({
	farmId,
	filters,
}: {
	farmId: string;
	filters?: ProductionReportFilters;
}) =>
	axiosHelper<IAggregateReportResponse>({
		method: "get",
		url: `/api/v1/farms/${farmId}/reports/aggregate`,
		urlParams: {
			asset_id: filters?.assetId,
			date_from: filters?.dateFrom,
			date_to: filters?.dateTo,
			type: filters?.type ?? "production",
			unit: filters?.unit,
			bucket: filters?.bucket ?? "day",
		},
	}).then((aggregate) => {
		const fallbackAssetId = filters?.assetId ?? 0;
		const data = aggregate.data.map((row) => {
			const unit =
				row.group && isLivestockEventUnit(row.group) ? row.group : "unit";

			return {
				bucket_start: row.bucket,
				asset_id: fallbackAssetId,
				unit,
				category_id: null,
				total: row.value,
			};
		});

		const totalsByUnit = data.reduce(
			(acc, row) => {
				const current = Number(acc[row.unit] ?? "0");
				const next = current + (Number(row.total) || 0);
				acc[row.unit] = String(next);
				return acc;
			},
			{} as Record<LivestockEventUnit, string>,
		);

		return {
			data,
			totals: Object.entries(totalsByUnit).map(([unit, total]) => ({
				unit: unit as LivestockEventUnit,
				total,
			})),
			bucket: aggregate.meta.bucket,
			type: aggregate.meta.type,
		} satisfies IProductionReport;
	});

interface CostPerUnitReportFilters extends ReportBaseFilters {
	unit: LivestockEventUnit;
}

export const getCostPerUnitReport = ({
	farmId,
	filters,
}: {
	farmId: string;
	filters: CostPerUnitReportFilters;
}) =>
	axiosHelper<ICostPerUnitReport>({
		method: "get",
		url: `/api/v1/farms/${farmId}/reports/cost-per-unit`,
		urlParams: {
			asset_id: filters.assetId,
			date_from: filters.dateFrom,
			date_to: filters.dateTo,
			unit: filters.unit,
		},
	});
