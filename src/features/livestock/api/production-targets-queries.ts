import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createProductionTargetByFarmId,
	deleteProductionTargetById,
	listProductionTargetsByFarmId,
	updateProductionTargetById,
} from "@/features/livestock/api/production-targets-api";
import type {
	IAssetProductionTargetCreatePayload,
	IAssetProductionTargetRead,
	IAssetProductionTargetUpdatePayload,
} from "@/features/livestock/types/production-targets-types";
import { reportsQueryKeys } from "@/features/reports/api/reports-queries";

export const productionTargetsQueryKeys = {
	all: ["production-targets"] as const,
	byFarm: (farmId: string) =>
		[...productionTargetsQueryKeys.all, farmId] as const,
};

/**
 * List a farm's production targets. The backend exposes no server-side asset
 * filter, so callers scope to one asset in memory — this is bounded config
 * data (a handful of targets per farm), not a growable ledger list.
 */
export const useListProductionTargetsByFarmId = ({
	farmId,
	enabled = true,
}: {
	farmId: string;
	enabled?: boolean;
}) =>
	useQuery<IAssetProductionTargetRead[]>({
		queryKey: productionTargetsQueryKeys.byFarm(farmId),
		queryFn: async () => {
			const result = await listProductionTargetsByFarmId({ farmId });
			return result.data;
		},
		enabled: enabled && !!farmId,
	});

const invalidateProductionTargets = (
	queryClient: ReturnType<typeof useQueryClient>,
	farmId: string,
): void => {
	void queryClient.invalidateQueries({
		queryKey: productionTargetsQueryKeys.byFarm(farmId),
	});
	// production-productivity report reads from targets
	void queryClient.invalidateQueries({
		queryKey: reportsQueryKeys.farm(farmId),
	});
};

export const useCreateProductionTargetByFarmId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			data,
		}: {
			farmId: string;
			data: IAssetProductionTargetCreatePayload;
		}) => createProductionTargetByFarmId({ farmId, data }),
		onSuccess: (_, { farmId }) => invalidateProductionTargets(queryClient, farmId),
	});
};

export const useUpdateProductionTargetById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			targetId,
			data,
		}: {
			farmId: string;
			targetId: number;
			data: IAssetProductionTargetUpdatePayload;
		}) => updateProductionTargetById({ farmId, targetId, data }),
		onSuccess: (_, { farmId }) => invalidateProductionTargets(queryClient, farmId),
	});
};

export const useDeleteProductionTargetById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			targetId,
		}: {
			farmId: string;
			targetId: number;
		}) => deleteProductionTargetById({ farmId, targetId }),
		onSuccess: (_, { farmId }) => invalidateProductionTargets(queryClient, farmId),
	});
};
