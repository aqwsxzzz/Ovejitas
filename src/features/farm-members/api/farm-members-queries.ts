import { getFarmMembers } from "@/features/farm-members/api/farm-members-api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const DEFAULT_LIST_PAGE_SIZE = 20;
const LEGACY_LIST_PAGE_SIZE = 100;

export const farmMembersQueryKeys = {
	all: ["farm-members"] as const,
	farmMembersList: (farmId: string) =>
		[...farmMembersQueryKeys.all, "farmMembers", farmId] as const,
	farmMembersListPage: (farmId: string, limit: number) =>
		[...farmMembersQueryKeys.farmMembersList(farmId), "page", limit] as const,
};

export const useGetFarmMembers = ({ farmId }: { farmId: string }) =>
	useQuery({
		queryKey: farmMembersQueryKeys.farmMembersList(farmId),
		queryFn: () =>
			getFarmMembers({ farmId, page: 1, limit: LEGACY_LIST_PAGE_SIZE }),
		select: (data) => data.data,
		enabled: !!farmId,
		staleTime: 10000, // 10 seconds
	});

export const useGetInfiniteFarmMembers = ({
	farmId,
	limit = DEFAULT_LIST_PAGE_SIZE,
}: {
	farmId: string;
	limit?: number;
}) =>
	useInfiniteQuery({
		queryKey: farmMembersQueryKeys.farmMembersListPage(farmId, limit),
		queryFn: ({ pageParam }) =>
			getFarmMembers({
				farmId,
				page: pageParam,
				limit,
			}),
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
		staleTime: 10000,
	});

export const useGetFarmMembersPage = ({
	farmId,
	page,
	limit,
}: {
	farmId: string;
	page: number;
	limit: number;
}) =>
	useQuery({
		queryKey: [
			...farmMembersQueryKeys.farmMembersList(farmId),
			"paged",
			page,
			limit,
		],
		queryFn: () =>
			getFarmMembers({
				farmId,
				page,
				limit,
			}),
		select: (data) => {
			const pagination = data.meta?.pagination;

			return {
				items: data.data,
				page: pagination?.page ?? page,
				limit: pagination?.limit ?? limit,
				total: pagination?.total ?? data.data.length,
				totalPages: pagination?.totalPages ?? 1,
			};
		},
		enabled: !!farmId,
		staleTime: 10000,
	});
