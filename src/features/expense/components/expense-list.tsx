import { Card, CardContent } from "@/components/ui/card";
import type {
	IExpense,
	IExpenseListFilters,
} from "@/features/expense/types/expense-types";
import {
	expenseCategoryLabelKeys,
	paymentMethodLabelKeys,
} from "./expense-labels";
import {
	ExpenseCategoryBadge,
	ExpenseStatusBadge,
} from "@/features/expense/components/expense-badges";
import { ExpenseFormModal } from "@/features/expense/components/expense-form-modal";
import { DeleteExpenseDialog } from "@/features/expense/components/delete-expense-dialog";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ExpenseListProps {
	expenses: IExpense[];
	farmId: string;
	filters: Partial<IExpenseListFilters>;
}

const parseDecimal = (value: unknown): number | undefined => {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string") {
		const normalizedValue = value.replace(/,/g, "").trim();
		if (!normalizedValue) {
			return undefined;
		}

		const parsedValue = Number(normalizedValue);
		if (Number.isFinite(parsedValue)) {
			return parsedValue;
		}
	}

	return undefined;
};

const resolveExpenseAmount = (expense: IExpense): number => {
	const amount = parseDecimal(expense.amount as unknown);
	if (amount !== undefined) {
		return amount;
	}

	const quantity = parseDecimal(expense.quantity as unknown);
	const unitCost = parseDecimal(expense.unitCost as unknown);
	if (quantity !== undefined && unitCost !== undefined) {
		return quantity * unitCost;
	}

	return 0;
};

export const ExpenseList = ({
	expenses,
	farmId,
	filters,
}: ExpenseListProps) => {
	const { t, i18n } = useTranslation("expenses");

	const currencyFormatter = useMemo(
		() =>
			new Intl.NumberFormat(i18n.language, {
				style: "currency",
				currency: "USD",
				maximumFractionDigits: 2,
			}),
		[i18n.language],
	);

	const dateFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat(i18n.language, {
				dateStyle: "medium",
			}),
		[i18n.language],
	);

	return (
		<div className="flex flex-col gap-3">
			{expenses.map((expense) => {
				const displayAmount = resolveExpenseAmount(expense);

				return (
					<Card
						key={expense.id}
						className="py-4"
					>
						<CardContent className="px-4 md:px-6 flex flex-col gap-3">
							<div className="flex items-start justify-between gap-3">
								<div className="flex flex-col gap-2">
									<div className="flex items-center gap-2 flex-wrap">
										<ExpenseCategoryBadge category={expense.category} />
										<ExpenseStatusBadge status={expense.status} />
									</div>
									<p className="text-sm text-muted-foreground">
										{dateFormatter.format(new Date(`${expense.date}T00:00:00`))}
									</p>
									<p className="text-lg font-semibold">
										{currencyFormatter.format(expense.amount)}
									</p>
								</div>
								<div className="flex gap-2">
									<ExpenseFormModal
										farmId={farmId}
										filters={filters}
										expense={expense}
									/>
									<DeleteExpenseDialog
										expense={expense}
										farmId={farmId}
										filters={filters}
									/>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
								<div>
									<p className="text-muted-foreground">{t("list.vendor")}</p>
									{currencyFormatter.format(displayAmount)}
								</div>
								<div>
									<p className="text-muted-foreground">
										{t("list.paymentMethod")}
									</p>
									<p>
										{expense.paymentMethod
											? t(
													paymentMethodLabelKeys[
														expense.paymentMethod
													] as never,
												)
											: t("list.notProvided")}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">{t("list.category")}</p>
									<p>
										{t(expenseCategoryLabelKeys[expense.category] as never)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
};
