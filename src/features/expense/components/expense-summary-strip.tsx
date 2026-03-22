import { Card, CardContent } from "@/components/ui/card";
import type { IExpenseSummary } from "@/features/expense/types/expense-types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ExpenseSummaryStripProps {
	summary?: IExpenseSummary;
	currencyCode: string;
}

export const ExpenseSummaryStrip = ({
	summary,
	currencyCode,
}: ExpenseSummaryStripProps) => {
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

	const totals = summary?.totals ?? {
		income: 0,
		expenses: 0,
		net: 0,
	};

	const netClassName = totals.net >= 0 ? "text-emerald-600" : "text-rose-600";

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
			<Card className="py-3">
				<CardContent className="px-4 flex flex-col gap-1">
					<p className="text-xs text-muted-foreground">{t("summary.income")}</p>
					<p className="text-lg font-semibold">
						{currencyFormatter.format(totals.income)}
					</p>
				</CardContent>
			</Card>
			<Card className="py-3">
				<CardContent className="px-4 flex flex-col gap-1">
					<p className="text-xs text-muted-foreground">
						{t("summary.expenses")}
					</p>
					<p className="text-lg font-semibold">
						{currencyFormatter.format(totals.expenses)}
					</p>
				</CardContent>
			</Card>
			<Card className="py-3">
				<CardContent className="px-4 flex flex-col gap-1">
					<p className="text-xs text-muted-foreground">{t("summary.net")}</p>
					<p className={`text-lg font-semibold ${netClassName}`}>
						{currencyFormatter.format(totals.net)}
					</p>
				</CardContent>
			</Card>
		</div>
	);
};
