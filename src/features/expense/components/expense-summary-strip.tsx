import { Card, CardContent } from "@/components/ui/card";
import type { IExpense } from "@/features/expense/types/expense-types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ExpenseSummaryStripProps {
	expenses: IExpense[];
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

export const ExpenseSummaryStrip = ({ expenses }: ExpenseSummaryStripProps) => {
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

	const summary = useMemo(() => {
		const totalAmount = expenses.reduce(
			(acc, item) => acc + resolveExpenseAmount(item),
			0,
		);
		const pendingAmount = expenses
			.filter((item) => item.status === "pending")
			.reduce((acc, item) => acc + resolveExpenseAmount(item), 0);

		return {
			totalAmount,
			pendingAmount,
			recordCount: expenses.length,
		};
	}, [expenses]);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
			<Card className="py-3">
				<CardContent className="px-4 flex flex-col gap-1">
					<p className="text-xs text-muted-foreground">{t("summary.total")}</p>
					<p className="text-lg font-semibold">
						{currencyFormatter.format(summary.totalAmount)}
					</p>
				</CardContent>
			</Card>
			<Card className="py-3">
				<CardContent className="px-4 flex flex-col gap-1">
					<p className="text-xs text-muted-foreground">
						{t("summary.pending")}
					</p>
					<p className="text-lg font-semibold">
						{currencyFormatter.format(summary.pendingAmount)}
					</p>
				</CardContent>
			</Card>
			<Card className="py-3">
				<CardContent className="px-4 flex flex-col gap-1">
					<p className="text-xs text-muted-foreground">
						{t("summary.records")}
					</p>
					<p className="text-lg font-semibold">{summary.recordCount}</p>
				</CardContent>
			</Card>
		</div>
	);
};
