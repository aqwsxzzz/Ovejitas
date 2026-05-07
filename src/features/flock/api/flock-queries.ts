import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import {
	createEggCollection,
	createFlockEvent,
	createFlock,
	deleteFlockById,
	deleteEggCollection,
	getEggCollections,
	getFlockById,
	getFlockEvents,
	getFlocks,
	logTodaysFeeding,
	updateEggCollection,
	updateFlockById,
} from "@/features/flock/api/flock-api";
import { feedConsumptionQueryKeys } from "@/features/feed-consumption/api/feed-consumption-queries";
import type {
	ICreateEggCollectionPayload,
	ICreateFlockPayload,
	ICreateFlockEventPayload,
	IFlockListFilters,
	IUpdateEggCollectionPayload,
	IUpdateFlockPayload,
} from "@/features/flock/types/flock-types";
import i18next from "i18next";
import { toast } from "sonner";

export const useDeleteFlockById = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ flockId }: { flockId: string; farmId: string }) =>
			deleteFlockById({ flockId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { farmId }) => {
			toast.success(i18next.t("flocks:deleteDialog.success"));
			void queryClient.invalidateQueries({
				queryKey: [...flockQueryKeys.all, "list", farmId],
			});
		},
	});
};

const normalizeFilters = (filters?: Partial<IFlockListFilters>): string[] => {
	return [
		filters?.status ?? "",
		filters?.flockType ?? "",
		filters?.speciesId ?? "",
	];
};

const DEFAULT_EVENTS_PAGE_SIZE = 5;
const DEFAULT_EGG_COLLECTIONS_PAGE_SIZE = 5;

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

export const useUpdateFlockById = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			flockId,
			payload,
		}: {
			flockId: string;
			farmId: string;
			payload: IUpdateFlockPayload;
		}) => updateFlockById({ flockId, payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { farmId, flockId }) => {
			toast.success(i18next.t("flocks:page.updateSuccess"));
			void queryClient.invalidateQueries({
				queryKey: [...flockQueryKeys.all, "list", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...flockQueryKeys.all, "byId", flockId],
			});
		},
	});
};

export const useCreateFlockEvent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			flockId,
			payload,
		}: {
			flockId: string;
			farmId: string;
			payload: ICreateFlockEventPayload;
		}) => createFlockEvent({ flockId, payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { farmId, flockId }) => {
			toast.success(i18next.t("flocks:page.updateSuccess"));
			void queryClient.invalidateQueries({
				queryKey: [...flockQueryKeys.all, "list", farmId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...flockQueryKeys.all, "byId", flockId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...flockQueryKeys.all, "events", flockId],
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

export const useGetInfiniteFlockEvents = ({
	flockId,
	limit = DEFAULT_EVENTS_PAGE_SIZE,
}: {
	flockId: string;
	limit?: number;
}) =>
	useInfiniteQuery({
		queryKey: [...flockQueryKeys.all, "events", flockId, "infinite", limit],
		queryFn: ({ pageParam }) =>
			getFlockEvents({ flockId, page: pageParam, limit }),
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
			const latestPagination =
				data.pages[data.pages.length - 1]?.meta?.pagination;

			return {
				items,
				total: latestPagination?.total ?? items.length,
				totalPages: latestPagination?.totalPages ?? 1,
			};
		},
		enabled: !!flockId,
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

export const useGetInfiniteEggCollections = ({
	flockId,
	limit = DEFAULT_EGG_COLLECTIONS_PAGE_SIZE,
}: {
	flockId: string;
	limit?: number;
}) =>
	useInfiniteQuery({
		queryKey: [
			...flockQueryKeys.all,
			"eggCollections",
			flockId,
			"infinite",
			limit,
		],
		queryFn: ({ pageParam }) =>
			getEggCollections({ flockId, page: pageParam, limit }),
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
			const latestPagination =
				data.pages[data.pages.length - 1]?.meta?.pagination;

			return {
				items,
				total: latestPagination?.total ?? items.length,
				totalPages: latestPagination?.totalPages ?? 1,
			};
		},
		enabled: !!flockId,
	});

export const useCreateEggCollection = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			flockId,
			payload,
		}: {
			flockId: string;
			farmId: string;
			payload: ICreateEggCollectionPayload;
		}) => createEggCollection({ flockId, payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { flockId }) => {
			toast.success(i18next.t("flocks:detail.eggCollections.recordSuccess"));
			void queryClient.invalidateQueries({
				queryKey: [...flockQueryKeys.all, "eggCollections", flockId],
			});
		},
	});
};

export const useUpdateEggCollection = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			flockId,
			collectionId,
			payload,
		}: {
			flockId: string;
			farmId: string;
			collectionId: string;
			payload: IUpdateEggCollectionPayload;
		}) => updateEggCollection({ flockId, collectionId, payload }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { flockId }) => {
			toast.success(i18next.t("flocks:detail.eggCollections.updateSuccess"));
			void queryClient.invalidateQueries({
				queryKey: [...flockQueryKeys.all, "eggCollections", flockId],
			});
		},
	});
};

export const useDeleteEggCollection = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			flockId,
			collectionId,
		}: {
			flockId: string;
			farmId: string;
			collectionId: string;
		}) => deleteEggCollection({ flockId, collectionId }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { flockId }) => {
			toast.success(i18next.t("flocks:detail.eggCollections.deleteSuccess"));
			void queryClient.invalidateQueries({
				queryKey: [...flockQueryKeys.all, "eggCollections", flockId],
			});
		},
	});
};

export const useLogTodaysFeeding = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			flockId,
			date,
		}: {
			flockId: string;
			farmId: string;
			date?: string;
		}) => logTodaysFeeding({ flockId, payload: { ...(date ? { date } : {}) } }),
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_, { farmId, flockId }) => {
			toast.success(i18next.t("flocks:detail.logToday.success"));
			void queryClient.invalidateQueries({
				queryKey: [...flockQueryKeys.all, "byId", flockId],
			});
			void queryClient.invalidateQueries({
				queryKey: [...flockQueryKeys.all, "events", flockId],
			});
			void queryClient.invalidateQueries({
				queryKey: feedConsumptionQueryKeys.farm(farmId),
			});
		},
	});
};
