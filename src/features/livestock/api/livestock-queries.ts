import { useQuery } from "@tanstack/react-query";
import {
	getLivestockAssetById,
	listLivestockAssetsByFarmId,
} from "@/features/livestock/api/livestock-api";
import type {
	ILivestockAsset,
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

export const livestockQueryKeys = {
	all: ["livestock"] as const,
	assetsByFarm: (farmId: string, filters?: ListLivestockAssetsFilters) =>
		[
			...livestockQueryKeys.all,
			"assetsByFarm",
			farmId,
			filters?.q ?? "",
			filters?.kind ?? "",
			filters?.mode ?? "",
			filters?.page ?? 1,
			filters?.pageSize ?? 20,
		] as const,
	assetById: (farmId: string, assetId: number) =>
		[...livestockQueryKeys.all, "assetById", farmId, assetId] as const,
};

export const useListLivestockAssetsByFarmId = ({
	farmId,
	filters,
	enabled = true,
}: {
	farmId: string;
	filters?: ListLivestockAssetsFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.assetsByFarm(farmId, filters),
		queryFn: () => listLivestockAssetsByFarmId({ farmId, filters }),
		enabled: enabled && !!farmId,
	});

export const useGetLivestockAssetById = ({
	farmId,
	assetId,
	enabled = true,
}: {
	farmId: string;
	assetId: number;
	enabled?: boolean;
}) =>
	useQuery<ILivestockAsset>({
		queryKey: livestockQueryKeys.assetById(farmId, assetId),
		queryFn: () => getLivestockAssetById({ farmId, assetId }),
		enabled: enabled && !!farmId && Number.isFinite(assetId),
	});
