import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import i18next from "i18next";
import {
	createFeedType,
	deleteFeedTypeById,
	getFeedTypeById,
	getFeedTypes,
	updateFeedTypeById,
} from "@/features/feed-type/api/feed-type-api";
import type {
	ICreateFeedTypePayload,
	IUpdateFeedTypePayload,
} from "@/features/feed-type/types/feed-type-types";

const DEFAULT_LIST_PAGE_SIZE = 20;

export const feedTypeQueryKeys = {
	all: ["feed-type"] as const,
	farm: (farmId: string) => [...feedTypeQueryKeys.all, "farm", farmId] as const,
	feedTypeList: (farmId: string) =>
		[...feedTypeQueryKeys.farm(farmId), "list"] as const,
	feedTypeListPage: (farmId: string, limit: number) =>
		[...feedTypeQueryKeys.feedTypeList(farmId), "page", limit] as const,
	feedTypeById: (feedTypeId: string) =>
		[...feedTypeQueryKeys.all, "byId", feedTypeId] as const,
};

export const useGetFeedTypes = ({
	farmId,
	limit,
}: {
	farmId: string;
	limit?: number;
}) =>
	useQuery({
		queryKey: feedTypeQueryKeys.feedTypeList(farmId),
		queryFn: () => getFeedTypes({ page: 1, limit: limit ?? 100 }),
		select: (data) => data.data,
		enabled: !!farmId,
	});

export const useGetInfiniteFeedTypes = ({
	farmId,
	limit = DEFAULT_LIST_PAGE_SIZE,
}: {
	farmId: string;
	limit?: number;
}) =>
	useInfiniteQuery({
		queryKey: feedTypeQueryKeys.feedTypeListPage(farmId, limit),
		queryFn: ({ pageParam }) => getFeedTypes({ page: pageParam, limit }),
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

export const useGetFeedTypeById = (feedTypeId: string) =>
	useQuery({
		queryKey: feedTypeQueryKeys.feedTypeById(feedTypeId),
		queryFn: () => getFeedTypeById({ feedTypeId }),
		select: (data) => data.data,
		enabled: !!feedTypeId,
	});

export const useCreateFeedType = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			payload,
		}: {
			payload: ICreateFeedTypePayload;
			farmId: string;
		}) => createFeedType({ payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: async (_, { farmId }) => {
			toast.success(i18next.t("feedTypes:toast.createSuccess"));
			await queryClient.invalidateQueries({
				queryKey: feedTypeQueryKeys.farm(farmId),
			});
		},
	});
};

export const useUpdateFeedTypeById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			feedTypeId,
			payload,
		}: {
			feedTypeId: string;
			payload: IUpdateFeedTypePayload;
			farmId: string;
		}) => updateFeedTypeById({ feedTypeId, payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: async (_, { farmId, feedTypeId }) => {
			toast.success(i18next.t("feedTypes:toast.updateSuccess"));
			await queryClient.invalidateQueries({
				queryKey: feedTypeQueryKeys.farm(farmId),
			});
			await queryClient.invalidateQueries({
				queryKey: feedTypeQueryKeys.feedTypeById(feedTypeId),
			});
		},
	});
};

export const useDeleteFeedTypeById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ feedTypeId }: { feedTypeId: string; farmId: string }) =>
			deleteFeedTypeById({ feedTypeId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: async (_, { farmId }) => {
			toast.success(i18next.t("feedTypes:toast.deleteSuccess"));
			await queryClient.invalidateQueries({
				queryKey: feedTypeQueryKeys.farm(farmId),
			});
		},
	});
};
