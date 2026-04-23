export type LivestockAssetKind =
	| "animal"
	| "crop"
	| "equipment"
	| "material"
	| "location";

export type LivestockAssetMode = "aggregated" | "individual";

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
