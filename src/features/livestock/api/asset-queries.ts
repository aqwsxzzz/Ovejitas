import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createLivestockAsset,
	deleteLivestockAssetById,
	getAssetSummaryByFarmId,
	getLivestockAssetById,
	listLivestockAssetsByFarmId,
	updateLivestockAssetById,
} from "@/features/livestock/api/livestock-api";
import type { ListLivestockAssetsFilters } from "@/features/livestock/api/livestock-query-filters";
import { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";
import type {
	ILivestockAsset,
} from "@/features/livestock/types/livestock-types";

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

export const useGetAssetSummaryByFarmId = ({
	farmId,
	enabled = true,
}: {
	farmId: string;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.assetSummary(farmId),
		queryFn: () => getAssetSummaryByFarmId({ farmId }),
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


// --- Asset Mutation Hooks ---

export const useCreateLivestockAsset = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			data,
		}: {
			farmId: string;
			data: Parameters<typeof createLivestockAsset>[0]["data"];
		}) => createLivestockAsset({ farmId, data }),
		onSuccess: (_, { farmId }) => {
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "assetsByFarm", farmId],
			});
		},
	});
};

export const useUpdateLivestockAssetById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			data,
		}: {
			farmId: string;
			assetId: number;
			data: Parameters<typeof updateLivestockAssetById>[0]["data"];
		}) => updateLivestockAssetById({ farmId, assetId, data }),
		onSuccess: (_, { farmId, assetId }) => {
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "assetsByFarm", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: livestockQueryKeys.assetById(farmId, assetId),
			});
		},
	});
};

export const useDeleteLivestockAssetById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ farmId, assetId }: { farmId: string; assetId: number }) =>
			deleteLivestockAssetById({ farmId, assetId }),
		onSuccess: (_, { farmId }) => {
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "assetsByFarm", farmId],
			});
		},
	});
};

