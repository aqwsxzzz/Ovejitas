import type { IExpense } from "@/features/expense/types/expense-types";
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
	type: expense?.type ?? "expense",
	description: expense?.description ?? "",
	speciesId: expense?.speciesId ?? "",
});
