export interface IFeedLot {
	id: string;
	farmId: string;
	feedTypeId: string;
	qtyPurchased: number;
	qtyRemaining: number;
	unitPrice: number;
	purchasedAt: string;
	supplier: string | null;
	notes: string | null;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface IFeedLotListFilters {
	feedTypeId?: string;
	hasStock?: boolean;
}

export interface ICreateFeedLotPayload {
	feedTypeId: string;
	qtyPurchased: number;
	unitPrice: number;
	purchasedAt: string;
	supplier?: string;
	notes?: string;
}

export interface IUpdateFeedLotPayload {
	unitPrice?: number;
	purchasedAt?: string;
	supplier?: string;
	notes?: string;
}
