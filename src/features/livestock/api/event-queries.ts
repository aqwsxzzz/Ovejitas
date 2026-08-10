import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { listEventsByAssetId } from "@/features/livestock/api/livestock-api";
import type { ListEventsFilters } from "@/features/livestock/api/livestock-query-filters";
import { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";

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

