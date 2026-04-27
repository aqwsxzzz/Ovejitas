/**
 * Backend API integration for feat/domain-rebuild
 * Real HTTP calls to FastAPI backend at port 5433
 * Ref: https://github.com/aqwsxzzz/Ovejitas-api/commits/feat/domain-rebuild/
 */

import { axiosInstance } from "@/lib/axios";

// ============= Backend API Response Types =============

export type AssetKind =
	| "animal"
	| "crop"
	| "equipment"
	| "material"
	| "location";
export type AssetMode = "aggregated" | "individual";

/** Backend Asset response from /api/v1/farms/{farm_id}/assets */
export interface BackendAssetRead {
	id: string;
	farm_id: string;
	name: string;
	kind: AssetKind;
	mode: AssetMode;
	status: "active" | "inactive" | "archived";
	location?: string;
	notes?: string;
	created_at: string;
	updated_at: string;
	tags?: string[];
}

/** Backend Individual response from /api/v1/farms/{farm_id}/assets/{asset_id}/individuals */
export interface BackendIndividualRead {
	id: string;
	asset_id: string;
	name?: string;
	tag: string;
	sex?: "male" | "female" | "unknown";
	birth_date?: string;
	status: "active" | "sold" | "deceased";
	parent_id?: string;
	mother_id?: string;
	father_id?: string;
	attributes?: Record<string, string | number | boolean>;
	created_at: string;
	updated_at: string;
}

/** Backend Event Category response */
export interface BackendEventCategoryRead {
	id: string;
	farm_id: string;
	type: string;
	name: string;
	unit?: string;
	color?: string;
	archived_at?: string;
	created_at: string;
	updated_at: string;
}

/** Backend Event response - discriminated union per category */
export interface BackendEventRead {
	id: string;
	farm_id: string;
	asset_id: string;
	individual_id?: string;
	category_id: string;
	event_type: string;
	occurred_at: string;
	// Discriminated fields depend on event_type
	data: Record<string, any>;
	created_at: string;
	updated_at: string;
}

/** Generic pagination response from backend */
export interface BackendPagedResponse<T> {
	items: T[];
	total: number;
	page: number;
	page_size: number;
	total_pages: number;
}

/** Backend /me response after login */
export interface BackendMeResponse {
	user: {
		id: string;
		email: string;
		created_at: string;
	};
	memberships: Array<{
		id: string;
		farm_id: string;
		role: string;
	}>;
}

// ============= API Functions =============

/** Get current user and farm memberships */
export async function fetchMe(): Promise<BackendMeResponse> {
	const response =
		await axiosInstance.get<BackendMeResponse>("/api/v1/auth/me");
	return response.data;
}

/** List assets for a farm with optional filters */
export async function fetchAssets(
	farmId: string,
	options?: {
		page?: number;
		pageSize?: number;
		q?: string;
		sort?: string;
		kind?: AssetKind;
		mode?: AssetMode;
		dateFrom?: string;
		dateTo?: string;
	},
) {
	const params = new URLSearchParams();
	if (options?.page) params.append("page", options.page.toString());
	if (options?.pageSize)
		params.append("page_size", options.pageSize.toString());
	if (options?.q) params.append("q", options.q);
	if (options?.sort) params.append("sort", options.sort);
	if (options?.kind) params.append("kind", options.kind);
	if (options?.mode) params.append("mode", options.mode);
	if (options?.dateFrom) params.append("date_from", options.dateFrom);
	if (options?.dateTo) params.append("date_to", options.dateTo);

	const queryString = params.toString();
	const url = `/api/v1/farms/${farmId}/assets${queryString ? `?${queryString}` : ""}`;

	const response =
		await axiosInstance.get<BackendPagedResponse<BackendAssetRead>>(url);
	return response.data;
}

/** Get a single asset by ID */
export async function fetchAsset(farmId: string, assetId: string) {
	const response = await axiosInstance.get<BackendAssetRead>(
		`/api/v1/farms/${farmId}/assets/${assetId}`,
	);
	return response.data;
}

/** Create a new asset */
export async function createAsset(
	farmId: string,
	data: {
		name: string;
		kind: AssetKind;
		mode: AssetMode;
		location?: string;
		notes?: string;
		tags?: string[];
	},
) {
	const response = await axiosInstance.post<BackendAssetRead>(
		`/api/v1/farms/${farmId}/assets`,
		data,
	);
	return response.data;
}

/** Update an asset */
export async function updateAsset(
	farmId: string,
	assetId: string,
	data: Partial<{
		name: string;
		status: "active" | "inactive" | "archived";
		location?: string;
		notes?: string;
		tags?: string[];
	}>,
) {
	const response = await axiosInstance.patch<BackendAssetRead>(
		`/api/v1/farms/${farmId}/assets/${assetId}`,
		data,
	);
	return response.data;
}

