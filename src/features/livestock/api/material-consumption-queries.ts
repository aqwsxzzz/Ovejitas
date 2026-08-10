import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createMaterialConsumptionByFarmId,
	deleteMaterialConsumptionById,
	getMaterialConsumptionById,
	listMaterialConsumptionsByFarmId,
	updateMaterialConsumptionById,
	type IMaterialConsumptionCreatePayload,
	type IMaterialConsumptionUpdatePayload,
} from "@/features/livestock/api/livestock-api";
import { invalidateMaterialDetailQueries } from "@/features/livestock/api/material-invalidation";
import type { ListMaterialConsumptionsFilters } from "@/features/livestock/api/livestock-query-filters";
import { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";
import type {
	IMaterialConsumptionRead,
} from "@/features/livestock/types/livestock-types";

export const useListMaterialConsumptionsByFarmId = ({
	farmId,
	filters,
	enabled = true,
}: {
	farmId: string;
	filters?: ListMaterialConsumptionsFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.materialConsumptions(farmId, filters),
		queryFn: () => listMaterialConsumptionsByFarmId({ farmId, filters }),
		enabled: enabled && !!farmId,
	});

export const useGetMaterialConsumptionById = ({
	farmId,
	consumptionId,
	enabled = true,
}: {
	farmId: string;
	consumptionId: number;
	enabled?: boolean;
}) =>
	useQuery<IMaterialConsumptionRead>({
		queryKey: livestockQueryKeys.materialConsumptionById(farmId, consumptionId),
		queryFn: () => getMaterialConsumptionById({ farmId, consumptionId }),
		enabled: enabled && !!farmId && Number.isFinite(consumptionId),
	});


export const useCreateMaterialConsumptionByFarmId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			data,
		}: {
			farmId: string;
			data: IMaterialConsumptionCreatePayload;
		}) => createMaterialConsumptionByFarmId({ farmId, data }),
		onSuccess: async (_, { farmId, data }) => {
			await invalidateMaterialDetailQueries({
				queryClient,
				farmId,
				assetId: String(data.material_asset_id),
			});
		},
	});
};

export const useUpdateMaterialConsumptionById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			consumptionId,
			data,
		}: {
			farmId: string;
			consumptionId: number;
			data: IMaterialConsumptionUpdatePayload;
			materialAssetId: number;
		}) => updateMaterialConsumptionById({ farmId, consumptionId, data }),
		onSuccess: async (_, { farmId, consumptionId, materialAssetId }) => {
			await invalidateMaterialDetailQueries({
				queryClient,
				farmId,
				assetId: String(materialAssetId),
			});
			void queryClient.invalidateQueries({
				queryKey: livestockQueryKeys.materialConsumptionById(
					farmId,
					consumptionId,
				),
			});
		},
	});
};

export const useDeleteMaterialConsumptionById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			consumptionId,
		}: {
			farmId: string;
			consumptionId: number;
			materialAssetId: number;
		}) => deleteMaterialConsumptionById({ farmId, consumptionId }),
		onSuccess: async (_, { farmId, consumptionId, materialAssetId }) => {
			await invalidateMaterialDetailQueries({
				queryClient,
				farmId,
				assetId: String(materialAssetId),
			});
			queryClient.removeQueries({
				queryKey: livestockQueryKeys.materialConsumptionById(
					farmId,
					consumptionId,
				),
			});
		},
	});
};

