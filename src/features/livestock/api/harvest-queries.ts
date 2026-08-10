import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	createHarvestByAssetId,
	type IHarvestCreatePayload,
} from "@/features/livestock/api/livestock-api";
import { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";
import { reportsQueryKeys } from "@/features/reports/api/reports-queries";

export const useCreateHarvestByAssetId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			data,
		}: {
			farmId: string;
			assetId: string;
			data: IHarvestCreatePayload;
		}) => createHarvestByAssetId({ farmId, assetId, data }),
		onSuccess: (_, { farmId, assetId }) => {
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "eventsByAsset", farmId, assetId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "productionReport", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: reportsQueryKeys.farm(farmId),
			});
		},
	});
};
