import { axiosHelper } from "@/lib/axios/axios-helper";
import type {
	ILivestockAsset,
	ILivestockAssetListResponse,
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
