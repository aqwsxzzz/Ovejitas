export type LivestockAssetKind =
	| "animal"
	| "crop"
	| "equipment"
	| "material"
	| "location";

export type LivestockAssetMode = "aggregated" | "individual";

export type IndividualSex = "male" | "female" | "unknown";

export type LivestockEventType =
	| "production"
	| "expense"
	| "income"
	| "observation"
	| "reproductive"
	| "acquisition"
	| "mortality";

export type LivestockEventStatus = "logged" | "planned";

export interface ILivestockAsset {
	id: number;
	farm_id: number;
	name: string;
	kind: LivestockAssetKind;
	mode: LivestockAssetMode;
	location: string | null;
	description: string | null;
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
	unit: string | null;
	amount: string | null;
	currency: string | null;
	notes: string | null;
	payload: Record<string, unknown>;
	created_by: number;
	created_at: string;
	updated_at: string;
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
