import type { EventUnit } from "@/shared/types/unit-types";

export type LivestockAssetKind =
	| "animal"
	| "crop"
	| "equipment"
	| "material"
	| "location";

export type LivestockEventUnit = EventUnit;

export type LivestockAssetMode = "aggregated" | "individual";

export type IndividualSex = "male" | "female" | "unknown";

export type LivestockEventType =
	| "production"
	| "expense"
	| "income"
	| "observation"
	| "reproductive"
	| "acquisition"
	| "mortality"
	| "inventory";

export type InventoryAdjustment = "increment" | "decrement" | "reset";

export type LivestockEventStatus = "logged" | "planned";

export interface ILivestockAsset {
	id: number;
	farm_id: number;
	name: string;
	kind: LivestockAssetKind;
	mode: LivestockAssetMode | null;
	location: string | null;
	description: string | null;
	produce_asset_id: number | null;
	created_at: string;
	updated_at: string;
}

export interface ILivestockIndividual {
	id: number;
	farm_id: number;
	asset_id: number;
	name: string;
	tag: string | null;
	birth_date: string | null;
	mother_id: number | null;
	father_id: number | null;
	status: "active" | "sold" | "deceased" | "archived";
	extra: Record<string, unknown>;
	created_at: string;
	updated_at: string;
}

export interface ILivestockEventCategory {
	id: number;
	farm_id: number;
	type: LivestockEventType;
	name: string;
	color: string | null;
	archived_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface ILivestockEvent {
	id: number;
	farm_id: number;
	asset_id: number;
	individual_id: number | null;
	type: LivestockEventType;
	category_id: number | null;
	occurred_at: string;
	quantity: string | null;
	unit: LivestockEventUnit | null;
	amount: string | null;
	currency: string | null;
	notes: string | null;
	adjustment: InventoryAdjustment | null;
	payload: Record<string, unknown>;
	created_by: number;
	created_at: string;
	updated_at: string;
}

export interface IInventoryBalanceRow {
	unit: LivestockEventUnit;
	on_hand: string;
	last_reset_at: string | null;
}

export interface IInventoryBalance {
	asset_id: number;
	balances: IInventoryBalanceRow[];
}

export type MaterialConsumptionReason = "feeding" | "waste" | "spoilage";

export interface IMaterialPurchaseRead {
	id: number;
	farm_id: number;
	material_asset_id: number;
	inventory_event_id: number;
	expense_event_id: number;
	occurred_at: string;
	quantity: string;
	unit: LivestockEventUnit;
	amount: string;
	currency: string;
	supplier: string | null;
	notes: string | null;
	meta: Record<string, unknown>;
	idempotency_key: string | null;
	created_by: number;
	created_at: string;
	updated_at: string;
}

export interface IMaterialConsumptionRead {
	id: number;
	farm_id: number;
	material_asset_id: number;
	consumer_asset_id: number | null;
	individual_id: number | null;
	inventory_event_id: number;
	occurred_at: string;
	quantity: string;
	unit: LivestockEventUnit;
	reason: MaterialConsumptionReason;
	notes: string | null;
	meta: Record<string, unknown>;
	idempotency_key: string | null;
	created_by: number;
	created_at: string;
	updated_at: string;
}

export interface IMaterialSaleRead {
	inventory_event_id: number;
	income_event_id: number;
	on_hand: string;
}

export interface ILivestockPageMeta {
	page: number;
	page_size: number;
	total: number;
	has_next: boolean;
}

export interface ILivestockAssetListResponse {
	data: ILivestockAsset[];
	meta: ILivestockPageMeta;
}

export interface IOffspringCreate {
	tag: string;
	name?: string | null;
	birth_date?: string | null;
	extra?: Record<string, unknown>;
}

export interface IBirthCreatePayload {
	occurred_at?: string;
	father_id?: number | null;
	category_id?: number | null;
	notes?: string | null;
	outcome?: string | null;
	offspring: IOffspringCreate[];
}

export interface IBirthRead {
	reproductive_event_id: number;
	mother_id: number;
	offspring: ILivestockIndividual[];
}

export interface IAssetKindCount {
	kind: LivestockAssetKind;
	count: number;
}

export interface IAssetSummary {
	data: IAssetKindCount[];
}

export interface ILivestockIndividualListResponse {
	data: ILivestockIndividual[];
	meta: ILivestockPageMeta;
}

export interface ILivestockEventListResponse {
	data: ILivestockEvent[];
	meta: ILivestockPageMeta;
}

export interface ILivestockEventCategoryListResponse {
	data: ILivestockEventCategory[];
	meta: ILivestockPageMeta;
}

export interface IMaterialPurchaseListResponse {
	data: IMaterialPurchaseRead[];
	meta: ILivestockPageMeta;
}

export interface IMaterialConsumptionListResponse {
	data: IMaterialConsumptionRead[];
	meta: ILivestockPageMeta;
}

// --- Report types ---

export type ReportBucket = "day" | "week" | "month";

export interface IProfitabilityRow {
	asset_id: number;
	asset_name: string;
	currency: string;
	income_total: string;
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

export interface IProductionRow {
	bucket_start: string;
	asset_id: number;
	unit: LivestockEventUnit;
	category_id: number | null;
	total: string;
}

export interface IProductionTotal {
	unit: LivestockEventUnit;
	total: string;
}

export interface IProductionReport {
	data: IProductionRow[];
	totals: IProductionTotal[];
	bucket: ReportBucket;
	type: LivestockEventType;
}

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
	totals: ICostPerUnitTotal[];
	unit: LivestockEventUnit;
}
