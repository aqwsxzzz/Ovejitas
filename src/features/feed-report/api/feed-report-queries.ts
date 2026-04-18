import { useQuery } from "@tanstack/react-query";
import {
	getFeedCostByFlock,
	getFeedCostByLot,
} from "@/features/feed-report/api/feed-report-api";
import type {
	IFeedCostByFlockResponse,
	IFeedCostByLot,
} from "@/features/feed-report/types/feed-report-types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const toNumber = (value: unknown): number =>
	typeof value === "number"
		? value
		: typeof value === "string"
			? Number(value)
			: 0;

// Normalizer for cost-by-flock: handles the response envelope and ensures array
const normalizeFeedCostByFlockResponse = (
	value: unknown,
): IFeedCostByFlockResponse => {
	if (isRecord(value)) {
		const flocks = Array.isArray(value.flocks) ? value.flocks : [];
		return {
			from: typeof value.from === "string" ? value.from : null,
			to: typeof value.to === "string" ? value.to : null,
			flocks: flocks.map((flock) => {
				if (!isRecord(flock))
					return { flockId: null, totalQty: 0, totalCost: 0, byFeedType: [] };
				const byFeedType = Array.isArray(flock.byFeedType)
					? flock.byFeedType.map((ft) => ({
							feedTypeId:
								isRecord(ft) && typeof ft.feedTypeId === "string"
									? ft.feedTypeId
									: "",
							totalQty: isRecord(ft) ? toNumber(ft.totalQty) : 0,
							totalCost: isRecord(ft) ? toNumber(ft.totalCost) : 0,
						}))
					: [];
				return {
					flockId: typeof flock.flockId === "string" ? flock.flockId : null,
					totalQty: toNumber(flock.totalQty),
					totalCost: toNumber(flock.totalCost),
					byFeedType,
				};
			}),
		};
	}
	return { from: null, to: null, flocks: [] };
};

// Normalizer for cost-by-lot: handles the response envelope
const normalizeFeedCostByLot = (value: unknown): IFeedCostByLot | undefined => {
	if (!isRecord(value)) return undefined;

	const byFlock = Array.isArray(value.byFlock)
		? value.byFlock.map((flock) => ({
				flockId:
					isRecord(flock) && typeof flock.flockId === "string"
						? flock.flockId
						: null,
				totalQty: isRecord(flock) ? toNumber(flock.totalQty) : 0,
				totalCost: isRecord(flock) ? toNumber(flock.totalCost) : 0,
			}))
		: [];

	return {
		lotId: typeof value.lotId === "string" ? value.lotId : "",
		feedTypeId: typeof value.feedTypeId === "string" ? value.feedTypeId : "",
		qtyPurchased: toNumber(value.qtyPurchased),
		qtyRemaining: toNumber(value.qtyRemaining),
		qtyDrawn: toNumber(value.qtyDrawn),
		totalCost: toNumber(value.totalCost),
		byFlock,
	};
};

export const feedReportQueryKeys = {
	all: ["feed-report"] as const,
	farm: (farmId: string) =>
		[...feedReportQueryKeys.all, "farm", farmId] as const,
	costByFlock: (
		farmId: string,
		filters?: {
			from?: string;
			to?: string;
			flockId?: string;
		},
	) =>
		[
			...feedReportQueryKeys.farm(farmId),
			"cost-by-flock",
			filters?.from ?? "",
			filters?.to ?? "",
			filters?.flockId ?? "",
		] as const,
	costByLot: (farmId: string, lotId: string) =>
		[...feedReportQueryKeys.farm(farmId), "cost-by-lot", lotId] as const,
};

export const useGetFeedCostByFlock = ({
	farmId,
	filters,
}: {
	farmId: string;
	filters?: {
		from?: string;
		to?: string;
		flockId?: string;
	};
}) =>
	useQuery({
		queryKey: feedReportQueryKeys.costByFlock(farmId, filters),
		queryFn: () => getFeedCostByFlock({ filters }),
		select: (data) => normalizeFeedCostByFlockResponse(data.data),
		enabled: !!farmId,
	});

export const useGetFeedCostByLot = ({
	farmId,
	lotId,
}: {
	farmId: string;
	lotId?: string;
}) =>
	useQuery({
		queryKey: feedReportQueryKeys.costByLot(farmId, lotId ?? ""),
		queryFn: () => getFeedCostByLot({ lotId: lotId! }),
		select: (data) => normalizeFeedCostByLot(data.data),
		enabled: !!farmId && !!lotId,
	});
