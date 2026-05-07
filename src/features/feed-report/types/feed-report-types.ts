// By-Flock Report - per-feed-type breakdown
export interface IFeedCostByFeedType {
	feedTypeId: string;
	totalQty: number;
	totalCost: number;
}

export interface IFeedCostByFlockRow {
	flockId: string | null; // null for waste/transfers without flock attribution
	totalQty: number;
	totalCost: number;
	byFeedType: IFeedCostByFeedType[];
}

export interface IFeedCostByFlockResponse {
	from: string | null; // ISO date or null
	to: string | null; // ISO date or null
	flocks: IFeedCostByFlockRow[];
}

// By-Lot Report - consumption breakdown by flock
export interface IFeedCostByFlockDetail {
	flockId: string | null; // null for waste/transfers
	totalQty: number;
	totalCost: number;
}

export interface IFeedCostByLot {
	lotId: string;
	feedTypeId: string;
	qtyPurchased: number;
	qtyRemaining: number;
	qtyDrawn: number;
	totalCost: number;
	byFlock: IFeedCostByFlockDetail[];
}
