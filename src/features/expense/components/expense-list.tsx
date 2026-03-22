import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteExpenseDialog } from "@/features/expense/components/delete-expense-dialog";
import { ExpenseFormModal } from "@/features/expense/components/expense-form-modal";
import { financialTransactionTypeLabelKeys } from "@/features/expense/components/expense-labels";
import type {
	IExpense,
	IExpenseListFilters,
} from "@/features/expense/types/expense-types";
import type { ISpecie } from "@/features/specie/types/specie-types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ExpenseListProps {
	expenses: IExpense[];
	farmId: string;
	filters: Partial<IExpenseListFilters>;
	currencyCode: string;
	speciesData: ISpecie[];
}

const parseDecimal = (value: unknown): number => {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string") {
		const parsedValue = Number(value.replace(/,/g, "").trim());
		if (Number.isFinite(parsedValue)) {
			return parsedValue;
		}
	}

	return 0;
};

export const ExpenseList = ({
	expenses,
	farmId,
	filters,
	currencyCode,
	speciesData,
}: ExpenseListProps) => {
	const { t, i18n } = useTranslation("expenses");

	const currencyFormatter = useMemo(
		() =>
			new Intl.NumberFormat(i18n.language, {
				style: "currency",
				currency: currencyCode,
				maximumFractionDigits: 2,
			}),
		[i18n.language, currencyCode],
	);

	const dateFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat(i18n.language, {
				dateStyle: "medium",
			}),
		[i18n.language],
	);

	const speciesNameById = useMemo(
		() =>
			new Map(
				speciesData.map((specie) => [
					specie.id,
					specie.translations?.[0]?.name ?? specie.id,
				]),
			),
		[speciesData],
	);

	return (
		<div className="flex flex-col gap-3">
			{expenses.map((expense) => {
				const displayAmount = parseDecimal(expense.amount);
				const speciesName = expense.speciesId
					? speciesNameById.get(expense.speciesId)
					: undefined;
				const amountClassName =
					expense.type === "income" ? "text-emerald-600" : "text-rose-600";

				return (
					<Card
						key={expense.id}
						className="py-4"
					>
						<CardContent className="px-4 md:px-6 flex flex-col gap-3">
							<div className="flex items-start justify-between gap-3">
								<div className="flex flex-col gap-2">
									<div className="flex items-center gap-2 flex-wrap">
										<Badge variant="outline">
											{t(
												financialTransactionTypeLabelKeys[
													expense.type
												] as never,
											)}
										</Badge>
										{speciesName && (
											<Badge variant="secondary">{speciesName}</Badge>
										)}
									</div>
									<p className="text-sm text-muted-foreground">
										{dateFormatter.format(new Date(`${expense.date}T00:00:00`))}
									</p>
									<p className="text-base text-muted-foreground">
										{expense.description || t("list.noDescription")}
									</p>
									<p className={`text-lg font-semibold ${amountClassName}`}>
										{currencyFormatter.format(displayAmount)}
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
									<p className="text-muted-foreground">{t("list.type")}</p>
									<p>
										{t(
											financialTransactionTypeLabelKeys[expense.type] as never,
										)}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">{t("list.species")}</p>
									<p>{speciesName || t("list.notProvided")}</p>
								</div>
								<div>
									<p className="text-muted-foreground">{t("list.createdAt")}</p>
									<p>{dateFormatter.format(new Date(expense.createdAt))}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
};
