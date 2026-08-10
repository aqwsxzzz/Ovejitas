import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	createEventByAssetId,
	deleteEventByAssetId,
	updateEventByAssetId,
	type LivestockEventCreatePayload,
	type LivestockEventUpdatePayload,
} from "@/features/livestock/api/livestock-api";
import { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";
import { reportsQueryKeys } from "@/features/reports/api/reports-queries";

export const useCreateEventByAssetId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			data,
		}: {
			farmId: string;
			assetId: string;
			data: LivestockEventCreatePayload;
		}) => createEventByAssetId({ farmId, assetId, data }),
		onSuccess: (_, { farmId, assetId }) => {
			// Invalidate all event queries for this asset (respects individual filter preferences)
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
				queryKey: reportsQueryKeys.farm(farmId),
			});
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"aggregatedHeadcount",
					farmId,
					assetId,
				],
			});
		},
	});
};


export const useUpdateEventByAssetId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			eventId,
			data,
		}: {
			farmId: string;
			assetId: string;
			eventId: number;
			data: LivestockEventUpdatePayload;
		}) => updateEventByAssetId({ farmId, assetId, eventId, data }),
		onSuccess: (_, { farmId, assetId }) => {
			// Invalidate all event queries for this asset (respects individual filter preferences)
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
				queryKey: reportsQueryKeys.farm(farmId),
			});
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"aggregatedHeadcount",
					farmId,
					assetId,
				],
			});
		},
	});
};

export const useDeleteEventByAssetId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			eventId,
		}: {
			farmId: string;
			assetId: string;
			eventId: number;
		}) => deleteEventByAssetId({ farmId, assetId, eventId }),
		onSuccess: (_, { farmId, assetId }) => {
			void queryClient.invalidateQueries({
				queryKey: reportsQueryKeys.farm(farmId),
			});
			// Invalidate all event queries for this asset (respects individual filter preferences)
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
		},
	});
};

