/**
 * Types aligned to backend contract: /api/v1/farms/{farm_id}/reports/*
 * Source: C:\projects\Ovejitas\Ovejitas-api\docs\api\reports.md
 */

import type { EventUnit } from "@/shared/types/unit-types";

export type Unit = EventUnit;

// Profitability Report
export interface IProfitabilityRow {
	asset_id: number;
	asset_name: string;
	currency: string;
	income_total: string; // decimal as string from backend
	expense_total: string;
	net: string;
}

export interface IProfitabilityTotal {
	currency: string;
	income_total: string;
	expense_total: string;
	net: string;
}

export interface IProfitabilityReport {
	data: IProfitabilityRow[];
	totals: IProfitabilityTotal[];
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
	| "mortality"
	| "inventory";

export type AggregateMeasure = "sum_quantity" | "sum_amount" | "count";
export type InventoryAdjustment = "increment" | "decrement" | "reset";
export type GroupBy = "asset";
export type MaterialConsumptionGroupBy = "material" | "consumer" | "both";
export type MaterialConsumptionReason = "feeding" | "waste" | "spoilage";

export interface IAggregateRow {
	bucket: string; // ISO datetime
	group: string | null;
	group_label?: string | null;
	measure: AggregateMeasure;
	value: string; // decimal as string
	asset_id?: number | null;
	unit?: Unit | null;
}

export interface IAggregateMeta {
	type: EventType;
	measure: AggregateMeasure;
	bucket: ProductionBucket;
	group_key: string | null;
	group_by?: GroupBy | null;
}

export interface IAggregateReport {
	data: IAggregateRow[];
	meta: IAggregateMeta;
}

export interface IMaterialConsumptionAggregateTotal {
	group: string | null;
	group_label: string | null;
	unit: Unit;
	total_qty: string;
}

export interface IMaterialConsumptionAggregateReport {
	data: IAggregateRow[];
	totals: IMaterialConsumptionAggregateTotal[];
	bucket: ProductionBucket;
	group_by: MaterialConsumptionGroupBy;
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

export interface ICostPerUnitTotal {
	currency: string;
	quantity: string;
	expense_total: string;
	cost_per_unit: string;
}

export interface ICostPerUnitReport {
	data: ICostPerUnitRow[];
	unit: Unit;
	totals: ICostPerUnitTotal[];
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
	unit: Unit | null;
	amount: string | null;
	currency: string | null;
	adjustment: InventoryAdjustment | null;
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

// Inventory Summary Report
export interface IInventorySummaryRow {
	asset_id: number;
	asset_name: string;
	unit: Unit;
	on_hand: string;
}

export interface IInventorySummaryReport {
	data: IInventorySummaryRow[];
}

// Upcoming Births Report
export interface IUpcomingBirthRow {
	individual_id: number;
	individual_tag: string;
	asset_id: number;
	expected_due_at: string; // ISO datetime
	offspring_count: number | null;
	days_until_due: number;
}

export interface IUpcomingBirthsReport {
	data: IUpcomingBirthRow[];
}

// Query Parameters
export interface IProfitabilityReportParams {
	farmId: string | number;
	date_from?: string;
	date_to?: string;
	asset_id?: number;
}

export interface IAggregateReportParams {
	farmId: string | number;
	bucket?: ProductionBucket;
	type: EventType;
	date_from?: string;
	date_to?: string;
	asset_id?: number;
	unit?: Unit;
	adjustment?: InventoryAdjustment;
	currency?: string;
	group_by?: GroupBy;
}

export interface ICostPerUnitReportParams {
	farmId: string | number;
	unit: Unit; // required
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

export interface IInventorySummaryReportParams {
	farmId: string | number;
	date_from?: string;
	date_to?: string;
	asset_id?: number;
	unit?: Unit;
}

export interface IMaterialConsumptionAggregateReportParams {
	farmId: string | number;
	bucket?: ProductionBucket;
	group_by?: MaterialConsumptionGroupBy;
	material_asset_id?: number;
	consumer_asset_id?: number;
	reason?: MaterialConsumptionReason;
	date_from?: string;
	date_to?: string;
}

export interface IReportPdfParams {
	farmId: string | number;
	date_from?: string;
	date_to?: string;
	asset_id?: number;
	unit?: Unit;
}

export interface IUpcomingBirthsReportParams {
	farmId: string | number;
	date_from: string; // required — defines the alert window
	date_to: string; // required
}
