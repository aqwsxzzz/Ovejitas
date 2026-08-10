import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createEventCategoryByFarmId,
	deleteEventCategoryById,
	listEventCategoriesByFarmId,
	updateEventCategoryById,
} from "@/features/livestock/api/livestock-api";
import type { ListEventCategoriesFilters } from "@/features/livestock/api/livestock-query-filters";
import { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";
import type { ILivestockEventCategory } from "@/features/livestock/types/livestock-types";

export const useListEventCategoriesByFarmId = ({
	farmId,
	filters,
	enabled = true,
}: {
	farmId: string;
	filters?: ListEventCategoriesFilters;
	enabled?: boolean;
}) =>
	useQuery<ILivestockEventCategory[]>({
		queryKey: livestockQueryKeys.eventCategoriesByFarm(farmId, filters),
		queryFn: async () => {
			const result = await listEventCategoriesByFarmId({ farmId, filters });
			return result.data;
		},
		enabled: enabled && !!farmId,
	});


export const useCreateEventCategoryByFarmId = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			data,
		}: {
			farmId: string;
			data: Parameters<typeof createEventCategoryByFarmId>[0]["data"];
		}) => createEventCategoryByFarmId({ farmId, data }),
		onSuccess: (_, { farmId }) => {
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"eventCategoriesByFarm",
					farmId,
				],
			});
		},
	});
};

export const useUpdateEventCategoryById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			categoryId,
			data,
		}: {
			farmId: string;
			categoryId: number;
			data: Parameters<typeof updateEventCategoryById>[0]["data"];
		}) => updateEventCategoryById({ farmId, categoryId, data }),
		onSuccess: (_, { farmId }) => {
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"eventCategoriesByFarm",
					farmId,
				],
			});
		},
	});
};

export const useDeleteEventCategoryById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			farmId,
			categoryId,
		}: {
			farmId: string;
			categoryId: number;
		}) => deleteEventCategoryById({ farmId, categoryId }),
		onSuccess: (_, { farmId }) => {
			void queryClient.invalidateQueries({
				queryKey: [
					...livestockQueryKeys.all,
					"eventCategoriesByFarm",
					farmId,
				],
			});
		},
	});
};

