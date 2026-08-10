import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createMaterialSaleByAssetId,
	getInventoryBalanceByAssetId,
	type IMaterialSaleCreatePayload,
} from "@/features/livestock/api/livestock-api";
import { invalidateMaterialDetailQueries } from "@/features/livestock/api/material-invalidation";
import { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";
import type {
	IInventoryBalance,
} from "@/features/livestock/types/livestock-types";

export const useGetInventoryBalanceByAssetId = ({
	farmId,
	assetId,
	enabled = true,
}: {
	farmId: string;
	assetId: string;
	enabled?: boolean;
}) =>
	useQuery<IInventoryBalance>({
		queryKey: livestockQueryKeys.inventoryBalanceByAsset(farmId, assetId),
		queryFn: () => getInventoryBalanceByAssetId({ farmId, assetId }),
		enabled: enabled && !!farmId && !!assetId,
	});


export const useCreateMaterialSaleByAssetId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			data,
		}: {
			farmId: string;
			assetId: string;
			data: IMaterialSaleCreatePayload;
		}) => createMaterialSaleByAssetId({ farmId, assetId, data }),
		onSuccess: async (_, { farmId, assetId }) => {
			await invalidateMaterialDetailQueries({
				queryClient,
				farmId,
				assetId,
			});
		},
	});
};

