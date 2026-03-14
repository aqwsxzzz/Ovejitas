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
	category: ExpenseCategory;
	description?: string;
	speciesId?: string;
	breedId?: string;
	animalId?: string;
	lotId?: string;
	vendor?: string;
	paymentMethod?: PaymentMethod;
	invoiceNumber?: string;
	quantity?: number;
	quantityUnit?: QuantityUnit;
	unitCost?: number;
	status: ExpenseStatus;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface IExpenseListFilters {
	category?: ExpenseCategory;
	paymentMethod?: PaymentMethod;
	status?: ExpenseStatus;
}

export interface ICreateExpensePayload {
	date: string;
	amount: number;
	category: ExpenseCategory;
	description?: string;
	speciesId?: string;
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
	category?: ExpenseCategory;
	description?: string;
	speciesId?: string;
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
