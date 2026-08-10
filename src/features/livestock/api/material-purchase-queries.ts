import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createMaterialPurchaseByFarmId,
	deleteMaterialPurchaseById,
	getMaterialPurchaseById,
	listMaterialPurchasesByFarmId,
	updateMaterialPurchaseById,
	type IMaterialPurchaseCreatePayload,
	type IMaterialPurchaseUpdatePayload,
} from "@/features/livestock/api/livestock-api";
import { invalidateMaterialDetailQueries } from "@/features/livestock/api/material-invalidation";
import type { ListMaterialPurchasesFilters } from "@/features/livestock/api/livestock-query-filters";
import { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";
import type {
	IMaterialPurchaseRead,
} from "@/features/livestock/types/livestock-types";

export const useListMaterialPurchasesByFarmId = ({
	farmId,
	filters,
	enabled = true,
}: {
	farmId: string;
	filters?: ListMaterialPurchasesFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.materialPurchases(farmId, filters),
		queryFn: () => listMaterialPurchasesByFarmId({ farmId, filters }),
		enabled: enabled && !!farmId,
	});

export const useGetMaterialPurchaseById = ({
	farmId,
	purchaseId,
	enabled = true,
}: {
	farmId: string;
	purchaseId: number;
	enabled?: boolean;
}) =>
	useQuery<IMaterialPurchaseRead>({
		queryKey: livestockQueryKeys.materialPurchaseById(farmId, purchaseId),
		queryFn: () => getMaterialPurchaseById({ farmId, purchaseId }),
		enabled: enabled && !!farmId && Number.isFinite(purchaseId),
	});


export const useCreateMaterialPurchaseByFarmId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			data,
		}: {
			farmId: string;
			data: IMaterialPurchaseCreatePayload;
		}) => createMaterialPurchaseByFarmId({ farmId, data }),
		onSuccess: async (_, { farmId, data }) => {
			await invalidateMaterialDetailQueries({
				queryClient,
				farmId,
				assetId: String(data.material_asset_id),
			});
		},
	});
};

export const useUpdateMaterialPurchaseById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			purchaseId,
			data,
		}: {
			farmId: string;
			purchaseId: number;
			data: IMaterialPurchaseUpdatePayload;
			materialAssetId: number;
		}) => updateMaterialPurchaseById({ farmId, purchaseId, data }),
		onSuccess: async (_, { farmId, purchaseId, materialAssetId }) => {
			await invalidateMaterialDetailQueries({
				queryClient,
				farmId,
				assetId: String(materialAssetId),
			});
			void queryClient.invalidateQueries({
				queryKey: livestockQueryKeys.materialPurchaseById(farmId, purchaseId),
			});
		},
	});
};

export const useDeleteMaterialPurchaseById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			purchaseId,
		}: {
			farmId: string;
			purchaseId: number;
			materialAssetId: number;
		}) => deleteMaterialPurchaseById({ farmId, purchaseId }),
		onSuccess: async (_, { farmId, purchaseId, materialAssetId }) => {
			await invalidateMaterialDetailQueries({
				queryClient,
				farmId,
				assetId: String(materialAssetId),
			});
			queryClient.removeQueries({
				queryKey: livestockQueryKeys.materialPurchaseById(farmId, purchaseId),
			});
		},
	});
};

