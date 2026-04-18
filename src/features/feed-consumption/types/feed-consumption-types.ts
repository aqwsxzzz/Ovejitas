export const feedConsumptionReasons = [
	"feeding",
	"waste",
	"transfer",
	"adjustment",
] as const;

export type FeedConsumptionReason = (typeof feedConsumptionReasons)[number];

export interface IFeedConsumptionLot {
	id: string;
	lotId: string;
	qtyDrawn: number;
	unitPriceSnapshot: number;
}

export interface IFeedConsumption {
	id: string;
	farmId: string;
	flockId: string | null;
	feedTypeId: string;
	consumedAt: string;
	qty: number;
	reason: FeedConsumptionReason;
	notes: string | null;
	createdBy: string;
	totalCost: number;
	lots: IFeedConsumptionLot[];
	createdAt: string;
	updatedAt: string;
}

export interface IFeedConsumptionListFilters {
	flockId?: string;
	feedTypeId?: string;
	from?: string;
	to?: string;
	include?: "lots";
}

export interface ICreateFeedConsumptionPayload {
	flockId: string | null;
	feedTypeId: string;
	consumedAt: string;
	qty: number;
	reason: FeedConsumptionReason;
	notes?: string;
}
