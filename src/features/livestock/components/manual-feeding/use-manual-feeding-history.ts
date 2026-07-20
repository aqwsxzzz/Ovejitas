import { useState } from "react";

import { useListMaterialConsumptionsByFarmId } from "@/features/livestock/api/livestock-queries";

const HISTORY_PAGE_SIZE = 20;

interface UseManualFeedingHistoryArgs {
	farmId: string;
	consumerAssetId: number;
	enabled: boolean;
}

/** Convert a yyyy-mm-dd input value into a day-boundary ISO string, or undefined. */
function toDayBoundaryIso(dateValue: string, endOfDay: boolean): string | undefined {
	if (!dateValue) return undefined;
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return undefined;
	date.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
	return date.toISOString();
}

export function useManualFeedingHistory({
	farmId,
	consumerAssetId,
	enabled,
}: UseManualFeedingHistoryArgs) {
	const [page, setPage] = useState(1);
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");

	const query = useListMaterialConsumptionsByFarmId({
		farmId,
		filters: {
			consumerAssetId,
			reason: "feeding",
			from: toDayBoundaryIso(from, false),
			to: toDayBoundaryIso(to, true),
			page,
			pageSize: HISTORY_PAGE_SIZE,
		},
		enabled: enabled && !!farmId,
	});

	const changeFrom = (value: string) => {
		setFrom(value);
		setPage(1);
	};

	const changeTo = (value: string) => {
		setTo(value);
		setPage(1);
	};

	return {
		rows: query.data?.data ?? [],
		hasNext: query.data?.meta.has_next ?? false,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
		page,
		from,
		to,
		changeFrom,
		changeTo,
		goToPreviousPage: () => setPage((current) => Math.max(1, current - 1)),
		goToNextPage: () => setPage((current) => current + 1),
	};
}
