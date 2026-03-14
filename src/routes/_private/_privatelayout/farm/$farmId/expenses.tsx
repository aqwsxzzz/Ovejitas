import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { useGetExpenses } from "@/features/expense/api/expense-queries";
import { ExpenseFilterBar } from "@/features/expense/components/expense-filter-bar";
import { ExpenseFormModal } from "@/features/expense/components/expense-form-modal";
import { ExpenseList } from "@/features/expense/components/expense-list";
import { ExpenseSummaryStrip } from "@/features/expense/components/expense-summary-strip";
import type { IExpenseListFilters } from "@/features/expense/types/expense-types";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/expenses",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation("expenses");
	const { farmId } = useParams({ strict: false });
	const [filters, setFilters] = useState<Partial<IExpenseListFilters>>({});
	const {
		data: expenses = [],
		isPending,
		isError,
		error,
		refetch,
	} = useGetExpenses({ farmId: farmId!, filters });

	return (
		<div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto pb-24">
			<PageHeader
				title={t("page.title")}
				description={t("page.description")}
				action={
					<ExpenseFormModal
						farmId={farmId!}
						filters={filters}
					/>
				}
			/>

			<ExpenseFilterBar
				filters={filters}
				onChange={setFilters}
			/>

			{!isPending && !isError && <ExpenseSummaryStrip expenses={expenses} />}

			{isPending && (
				<div className="text-muted-foreground py-8">{t("page.loading")}</div>
			)}

			{isError && (
				<div className="rounded-card border p-4 flex flex-col gap-2">
					<p className="text-destructive text-sm">{error.message}</p>
					<div>
						<Button
							variant="outline"
							onClick={() => void refetch()}
						>
							{t("page.retry")}
						</Button>
					</div>
				</div>
			)}

			{!isPending && !isError && expenses.length === 0 && (
				<div className="rounded-card border p-8 text-center text-muted-foreground">
					{t("page.empty")}
				</div>
			)}

			{!isPending && !isError && expenses.length > 0 && (
				<ExpenseList
					expenses={expenses}
					farmId={farmId!}
					filters={filters}
				/>
			)}
		</div>
	);
}
