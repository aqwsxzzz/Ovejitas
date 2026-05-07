import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import i18next from "i18next";
import {
	createFeedLot,
	deleteFeedLotById,
	getFeedLotById,
	getFeedLots,
	updateFeedLotById,
} from "@/features/feed-lot/api/feed-lot-api";
import type {
	ICreateFeedLotPayload,
	IFeedLotListFilters,
	IUpdateFeedLotPayload,
} from "@/features/feed-lot/types/feed-lot-types";

const DEFAULT_LIST_PAGE_SIZE = 20;

const normalizeFilters = (filters?: Partial<IFeedLotListFilters>): string[] => [
	filters?.feedTypeId ?? "",
	filters?.hasStock !== undefined ? String(filters.hasStock) : "",
];

export const feedLotQueryKeys = {
	all: ["feed-lot"] as const,
	farm: (farmId: string) => [...feedLotQueryKeys.all, "farm", farmId] as const,
	feedLotList: (farmId: string, filters?: Partial<IFeedLotListFilters>) =>
		[
			...feedLotQueryKeys.farm(farmId),
			"list",
			normalizeFilters(filters),
		] as const,
	feedLotListPage: (
		farmId: string,
		filters: Partial<IFeedLotListFilters> | undefined,
		limit: number,
	) =>
		[...feedLotQueryKeys.feedLotList(farmId, filters), "page", limit] as const,
	feedLotById: (feedLotId: string) =>
		[...feedLotQueryKeys.all, "byId", feedLotId] as const,
};

export const useGetFeedLots = ({
	farmId,
	filters,
}: {
	farmId: string;
	filters?: Partial<IFeedLotListFilters>;
}) =>
	useQuery({
		queryKey: feedLotQueryKeys.feedLotList(farmId, filters),
		queryFn: () => getFeedLots({ filters, page: 1, limit: 100 }),
		select: (data) => data.data,
		enabled: !!farmId,
	});

export const useGetInfiniteFeedLots = ({
	farmId,
	filters,
	limit = DEFAULT_LIST_PAGE_SIZE,
}: {
	farmId: string;
	filters?: Partial<IFeedLotListFilters>;
	limit?: number;
}) =>
	useInfiniteQuery({
		queryKey: feedLotQueryKeys.feedLotListPage(farmId, filters, limit),
		queryFn: ({ pageParam }) =>
			getFeedLots({ filters, page: pageParam, limit }),
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

export const useGetFeedLotById = (feedLotId: string) =>
	useQuery({
		queryKey: feedLotQueryKeys.feedLotById(feedLotId),
		queryFn: () => getFeedLotById({ feedLotId }),
		select: (data) => data.data,
		enabled: !!feedLotId,
	});

export const useCreateFeedLot = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			payload,
		}: {
			payload: ICreateFeedLotPayload;
			farmId: string;
		}) => createFeedLot({ payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: async (_, { farmId }) => {
			toast.success(i18next.t("feedLots:toast.createSuccess"));
			await queryClient.invalidateQueries({
				queryKey: feedLotQueryKeys.farm(farmId),
			});
		},
	});
};

export const useUpdateFeedLotById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			feedLotId,
			payload,
		}: {
			feedLotId: string;
			payload: IUpdateFeedLotPayload;
			farmId: string;
		}) => updateFeedLotById({ feedLotId, payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: async (_, { farmId, feedLotId }) => {
			toast.success(i18next.t("feedLots:toast.updateSuccess"));
			await queryClient.invalidateQueries({
				queryKey: feedLotQueryKeys.farm(farmId),
			});
			await queryClient.invalidateQueries({
				queryKey: feedLotQueryKeys.feedLotById(feedLotId),
			});
		},
	});
};

export const useDeleteFeedLotById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ feedLotId }: { feedLotId: string; farmId: string }) =>
			deleteFeedLotById({ feedLotId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: async (_, { farmId }) => {
			toast.success(i18next.t("feedLots:toast.deleteSuccess"));
			await queryClient.invalidateQueries({
				queryKey: feedLotQueryKeys.farm(farmId),
			});
		},
	});
};
