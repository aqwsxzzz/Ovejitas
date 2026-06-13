import { useEffect, useRef } from "react";

interface UseInfiniteEventsLoaderParams {
	unitId: string;
	effectiveSelectedEventType: string | undefined;
	hasNextEventsLogPage: boolean | undefined;
	isPendingEventsLog: boolean;
	isFetchingNextEventsLogPage: boolean;
	timelineEventsLength: number;
	visibleTimelineEventsLength: number;
	fetchNextEventsLogPage: () => Promise<unknown>;
	eventsLoadMoreRef: React.RefObject<HTMLDivElement | null>;
	eventsScrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteEventsLoader({
	unitId,
	effectiveSelectedEventType,
	hasNextEventsLogPage,
	isPendingEventsLog,
	isFetchingNextEventsLogPage,
	timelineEventsLength,
	visibleTimelineEventsLength,
	fetchNextEventsLogPage,
	eventsLoadMoreRef,
	eventsScrollContainerRef,
}: UseInfiniteEventsLoaderParams) {
	const hasAutoLoadedEventsPageRef = useRef(false);

	useEffect(() => {
		hasAutoLoadedEventsPageRef.current = false;
	}, [unitId, effectiveSelectedEventType]);

	useEffect(() => {
		const root = eventsScrollContainerRef.current;
		if (!root || hasAutoLoadedEventsPageRef.current) return;
		if (
			!hasNextEventsLogPage ||
			isPendingEventsLog ||
			isFetchingNextEventsLogPage ||
			timelineEventsLength === 0
		) {
			return;
		}
		if (root.scrollHeight > root.clientHeight + 8) return;

		hasAutoLoadedEventsPageRef.current = true;
		void fetchNextEventsLogPage();
	}, [
		fetchNextEventsLogPage,
		hasNextEventsLogPage,
		isPendingEventsLog,
		isFetchingNextEventsLogPage,
		timelineEventsLength,
		visibleTimelineEventsLength,
		eventsScrollContainerRef,
	]);

	useEffect(() => {
		const target = eventsLoadMoreRef.current;
		const root = eventsScrollContainerRef.current;
		if (!target || !root || !hasNextEventsLogPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry?.isIntersecting || isFetchingNextEventsLogPage) return;
				void fetchNextEventsLogPage();
			},
			{ root, rootMargin: "200px" },
		);

		observer.observe(target);
		return () => observer.disconnect();
	}, [
		fetchNextEventsLogPage,
		hasNextEventsLogPage,
		isFetchingNextEventsLogPage,
		timelineEventsLength,
		visibleTimelineEventsLength,
		eventsLoadMoreRef,
		eventsScrollContainerRef,
	]);
}
