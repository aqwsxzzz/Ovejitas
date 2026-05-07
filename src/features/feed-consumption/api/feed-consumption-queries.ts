import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import i18next from "i18next";
import {
	createFeedConsumption,
	deleteFeedConsumptionById,
	getFeedConsumptionById,
	getFeedConsumptions,
} from "@/features/feed-consumption/api/feed-consumption-api";
import type {
	ICreateFeedConsumptionPayload,
	IFeedConsumptionListFilters,
} from "@/features/feed-consumption/types/feed-consumption-types";
import { feedLotQueryKeys } from "@/features/feed-lot/api/feed-lot-queries";

const DEFAULT_LIST_PAGE_SIZE = 20;

const normalizeFilters = (
	filters?: Partial<IFeedConsumptionListFilters>,
): string[] => [
	filters?.flockId ?? "",
	filters?.feedTypeId ?? "",
	filters?.from ?? "",
	filters?.to ?? "",
	filters?.include ?? "",
];

export const feedConsumptionQueryKeys = {
	all: ["feed-consumption"] as const,
	farm: (farmId: string) =>
		[...feedConsumptionQueryKeys.all, "farm", farmId] as const,
	feedConsumptionList: (
		farmId: string,
		filters?: Partial<IFeedConsumptionListFilters>,
	) =>
		[
			...feedConsumptionQueryKeys.farm(farmId),
			"list",
			normalizeFilters(filters),
		] as const,
	feedConsumptionListPage: (
		farmId: string,
		filters: Partial<IFeedConsumptionListFilters> | undefined,
		limit: number,
	) =>
		[
			...feedConsumptionQueryKeys.feedConsumptionList(farmId, filters),
			"page",
			limit,
		] as const,
	feedConsumptionById: (feedConsumptionId: string) =>
		[...feedConsumptionQueryKeys.all, "byId", feedConsumptionId] as const,
};

export const useGetFeedConsumptions = ({
	farmId,
	filters,
}: {
	farmId: string;
	filters?: Partial<IFeedConsumptionListFilters>;
}) =>
	useQuery({
		queryKey: feedConsumptionQueryKeys.feedConsumptionList(farmId, filters),
		queryFn: () => getFeedConsumptions({ filters, page: 1, limit: 100 }),
		select: (data) => data.data,
		enabled: !!farmId,
	});

export const useGetInfiniteFeedConsumptions = ({
	farmId,
	filters,
	limit = DEFAULT_LIST_PAGE_SIZE,
}: {
	farmId: string;
	filters?: Partial<IFeedConsumptionListFilters>;
	limit?: number;
}) =>
	useInfiniteQuery({
		queryKey: feedConsumptionQueryKeys.feedConsumptionListPage(
			farmId,
			filters,
			limit,
		),
		queryFn: ({ pageParam }) =>
			getFeedConsumptions({ filters, page: pageParam, limit }),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const pagination = lastPage.meta?.pagination;
			if (!pagination) {
				return undefined;
			}

			return pagination.page < pagination.totalPages
				? pagination.page + 1
				: undefined;
		},
		select: (data) => {
			const items = data.pages.flatMap((page) => page.data);
			const latestPagination = data.pages.at(-1)?.meta?.pagination;

			return {
				items,
				total: latestPagination?.total ?? items.length,
				totalPages: latestPagination?.totalPages ?? 1,
			};
		},
		enabled: !!farmId,
	});

export const useGetFeedConsumptionById = (feedConsumptionId: string) =>
	useQuery({
		queryKey: feedConsumptionQueryKeys.feedConsumptionById(feedConsumptionId),
		queryFn: () => getFeedConsumptionById({ feedConsumptionId }),
		select: (data) => data.data,
		enabled: !!feedConsumptionId,
	});

export const useCreateFeedConsumption = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			payload,
		}: {
			payload: ICreateFeedConsumptionPayload;
			farmId: string;
		}) => createFeedConsumption({ payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: async (_, { farmId }) => {
			toast.success(i18next.t("feedConsumptions:toast.createSuccess"));
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: feedConsumptionQueryKeys.farm(farmId),
				}),
				queryClient.invalidateQueries({
					queryKey: feedLotQueryKeys.farm(farmId),
				}),
			]);
		},
	});
};

export const useDeleteFeedConsumptionById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			feedConsumptionId,
		}: {
			feedConsumptionId: string;
			farmId: string;
		}) => deleteFeedConsumptionById({ feedConsumptionId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: async (_, { farmId }) => {
			toast.success(i18next.t("feedConsumptions:toast.deleteSuccess"));
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: feedConsumptionQueryKeys.farm(farmId),
				}),
				queryClient.invalidateQueries({
					queryKey: feedLotQueryKeys.farm(farmId),
				}),
			]);
		},
	});
};
