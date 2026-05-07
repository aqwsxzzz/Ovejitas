export interface IEggPricing {
	id: string;
	farmId: string;
	pricePerEgg: number;
	currency: string | null;
	effectiveFrom: string;
	effectiveTo: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ICreateEggPricingPayload {
	pricePerEgg: number;
	effectiveFrom?: string;
}
