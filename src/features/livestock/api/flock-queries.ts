import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	createFlockAcquisitionByAssetId,
	createFlockMortalityByAssetId,
	createFlockSaleByAssetId,
	type IFlockAcquisitionCreatePayload,
	type IFlockMortalityCreatePayload,
	type IFlockSaleCreatePayload,
} from "@/features/livestock/api/livestock-api";
import { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";
import { reportsQueryKeys } from "@/features/reports/api/reports-queries";

export const useCreateFlockAcquisitionByAssetId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			payload,
		}: {
			farmId: string;
			assetId: string;
			payload: IFlockAcquisitionCreatePayload;
		}) => createFlockAcquisitionByAssetId({ farmId, assetId, payload }),
		onSuccess: (_, { farmId, assetId }) => {
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"eventsByAssetInfinite",
					farmId,
					assetId,
				],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "eventsByAsset", farmId, assetId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "profitabilityReport", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "productionReport", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"aggregatedHeadcount",
					farmId,
					assetId,
				],
			});
			// per_head_continuous "expected" output scales with headcount, which
			// this mutation changes — refresh the production-productivity report.
			void queryClient.invalidateQueries({
				queryKey: reportsQueryKeys.farm(farmId),
			});
		},
	});
};

export const useCreateFlockSaleByAssetId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			payload,
		}: {
			farmId: string;
			assetId: string;
			payload: IFlockSaleCreatePayload;
		}) => createFlockSaleByAssetId({ farmId, assetId, payload }),
		onSuccess: (_, { farmId, assetId }) => {
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"eventsByAssetInfinite",
					farmId,
					assetId,
				],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "eventsByAsset", farmId, assetId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "profitabilityReport", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "productionReport", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"aggregatedHeadcount",
					farmId,
					assetId,
				],
			});
			// per_head_continuous "expected" output scales with headcount, which
			// this mutation changes — refresh the production-productivity report.
			void queryClient.invalidateQueries({
				queryKey: reportsQueryKeys.farm(farmId),
			});
		},
	});
};

export const useCreateFlockMortalityByAssetId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			payload,
		}: {
			farmId: string;
			assetId: string;
			payload: IFlockMortalityCreatePayload;
		}) => createFlockMortalityByAssetId({ farmId, assetId, payload }),
		onSuccess: (_, { farmId, assetId }) => {
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"eventsByAssetInfinite",
					farmId,
					assetId,
				],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "eventsByAsset", farmId, assetId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "profitabilityReport", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...livestockQueryKeys.all, "productionReport", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"aggregatedHeadcount",
					farmId,
					assetId,
				],
			});
			// per_head_continuous "expected" output scales with headcount, which
			// this mutation changes — refresh the production-productivity report.
			void queryClient.invalidateQueries({
				queryKey: reportsQueryKeys.farm(farmId),
			});
		},
	});
};

