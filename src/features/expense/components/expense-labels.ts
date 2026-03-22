import type { FinancialTransactionType } from "@/features/expense/types/expense-types";

export const financialTransactionTypeLabelKeys: Record<
	FinancialTransactionType,
	string
> = {
	expense: "enums.transactionType.expense",
	income: "enums.transactionType.income",
};
