import {
	getFarmInvitationList,
	sendFarmInvitation,
} from "@/features/farm-invitations/api/farm-invitations-api";
import type { IFarmInvitationPayload } from "@/features/farm-invitations/types/farm-invitations-types";
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

const DEFAULT_LIST_PAGE_SIZE = 20;
const LEGACY_LIST_PAGE_SIZE = 100;

export const farmInvitationsQueryKeys = {
	all: ["farm-invitations"] as const,
	invitationsList: (farmId: string) =>
		[...farmInvitationsQueryKeys.all, "list", farmId] as const,
	invitationsListPage: (farmId: string, limit: number) =>
		[
			...farmInvitationsQueryKeys.invitationsList(farmId),
			"page",
			limit,
		] as const,
};

export const useSendFarmInvitation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ payload }: { payload: IFarmInvitationPayload }) =>
			sendFarmInvitation({ payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { payload }) => {
			toast.success("Invitation sent successfully");
			void queryClient.invalidateQueries({
				queryKey: farmInvitationsQueryKeys.invitationsList(payload.farmId),
			});
		},
	});
};

export const useGetFarmInvitationsList = ({ farmId }: { farmId: string }) =>
	useQuery({
		queryKey: farmInvitationsQueryKeys.invitationsList(farmId),
		queryFn: () =>
			getFarmInvitationList({ farmId, page: 1, limit: LEGACY_LIST_PAGE_SIZE }),
		select: (data) => data.data,
		enabled: !!farmId,
		staleTime: 10000, // 10 seconds
	});

export const useGetInfiniteFarmInvitationsList = ({
	farmId,
	limit = DEFAULT_LIST_PAGE_SIZE,
}: {
	farmId: string;
	limit?: number;
}) =>
	useInfiniteQuery({
		queryKey: farmInvitationsQueryKeys.invitationsListPage(farmId, limit),
		queryFn: ({ pageParam }) =>
			getFarmInvitationList({
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

export const useGetFarmInvitationsListPage = ({
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
			...farmInvitationsQueryKeys.invitationsList(farmId),
			"paged",
			page,
			limit,
		],
		queryFn: () =>
			getFarmInvitationList({
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
