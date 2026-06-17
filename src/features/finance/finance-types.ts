import type {
	LivestockAssetKind,
	MaterialConsumptionReason,
} from "@/features/livestock/types/livestock-types";
import type {
	ProductionBucket,
	Unit,
} from "@/features/reports/types/reports-types";

export type FinanceAssetKindFilter = "all" | LivestockAssetKind;
export type FinanceMaterialReasonFilter = "all" | MaterialConsumptionReason;
export type FinanceReportType =
	| "profitability"
	| "income-trend"
	| "expense-trend"
	| "cost-per-unit"
	| "coop-productivity"
	| "sales-value";

export interface FinanceFilters {
	bucket: ProductionBucket;
	dateFrom: string;
	dateTo: string;
	assetKind: FinanceAssetKindFilter;
	assetId?: number;
	productionUnit: Unit;
	materialReason: FinanceMaterialReasonFilter;
}

const toDateInput = (value: Date): string => {
	const year = value.getFullYear();
	const month = String(value.getMonth() + 1).padStart(2, "0");
	const day = String(value.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const createDefaultFinanceFilters = (): FinanceFilters => {
	const today = new Date();
	const from = new Date(today);
	from.setDate(from.getDate() - 29);

	return {
		bucket: "week",
		dateFrom: toDateInput(from),
		dateTo: toDateInput(today),
		assetKind: "all",
		productionUnit: "dozen",
		materialReason: "all",
	};
};