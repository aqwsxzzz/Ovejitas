export type ProfitabilityPeriod = "daily" | "weekly" | "monthly";

export interface IProfitabilityPeriodBreakdown {
	period: string;
	eggsCollected: number;
	eggsSellable: number;
	brokenEggs: number;
	eggRevenue: number;
	feedQuantity: number;
	feedCost: number;
	profit: number;
	profitMargin: number | null;
}

export interface IProfitabilityFlockRow {
	flockId: string;
	flockName: string;
	speciesId: string;
	eggsCollected: number;
	eggsSellable: number;
	brokenEggs: number;
	eggsCollectedStacks: number;
	totalEggRevenue: number;
	feedQuantity: number;
	totalFeedCost: number;
	totalExpenses: number;
	profit: number;
	profitMargin: number | null;
	costPerDozenEggs: number | null;
	fcrKgPerDozen: number | null;
	warnings: string[];
	periodBreakdown: IProfitabilityPeriodBreakdown[];
}

export interface IFlockProfitabilityReport {
	farmId: string;
	currency: string | null;
	reportPeriod: ProfitabilityPeriod;
	dateRange: {
		from: string;
		to: string;
	};
	flocks: IProfitabilityFlockRow[];
}

export interface IGetFlockProfitabilityParams {
	period: ProfitabilityPeriod;
	from: string;
	to: string;
	flockId?: string;
}