/** Delete an asset */
export async function deleteAsset(farmId: string, assetId: string) {
	await axiosInstance.delete(`/api/v1/farms/${farmId}/assets/${assetId}`);
}

/** List individuals under an asset */
export async function fetchIndividuals(
	farmId: string,
	assetId: string,
	options?: {
		page?: number;
		pageSize?: number;
		q?: string;
	},
) {
	const params = new URLSearchParams();
	if (options?.page) params.append("page", options.page.toString());
	if (options?.pageSize)
		params.append("page_size", options.pageSize.toString());
	if (options?.q) params.append("q", options.q);

	const queryString = params.toString();
	const url = `/api/v1/farms/${farmId}/assets/${assetId}/individuals${
		queryString ? `?${queryString}` : ""
	}`;

	const response =
		await axiosInstance.get<BackendPagedResponse<BackendIndividualRead>>(url);
	return response.data;
}

/** Get a single individual */
export async function fetchIndividual(
	farmId: string,
	assetId: string,
	individualId: string,
) {
	const response = await axiosInstance.get<BackendIndividualRead>(
		`/api/v1/farms/${farmId}/assets/${assetId}/individuals/${individualId}`,
	);
	return response.data;
}

/** Create a new individual under an asset */
export async function createIndividual(
	farmId: string,
	assetId: string,
	data: {
		name?: string;
		tag: string;
		sex?: "male" | "female" | "unknown";
		birth_date?: string;
		parent_id?: string;
		mother_id?: string;
		father_id?: string;
		attributes?: Record<string, string | number | boolean>;
	},
) {
	const response = await axiosInstance.post<BackendIndividualRead>(
		`/api/v1/farms/${farmId}/assets/${assetId}/individuals`,
		data,
	);
	return response.data;
}

/** Update an individual */
export async function updateIndividual(
	farmId: string,
	assetId: string,
	individualId: string,
	data: Partial<{
		name?: string;
		tag: string;
		sex?: "male" | "female" | "unknown";
		status: "active" | "sold" | "deceased";
		mother_id?: string;
		father_id?: string;
		attributes?: Record<string, string | number | boolean>;
	}>,
) {
	const response = await axiosInstance.patch<BackendIndividualRead>(
		`/api/v1/farms/${farmId}/assets/${assetId}/individuals/${individualId}`,
		data,
	);
	return response.data;
}

/** Delete an individual */
export async function deleteIndividual(
	farmId: string,
	assetId: string,
	individualId: string,
) {
	await axiosInstance.delete(
		`/api/v1/farms/${farmId}/assets/${assetId}/individuals/${individualId}`,
	);
}

/** List event categories for a farm */
export async function fetchEventCategories(farmId: string) {
	const response = await axiosInstance.get<BackendEventCategoryRead[]>(
		`/api/v1/farms/${farmId}/event-categories`,
	);
	return response.data;
}

/** Create event category */
export async function createEventCategory(
	farmId: string,
	data: {
		type: string;
		name: string;
		unit?: string;
		color?: string;
	},
) {
	const response = await axiosInstance.post<BackendEventCategoryRead>(
		`/api/v1/farms/${farmId}/event-categories`,
		data,
	);
	return response.data;
}

/** Archive event category (soft delete) */
export async function archiveEventCategory(farmId: string, categoryId: string) {
	const response = await axiosInstance.patch<BackendEventCategoryRead>(
		`/api/v1/farms/${farmId}/event-categories/${categoryId}`,
		{ archived_at: new Date().toISOString() },
	);
	return response.data;
}

/** Note: Event endpoints may not be fully exposed yet per backend status.
 * Check commit history for latest availability. */
export async function fetchEvents(
	farmId: string,
	options?: {
		assetId?: string;
		individualId?: string;
		categoryId?: string;
		page?: number;
		pageSize?: number;
	},
) {
	const params = new URLSearchParams();
	if (options?.assetId) params.append("asset_id", options.assetId);
	if (options?.individualId)
		params.append("individual_id", options.individualId);
	if (options?.categoryId) params.append("category_id", options.categoryId);
	if (options?.page) params.append("page", options.page.toString());
	if (options?.pageSize)
		params.append("page_size", options.pageSize.toString());

	const queryString = params.toString();
	const url = `/api/v1/farms/${farmId}/events${queryString ? `?${queryString}` : ""}`;

	const response =
		await axiosInstance.get<BackendPagedResponse<BackendEventRead>>(url);
	return response.data;
}
