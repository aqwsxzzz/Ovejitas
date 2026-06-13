import { useMemo, useRef } from "react";

import {
	useListEventsByAssetId,
	useListEventCategoriesByFarmId,
	useListInfiniteEventsByAssetId,
	useListIndividualsByAssetId,
} from "@/features/livestock/api/livestock-queries";

import {
	EVENTS_LOG_PAGE_SIZE,
	getEventTypeFilterOptions,
	isLivestockEventType,
} from "./flock-detail-types";
import type { ILivestockAsset } from "@/features/livestock/types/livestock-types";
import { useInfiniteEventsLoader } from "./use-infinite-events-loader";

interface UseFlockEventsDataParams {
	farmId: string;
	unitId: string;
	asset: ILivestockAsset;
	eventTypeFilter?: string;
}

export function useFlockEventsData({
	farmId,
	unitId,
	asset,
	eventTypeFilter,
}: UseFlockEventsDataParams) {
	const selectedEventType =
		typeof eventTypeFilter === "string" && isLivestockEventType(eventTypeFilter)
			? eventTypeFilter
			: undefined;
	const eventTypeFilterOptions = useMemo(
		() => getEventTypeFilterOptions(asset.kind),
		[asset.kind],
	);
	const effectiveSelectedEventType = useMemo(() => {
		if (!selectedEventType) return undefined;
		return eventTypeFilterOptions.some(
			(option) => option.value === selectedEventType,
		)
			? selectedEventType
			: undefined;
	}, [eventTypeFilterOptions, selectedEventType]);

	const eventsLoadMoreRef = useRef<HTMLDivElement | null>(null);
	const eventsScrollContainerRef = useRef<HTMLDivElement | null>(null);

	const { data: eventCategories = [] } = useListEventCategoriesByFarmId({
		farmId,
		filters: { archived: false, pageSize: 100 },
		enabled: !!farmId,
	});
	const { data: allIndividualsResponse } = useListIndividualsByAssetId({
		farmId,
		assetId: unitId,
		filters: { pageSize: 100 },
		enabled: !!farmId && !!unitId,
	});
	const {
		data: eventsLogData,
		isPending: isPendingEventsLog,
		hasNextPage: hasNextEventsLogPage,
		fetchNextPage: fetchNextEventsLogPage,
		isFetchingNextPage: isFetchingNextEventsLogPage,
	} = useListInfiniteEventsByAssetId({
		farmId,
		assetId: unitId,
		filters: { sort: "-occurred_at", type: effectiveSelectedEventType },
		pageSize: EVENTS_LOG_PAGE_SIZE,
		enabled: !!farmId && !!unitId,
	});
	const { data: eventsSummaryResponse } = useListEventsByAssetId({
		farmId,
		assetId: unitId,
		filters: { page: 1, pageSize: 1 },
		enabled: !!farmId && !!unitId,
	});

	const allIndividuals = allIndividualsResponse?.data ?? [];
	const timelineEvents = useMemo(
		() => eventsLogData?.items ?? [],
		[eventsLogData?.items],
	);
	const visibleTimelineEvents = useMemo(() => {
		if (effectiveSelectedEventType) return timelineEvents;
		return timelineEvents.filter((event) => event.type !== "inventory");
	}, [effectiveSelectedEventType, timelineEvents]);
	const hasAssetEvents = (eventsSummaryResponse?.meta.total ?? 0) > 0;

	useInfiniteEventsLoader({
		unitId,
		effectiveSelectedEventType,
		hasNextEventsLogPage,
		isPendingEventsLog,
		isFetchingNextEventsLogPage,
		timelineEventsLength: timelineEvents.length,
		visibleTimelineEventsLength: visibleTimelineEvents.length,
		fetchNextEventsLogPage,
		eventsLoadMoreRef,
		eventsScrollContainerRef,
	});

	return {
		eventCategories,
		allIndividuals,
		eventTypeFilterOptions,
		effectiveSelectedEventType,
		visibleTimelineEvents,
		hasAssetEvents,
		isPendingEventsLog,
		hasNextEventsLogPage,
		isFetchingNextEventsLogPage,
		eventsLoadMoreRef,
		eventsScrollContainerRef,
	};
}
