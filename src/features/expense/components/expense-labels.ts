import type {
	ExpenseCategory,
	ExpenseStatus,
	PaymentMethod,
	QuantityUnit,
} from "@/features/expense/types/expense-types";

export const expenseCategoryLabelKeys: Record<ExpenseCategory, string> = {
	feed: "enums.category.feed",
	veterinary: "enums.category.veterinary",
	transport: "enums.category.transport",
	equipment: "enums.category.equipment",
	labor: "enums.category.labor",
	utilities: "enums.category.utilities",
	maintenance: "enums.category.maintenance",
	other: "enums.category.other",
};

export const paymentMethodLabelKeys: Record<PaymentMethod, string> = {
	cash: "enums.paymentMethod.cash",
	bank_transfer: "enums.paymentMethod.bank_transfer",
	credit_card: "enums.paymentMethod.credit_card",
	debit_card: "enums.paymentMethod.debit_card",
	check: "enums.paymentMethod.check",
	other: "enums.paymentMethod.other",
};

export const expenseStatusLabelKeys: Record<ExpenseStatus, string> = {
	pending: "enums.status.pending",
	paid: "enums.status.paid",
	reimbursed: "enums.status.reimbursed",
};

export const quantityUnitLabelKeys: Record<QuantityUnit, string> = {
	kg: "enums.quantityUnit.kg",
	liters: "enums.quantityUnit.liters",
	units: "enums.quantityUnit.units",
	boxes: "enums.quantityUnit.boxes",
	bags: "enums.quantityUnit.bags",
	doses: "enums.quantityUnit.doses",
	hours: "enums.quantityUnit.hours",
	other: "enums.quantityUnit.other",
};
