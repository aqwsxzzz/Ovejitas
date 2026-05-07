import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18next from "i18next";
import {
	createFeedingSchedule,
	deleteFeedingScheduleById,
	getFeedingSchedules,
	updateFeedingScheduleById,
} from "@/features/feeding-schedule/api/feeding-schedule-api";
import type {
	ICreateFeedingSchedulePayload,
	IFeedingScheduleListFilters,
	IUpdateFeedingSchedulePayload,
} from "@/features/feeding-schedule/types/feeding-schedule-types";

const normalizeFilters = (
	filters?: Partial<IFeedingScheduleListFilters>,
): string[] => [
	filters?.flockId ?? "",
	filters?.feedTypeId ?? "",
	typeof filters?.activeOnly === "boolean" ? String(filters.activeOnly) : "",
];

export const feedingScheduleQueryKeys = {
	all: ["feeding-schedule"] as const,
	farm: (farmId: string) =>
		[...feedingScheduleQueryKeys.all, "farm", farmId] as const,
	feedingScheduleList: (
		farmId: string,
		filters?: Partial<IFeedingScheduleListFilters>,
	) =>
		[
			...feedingScheduleQueryKeys.farm(farmId),
			"list",
			normalizeFilters(filters),
		] as const,
};

export const useGetFeedingSchedules = ({
	farmId,
	filters,
}: {
	farmId: string;
	filters?: Partial<IFeedingScheduleListFilters>;
}) =>
	useQuery({
		queryKey: feedingScheduleQueryKeys.feedingScheduleList(farmId, filters),
		queryFn: () => getFeedingSchedules({ filters, page: 1, limit: 100 }),
		select: (data) => data.data,
		enabled: !!farmId,
	});

export const useCreateFeedingSchedule = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			payload,
		}: {
			payload: ICreateFeedingSchedulePayload;
			farmId: string;
		}) => createFeedingSchedule({ payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: async (_, { farmId }) => {
			toast.success(
				i18next.t("inventory:feedingSchedules.toast.createSuccess"),
			);
			await queryClient.invalidateQueries({
				queryKey: feedingScheduleQueryKeys.farm(farmId),
			});
		},
	});
};

export const useUpdateFeedingScheduleById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			feedingScheduleId,
			payload,
		}: {
			feedingScheduleId: string;
			payload: IUpdateFeedingSchedulePayload;
			farmId: string;
		}) => updateFeedingScheduleById({ feedingScheduleId, payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: async (_, { farmId }) => {
			toast.success(
				i18next.t("inventory:feedingSchedules.toast.updateSuccess"),
			);
			await queryClient.invalidateQueries({
				queryKey: feedingScheduleQueryKeys.farm(farmId),
			});
		},
	});
};

export const useDeleteFeedingScheduleById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			feedingScheduleId,
		}: {
			feedingScheduleId: string;
			farmId: string;
		}) => deleteFeedingScheduleById({ feedingScheduleId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: async (_, { farmId }) => {
			toast.success(
				i18next.t("inventory:feedingSchedules.toast.deleteSuccess"),
			);
			await queryClient.invalidateQueries({
				queryKey: feedingScheduleQueryKeys.farm(farmId),
			});
		},
	});
};
