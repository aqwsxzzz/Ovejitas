import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import {
	createFlock,
	getEggCollections,
	getFlockById,
	getFlockEvents,
	getFlocks,
} from "@/features/flock/api/flock-api";
import type {
	ICreateFlockPayload,
	IFlockListFilters,
} from "@/features/flock/types/flock-types";
import i18next from "i18next";
import { toast } from "sonner";

const normalizeFilters = (filters?: Partial<IFlockListFilters>): string[] => {
	return [
		filters?.status ?? "",
		filters?.flockType ?? "",
		filters?.speciesId ?? "",
	];
};

export const flockQueryKeys = {
	all: ["flock"] as const,
	flockList: (farmId: string, filters?: Partial<IFlockListFilters>) =>
		[...flockQueryKeys.all, "list", farmId, normalizeFilters(filters)] as const,
	flockPagedList: (
		farmId: string,
		filters: Partial<IFlockListFilters> | undefined,
		page: number,
		limit: number,
	) =>
		[
			...flockQueryKeys.flockList(farmId, filters),
			"paged",
			page,
			limit,
			i18next.language,
		] as const,
	flockById: (flockId: string, include?: string) =>
		[
			...flockQueryKeys.all,
			"byId",
			flockId,
			include ?? "",
			i18next.language,
		] as const,
	flockEvents: (flockId: string, page: number, limit: number) =>
		[...flockQueryKeys.all, "events", flockId, page, limit] as const,
	eggCollections: (flockId: string, page: number, limit: number) =>
		[...flockQueryKeys.all, "eggCollections", flockId, page, limit] as const,
};

export const useGetFlocksPage = ({
	farmId,
	filters,
	page,
	limit,
	include,
}: {
	farmId: string;
	filters?: Partial<IFlockListFilters>;
	page: number;
	limit: number;
	include?: string;
}) =>
	useQuery({
		queryKey: flockQueryKeys.flockPagedList(farmId, filters, page, limit),
		queryFn: () =>
			getFlocks({
				farmId,
				include,
				withLanguage: true,
				filters,
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
				totalPages: Math.max(1, pagination?.totalPages ?? 1),
			};
		},
		enabled: !!farmId,
		placeholderData: keepPreviousData,
		staleTime: 10000,
	});

export const useGetFlockById = ({
	flockId,
	include,
}: {
	flockId: string;
	include?: string;
}) =>
	useQuery({
		queryKey: flockQueryKeys.flockById(flockId, include),
		queryFn: () => getFlockById({ flockId, include, withLanguage: true }),
		select: (data) => data.data,
		enabled: !!flockId,
	});

export const useCreateFlock = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			payload,
		}: {
			farmId: string;
			payload: ICreateFlockPayload;
		}) => createFlock({ payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { farmId }) => {
			toast.success(i18next.t("flocks:page.createSuccess"));
			void queryClient.invalidateQueries({
				queryKey: [...flockQueryKeys.all, "list", farmId],
			});
		},
	});
};

export const useGetFlockEventsPage = ({
	flockId,
	page,
	limit,
}: {
	flockId: string;
	page: number;
	limit: number;
}) =>
	useQuery({
		queryKey: flockQueryKeys.flockEvents(flockId, page, limit),
		queryFn: () => getFlockEvents({ flockId, page, limit }),
		select: (data) => {
			const pagination = data.meta?.pagination;

			return {
				items: data.data,
				page: pagination?.page ?? page,
				limit: pagination?.limit ?? limit,
				total: pagination?.total ?? data.data.length,
				totalPages: Math.max(1, pagination?.totalPages ?? 1),
			};
		},
		enabled: !!flockId,
		placeholderData: keepPreviousData,
	});

export const useGetEggCollectionsPage = ({
	flockId,
	page,
	limit,
}: {
	flockId: string;
	page: number;
	limit: number;
}) =>
	useQuery({
		queryKey: flockQueryKeys.eggCollections(flockId, page, limit),
		queryFn: () => getEggCollections({ flockId, page, limit }),
		select: (data) => {
			const pagination = data.meta?.pagination;

			return {
				items: data.data,
				page: pagination?.page ?? page,
				limit: pagination?.limit ?? limit,
				total: pagination?.total ?? data.data.length,
				totalPages: Math.max(1, pagination?.totalPages ?? 1),
			};
		},
		enabled: !!flockId,
		placeholderData: keepPreviousData,
	});
