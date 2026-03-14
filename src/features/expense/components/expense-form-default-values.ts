import {
	normalizeQuantityUnit,
	type IExpense,
} from "@/features/expense/types/expense-types";
import {
	formatDecimal,
	type ExpenseFormValues,
	toDateValue,
} from "@/features/expense/components/expense-form-schema";

export const getExpenseFormDefaultValues = (
	expense?: IExpense,
): ExpenseFormValues => ({
	date: expense ? toDateValue(expense.date) : new Date(),
	amount: formatDecimal(expense?.amount),
	category: expense?.category ?? "feed",
	description: expense?.description ?? "",
	vendor: expense?.vendor ?? "",
	invoiceNumber: expense?.invoiceNumber ?? "",
	paymentMethod: expense?.paymentMethod,
	status: expense?.status ?? "paid",
	quantity: formatDecimal(expense?.quantity),
	quantityUnit: normalizeQuantityUnit(expense?.quantityUnit),
	unitCost: formatDecimal(expense?.unitCost),
	speciesId: expense?.speciesId,
	breedId: expense?.breedId,
	animalId: expense?.animalId,
	lotId: expense?.lotId ?? "",
});
