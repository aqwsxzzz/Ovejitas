export const financialTransactionTypes = ["expense", "income"] as const;

export const financialSummaryGroupBy = [
	"day",
	"week",
	"month",
	"year",
] as const;

export const financialSummaryPeriods = ["7d", "30d", "3m", "1y"] as const;

export const expenseCategories = [
	"feed",
	"veterinary",
	"transport",
	"equipment",
	"labor",
	"utilities",
	"maintenance",
	"other",
] as const;

export const paymentMethods = [
	"cash",
	"bank_transfer",
	"credit_card",
	"debit_card",
	"check",
	"other",
] as const;

export const expenseStatuses = ["pending", "paid", "reimbursed"] as const;

export const quantityUnits = [
	"kg",
	"liters",
	"units",
	"boxes",
	"bags",
	"doses",
	"hours",
	"other",
] as const;

const legacyQuantityUnitMap = {
	liter: "liters",
	unit: "units",
	box: "boxes",
	bag: "bags",
	dose: "doses",
	hour: "hours",
} as const;

export type ExpenseCategory = (typeof expenseCategories)[number];
export type PaymentMethod = (typeof paymentMethods)[number];
export type ExpenseStatus = (typeof expenseStatuses)[number];
export type QuantityUnit = (typeof quantityUnits)[number];
export type FinancialTransactionType =
	(typeof financialTransactionTypes)[number];
export type FinancialSummaryGroupBy = (typeof financialSummaryGroupBy)[number];
export type FinancialSummaryPeriod = (typeof financialSummaryPeriods)[number];

export const normalizeQuantityUnit = (
	quantityUnit?: string,
): QuantityUnit | undefined => {
	if (!quantityUnit) {
		return undefined;
	}

	if (quantityUnits.includes(quantityUnit as QuantityUnit)) {
		return quantityUnit as QuantityUnit;
	}

	const mappedUnit =
		legacyQuantityUnitMap[quantityUnit as keyof typeof legacyQuantityUnitMap];

	return mappedUnit;
};

export interface IExpense {
	id: string;
	farmId: string;
	date: string;
	amount: number;
	type: FinancialTransactionType;
	description?: string;
	speciesId?: string;
	category?: ExpenseCategory;
	breedId?: string;
	animalId?: string;
	lotId?: string;
	vendor?: string;
	paymentMethod?: PaymentMethod;
	invoiceNumber?: string;
	quantity?: number;
	quantityUnit?: QuantityUnit;
	unitCost?: number;
	status?: ExpenseStatus;
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
	category?: ExpenseCategory;
	paymentMethod?: PaymentMethod;
	status?: ExpenseStatus;
}

export interface ICreateExpensePayload {
	date: string;
	amount: number;
	type: FinancialTransactionType;
	speciesId: string;
	description?: string;
	category?: ExpenseCategory;
	breedId?: string;
	animalId?: string;
	lotId?: string;
	vendor?: string;
	paymentMethod?: PaymentMethod;
	invoiceNumber?: string;
	quantity?: number;
	quantityUnit?: QuantityUnit;
	unitCost?: number;
	status?: ExpenseStatus;
}

export interface IUpdateExpensePayload {
	date?: string;
	amount?: number;
	type?: FinancialTransactionType;
	speciesId?: string;
	description?: string;
	category?: ExpenseCategory;
	breedId?: string;
	animalId?: string;
	lotId?: string;
	vendor?: string;
	paymentMethod?: PaymentMethod;
	invoiceNumber?: string;
	quantity?: number;
	quantityUnit?: QuantityUnit;
	unitCost?: number;
	status?: ExpenseStatus;
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
