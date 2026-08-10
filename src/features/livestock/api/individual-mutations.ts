import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	createBirthByMotherId,
	createIndividual,
	deleteIndividual,
	updateIndividual,
} from "@/features/livestock/api/livestock-api";
import {
	appendIndividualToListCache,
	removeIndividualFromListCache,
	replaceIndividualInListCache,
} from "@/features/livestock/api/individual-cache-utils";
import { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";
import { reportsQueryKeys } from "@/features/reports/api/reports-queries";
import type {
	ILivestockIndividualListResponse,
} from "@/features/livestock/types/livestock-types";

export const useCreateIndividual = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			data,
		}: {
			farmId: string;
			assetId: string;
			data: Parameters<typeof createIndividual>[0]["data"];
		}) => createIndividual({ farmId, assetId, data }),
		onSuccess: (created, { farmId, assetId }) => {
			queryClient.setQueriesData<ILivestockIndividualListResponse>(
				{
					queryKey: [
						...livestockQueryKeys.all,
						"individualsByAsset",
						farmId,
						assetId,
					],
				},
				(current) => appendIndividualToListCache(current, created),
			);
			queryClient.setQueryData(
				livestockQueryKeys.individualById(farmId, assetId, String(created.id)),
				created,
			);
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"individualsByAsset",
					farmId,
					assetId,
				],
			});
		},
	});
};

export const useCreateBirthByMotherId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			motherId,
			data,
		}: {
			farmId: string;
			assetId: string;
			motherId: number;
			data: Parameters<typeof createBirthByMotherId>[0]["data"];
		}) => createBirthByMotherId({ farmId, assetId, motherId, data }),
		onSuccess: (_birth, { farmId, assetId }) => {
			// Offspring become new individuals; the mother gains a reproductive
			// event on its timeline (a ledger-replayed report).
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"individualsByAsset",
					farmId,
					assetId,
				],
			});
			void queryClient.invalidateQueries({ queryKey: reportsQueryKeys.all });
		},
	});
};

export const useUpdateIndividual = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			individualId,
			data,
		}: {
			farmId: string;
			assetId: string;
			individualId: string;
			data: Parameters<typeof updateIndividual>[0]["data"];
		}) => updateIndividual({ farmId, assetId, individualId, data }),
		onSuccess: (updated, { farmId, assetId, individualId }) => {
			queryClient.setQueriesData<ILivestockIndividualListResponse>(
				{
					queryKey: [
						...livestockQueryKeys.all,
						"individualsByAsset",
						farmId,
						assetId,
					],
				},
				(current) => replaceIndividualInListCache(current, updated),
			);
			queryClient.setQueryData(
				livestockQueryKeys.individualById(farmId, assetId, individualId),
				updated,
			);
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"individualsByAsset",
					farmId,
					assetId,
				],
			});
			void queryClient.invalidateQueries({
				queryKey: livestockQueryKeys.individualById(
					farmId,
					assetId,
					individualId,
				),
			});
			// Sold/deceased transitions emit income/mortality ledger events.
			void queryClient.invalidateQueries({ queryKey: reportsQueryKeys.all });
		},
	});
};

export const useDeleteIndividual = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			assetId,
			individualId,
		}: {
			farmId: string;
			assetId: string;
			individualId: string;
		}) => deleteIndividual({ farmId, assetId, individualId }),
		onSuccess: (_, { farmId, assetId, individualId }) => {
			const matchesIndividualsByAssetQuery = ({
				queryKey,
			}: {
				queryKey: readonly unknown[];
			}) => {
				return (
					queryKey[0] === "livestock" &&
					queryKey[1] === "individualsByAsset" &&
					String(queryKey[2] ?? "") === farmId &&
					String(queryKey[3] ?? "") === assetId
				);
			};

			queryClient.setQueriesData<ILivestockIndividualListResponse>(
				{
					predicate: matchesIndividualsByAssetQuery,
				},
				(current) => removeIndividualFromListCache(current, individualId),
			);
			queryClient.removeQueries({
				queryKey: livestockQueryKeys.individualById(
					farmId,
					assetId,
					individualId,
				),
			});
			void queryClient.invalidateQueries({
				predicate: matchesIndividualsByAssetQuery,
				refetchType: "active",
			});
		},
	});
};

