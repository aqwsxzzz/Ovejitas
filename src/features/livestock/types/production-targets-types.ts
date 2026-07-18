/**
 * Types aligned to backend contract: /api/v1/farms/{farm_id}/production-targets
 * Source: backend-docs/api/production-targets.yaml
 *
 * A production target declares the expected output of an (asset × product),
 * where a product is a production-type event category. Targets are
 * effective-dated: asset/category/basis/period are set once at create, and a
 * changed rate is a NEW effective-dated target, not an edit.
 */

export type ProductionTargetBasis =
	| "per_head_continuous"
	| "per_event"
	| "total";

export type ProductionTargetPeriod = "day" | "year";

export interface IAssetProductionTargetRead {
	id: number;
	farm_id: number;
	asset_id: number;
	category_id: number;
	basis: ProductionTargetBasis;
	expected_rate: string; // decimal as string from backend
	period: ProductionTargetPeriod | null;
	effective_from: string; // date
	effective_to: string | null; // date
	archived_at: string | null; // date-time
	created_at: string;
	updated_at: string;
}

export interface IAssetProductionTargetCreatePayload {
	asset_id: number;
	category_id: number;
	basis: ProductionTargetBasis;
	expected_rate: number | string;
	period?: ProductionTargetPeriod | null;
	effective_from: string; // date
	effective_to?: string | null; // date
}

export interface IAssetProductionTargetUpdatePayload {
	expected_rate?: number | string | null;
	effective_to?: string | null;
	archived_at?: string | null;
}

export interface IPageMeta {
	page: number;
	page_size: number;
	total: number;
	has_next: boolean;
}

export interface IAssetProductionTargetListResponse {
	data: IAssetProductionTargetRead[];
	meta: IPageMeta;
}
