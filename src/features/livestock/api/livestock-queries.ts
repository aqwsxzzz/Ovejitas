import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
	listEventCategoriesByFarmId,
	listEventsByAssetId,
	getLivestockAssetById,
	listLivestockAssetsByFarmId,
	listIndividualsByAssetId,
	getIndividualById,
} from "@/features/livestock/api/livestock-api";
import type {
	ILivestockAsset,
	ILivestockEventCategory,
	ILivestockIndividual,
	LivestockEventType,
	LivestockAssetKind,
	LivestockAssetMode,
} from "@/features/livestock/types/livestock-types";

interface ListLivestockAssetsFilters {
	q?: string;
	sort?: string;
	dateFrom?: string;
	dateTo?: string;
	kind?: LivestockAssetKind;
	mode?: LivestockAssetMode;
	page?: number;
	pageSize?: number;
}

interface ListIndividualsFilters {
	q?: string;
	sort?: string;
	status?: ILivestockIndividual["status"];
	dateFrom?: string;
	dateTo?: string;
	page?: number;
	pageSize?: number;
}

interface ListEventsFilters {
	q?: string;
	sort?: string;
	type?: LivestockEventType;
	categoryId?: number;
	individualId?: number;
	page?: number;
	pageSize?: number;
}

interface ListEventCategoriesFilters {
	q?: string;
	sort?: string;
	type?: LivestockEventType;
	archived?: boolean;
	page?: number;
	pageSize?: number;
}

export const livestockQueryKeys = {
	all: ["livestock"] as const,
	assetsByFarm: (farmId: string, filters?: ListLivestockAssetsFilters) =>
		[
			...livestockQueryKeys.all,
			"assetsByFarm",
			farmId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.dateFrom ?? "",
			filters?.dateTo ?? "",
			filters?.kind ?? "",
			filters?.mode ?? "",
			filters?.page ?? 1,
			filters?.pageSize ?? 20,
		] as const,
	assetById: (farmId: string, assetId: number) =>
		[...livestockQueryKeys.all, "assetById", farmId, assetId] as const,
	individualsByAsset: (
		farmId: string,
		assetId: string,
		filters?: ListIndividualsFilters,
	) =>
		[
			...livestockQueryKeys.all,
			"individualsByAsset",
			farmId,
			assetId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.status ?? "",
			filters?.dateFrom ?? "",
			filters?.dateTo ?? "",
			filters?.page ?? 1,
			filters?.pageSize ?? 20,
		] as const,
	individualById: (farmId: string, assetId: string, individualId: string) =>
		[
			...livestockQueryKeys.all,
			"individualById",
			farmId,
			assetId,
			individualId,
		] as const,
	eventsByAsset: (
		farmId: string,
		assetId: string,
		filters?: ListEventsFilters,
	) =>
		[
			...livestockQueryKeys.all,
			"eventsByAsset",
			farmId,
			assetId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.type ?? "",
			filters?.categoryId ?? "",
			filters?.individualId ?? "",
			filters?.page ?? 1,
			filters?.pageSize ?? 20,
		] as const,
	eventsByAssetInfinite: (
		farmId: string,
		assetId: string,
		filters?: Omit<ListEventsFilters, "page" | "pageSize">,
		pageSize = 20,
	) =>
		[
			...livestockQueryKeys.all,
			"eventsByAssetInfinite",
			farmId,
			assetId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.type ?? "",
			filters?.categoryId ?? "",
			filters?.individualId ?? "",
			pageSize,
		] as const,
	eventCategoriesByFarm: (
		farmId: string,
		filters?: ListEventCategoriesFilters,
	) =>
		[
			...livestockQueryKeys.all,
			"eventCategoriesByFarm",
			farmId,
			filters?.q ?? "",
			filters?.sort ?? "",
			filters?.type ?? "",
			filters?.archived ?? false,
			filters?.page ?? 1,
			filters?.pageSize ?? 100,
		] as const,
};

export const useListLivestockAssetsByFarmId = ({
	farmId,
	filters,
	enabled = true,
}: {
	farmId: string;
	filters?: ListLivestockAssetsFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.assetsByFarm(farmId, filters),
		queryFn: () => listLivestockAssetsByFarmId({ farmId, filters }),
		enabled: enabled && !!farmId,
	});

export const useGetLivestockAssetById = ({
	farmId,
	assetId,
	enabled = true,
}: {
	farmId: string;
	assetId: number;
	enabled?: boolean;
}) =>
	useQuery<ILivestockAsset>({
		queryKey: livestockQueryKeys.assetById(farmId, assetId),
		queryFn: () => getLivestockAssetById({ farmId, assetId }),
		enabled: enabled && !!farmId && Number.isFinite(assetId),
	});

export const useListIndividualsByAssetId = ({
	farmId,
	assetId,
	filters,
	enabled = true,
}: {
	farmId: string;
	assetId: string;
	filters?: ListIndividualsFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.individualsByAsset(farmId, assetId, filters),
		queryFn: () => listIndividualsByAssetId({ farmId, assetId, filters }),
		enabled: enabled && !!farmId && !!assetId,
	});

export const useGetIndividualById = ({
	farmId,
	assetId,
	individualId,
	enabled = true,
}: {
	farmId: string;
	assetId: string;
	individualId: string;
	enabled?: boolean;
}) =>
	useQuery<ILivestockIndividual>({
		queryKey: livestockQueryKeys.individualById(farmId, assetId, individualId),
		queryFn: () => getIndividualById({ farmId, assetId, individualId }),
		enabled: enabled && !!farmId && !!assetId && !!individualId,
	});

export const useListEventsByAssetId = ({
	farmId,
	assetId,
	filters,
	enabled = true,
}: {
	farmId: string;
	assetId: string;
	filters?: ListEventsFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockQueryKeys.eventsByAsset(farmId, assetId, filters),
		queryFn: () => listEventsByAssetId({ farmId, assetId, filters }),
		enabled: enabled && !!farmId && !!assetId,
	});

export const useListInfiniteEventsByAssetId = ({
	farmId,
	assetId,
	filters,
	pageSize = 20,
	enabled = true,
}: {
	farmId: string;
	assetId: string;
	filters?: Omit<ListEventsFilters, "page" | "pageSize">;
	pageSize?: number;
	enabled?: boolean;
}) =>
	useInfiniteQuery({
		queryKey: livestockQueryKeys.eventsByAssetInfinite(
			farmId,
			assetId,
			filters,
			pageSize,
		),
		queryFn: ({ pageParam }) =>
			listEventsByAssetId({
				farmId,
				assetId,
				filters: {
					...filters,
					page: pageParam,
					pageSize,
				},
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.meta.has_next ? lastPage.meta.page + 1 : undefined,
		select: (data) => ({
			items: data.pages.flatMap((page) => page.data),
			total: data.pages.at(-1)?.meta.total ?? 0,
		}),
		enabled: enabled && !!farmId && !!assetId,
	});

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
