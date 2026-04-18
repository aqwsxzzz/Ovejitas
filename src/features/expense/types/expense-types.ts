export const financialTransactionTypes = ["expense", "income"] as const;

export const financialSummaryGroupBy = [
	"day",
	"week",
	"month",
	"year",
] as const;

export const financialSummaryPeriods = ["7d", "30d", "3m", "1y"] as const;

export type FinancialTransactionType =
	(typeof financialTransactionTypes)[number];
export type FinancialSummaryGroupBy = (typeof financialSummaryGroupBy)[number];
export type FinancialSummaryPeriod = (typeof financialSummaryPeriods)[number];

export interface IExpense {
	id: string;
	farmId: string;
	date: string;
	amount: number;
	type: FinancialTransactionType;
	description: string | null;
	speciesId: string | null;
	feedLotId: string | null;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface IExpenseListFilters {
	type?: FinancialTransactionType;
	speciesId?: string;
	from?: string;
	to?: string;
	period?: FinancialSummaryPeriod;
	groupBy?: FinancialSummaryGroupBy;
}

export interface ICreateExpensePayload {
	date: string;
	amount: number;
	type: FinancialTransactionType;
	speciesId: string;
	description?: string;
}

export interface IUpdateExpensePayload {
	date?: string;
	amount?: number;
	type?: FinancialTransactionType;
	speciesId?: string;
	description?: string;
}

export interface IExpenseSummary {
	totals: {
		income: number;
		expenses: number;
		net: number;
	};
	breakdown: Array<{
		period: string;
		income: number;
		expenses: number;
		net: number;
	}>;
}
