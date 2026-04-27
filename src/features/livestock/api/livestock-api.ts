import { axiosHelper } from "@/lib/axios/axios-helper";
import type {
	ILivestockAsset,
	ILivestockEvent,
	ILivestockAssetListResponse,
	ILivestockEventCategoryListResponse,
	ILivestockEventListResponse,
	ILivestockIndividual,
	ILivestockIndividualListResponse,
	LivestockEventType,
	LivestockAssetKind,
	LivestockAssetMode,
} from "@/features/livestock/types/livestock-types";

interface ListLivestockAssetsFilters {
	q?: string;
	kind?: LivestockAssetKind;
	mode?: LivestockAssetMode;
	page?: number;
	pageSize?: number;
}

interface ListIndividualsFilters {
	q?: string;
	sort?: string;
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
			unit: string;
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
			currency: string;
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
			unit?: string;
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
	  };

export interface LivestockEventUpdatePayload {
	occurred_at?: string | null;
	individual_id?: number | null;
	category_id?: number | null;
	quantity?: number | null;
	unit?: string | null;
	amount?: number | null;
	currency?: string | null;
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
