/**
 * Types aligned to backend contract: /api/v1/farms/{farm_id}/reports/*
 * Source: C:\projects\Ovejitas\Ovejitas-api\docs\api\reports.md
 */

// Profitability Report
export interface IProfitabilityRow {
	asset_id: number;
	asset_name: string;
	currency: string;
	income_total: string; // decimal as string from backend
	expense_total: string;
	net: string;
}

export interface IProfitabilityReport {
	data: IProfitabilityRow[];
}

// Production Report
export type ProductionBucket = "day" | "week" | "month";
export type EventType =
	| "production"
	| "expense"
	| "income"
	| "observation"
	| "reproductive"
	| "acquisition"
	| "mortality";

export interface IProductionRow {
	bucket_start: string; // ISO datetime
	asset_id: number;
	unit: string;
	category_id: number | null;
	total: string; // decimal as string
}

export interface IProductionReport {
	data: IProductionRow[];
	bucket: ProductionBucket;
	type: EventType;
}

// Cost Per Unit Report
export interface ICostPerUnitRow {
	asset_id: number;
	asset_name: string;
	currency: string;
	quantity: string;
	expense_total: string;
	cost_per_unit: string;
}

export interface ICostPerUnitReport {
	data: ICostPerUnitRow[];
	unit: string;
}

// Timeline Report
export interface IEventRead {
	id: number;
	farm_id: number;
	asset_id: number;
	individual_id: number | null;
	type: EventType;
	category_id: number | null;
	occurred_at: string; // ISO datetime
	quantity: string | null;
	unit: string | null;
	amount: string | null;
	currency: string | null;
	notes: string | null;
	payload: Record<string, unknown>;
	idempotency_key: string | null;
	created_by: number;
	created_at: string;
	updated_at: string;
}

export interface IPageMeta {
	page: number;
	page_size: number;
	total: number;
	has_next: boolean;
}

export interface ITimelineReport {
	data: IEventRead[];
	meta: IPageMeta;
}

// Query Parameters
export interface IProfitabilityReportParams {
	farmId: string | number;
	date_from?: string;
	date_to?: string;
	asset_id?: number;
}

export interface IProductionReportParams {
	farmId: string | number;
	bucket?: ProductionBucket;
	type?: EventType;
	date_from?: string;
	date_to?: string;
	asset_id?: number;
	unit?: string;
}

export interface ICostPerUnitReportParams {
	farmId: string | number;
	unit: string; // required
	date_from?: string;
	date_to?: string;
	asset_id?: number;
}

export interface ITimelineReportParams {
	farmId: string | number;
	individualId: string | number;
	page?: number;
	page_size?: number;
	date_from?: string;
	date_to?: string;
	type?: EventType;
}
