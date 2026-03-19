import { PageHeader } from "@/components/common/page-header";
import { ScrollablePageLayout } from "@/components/layout/scrollable-page-layout";
import { Button } from "@/components/ui/button";
import { useGetExpensesPage } from "@/features/expense/api/expense-queries";
import { ExpenseFilterBar } from "@/features/expense/components/expense-filter-bar";
import { ExpenseFormModal } from "@/features/expense/components/expense-form-modal";
import { ExpenseList } from "@/features/expense/components/expense-list";
import { ExpenseListSkeleton } from "@/features/expense/components/expense-list-skeleton";
import { ExpenseSummaryStrip } from "@/features/expense/components/expense-summary-strip";
import type { IExpenseListFilters } from "@/features/expense/types/expense-types";
import { useGetFarmById } from "@/features/farm/api/farm-queries";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
	"/_private/_privatelayout/farm/$farmId/expenses",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const pageSizeOptions = [5, 10, 20, 50];
	const scrollToTop = () => {
		const scrollContainer = document.getElementById("app-scroll-container");
		if (scrollContainer) {
			scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}

		window.scrollTo({ top: 0, behavior: "smooth" });
	};
	const { t } = useTranslation("expenses");
	const { farmId } = useParams({ strict: false });
	const { data: farmData } = useGetFarmById(farmId!);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [filters, setFilters] = useState<Partial<IExpenseListFilters>>({});
	const {
		data: pagedExpenses,
		isPending,
		isError,
		error,
		refetch,
		isFetching,
	} = useGetExpensesPage({
		farmId: farmId!,
		filters,
		page,
		limit: pageSize,
	});
	const expenses = pagedExpenses?.items ?? [];
	const totalExpenses = pagedExpenses?.total ?? expenses.length;
	const totalPages = pagedExpenses?.totalPages ?? 1;
	const currencyCode = farmData?.currencyCode ?? "USD";

	return (
		<ScrollablePageLayout
			className="max-w-5xl mx-auto pb-24"
			header={
				<div className="flex flex-col gap-4">
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
						onChange={(nextFilters) => {
							setFilters(nextFilters);
							setPage(1);
							scrollToTop();
						}}
					/>
				</div>
			}
		>
			<div className="flex flex-col gap-4">
				{!isPending && !isError && (
					<ExpenseSummaryStrip
						expenses={expenses}
						currencyCode={currencyCode}
					/>
				)}

				{isPending && <ExpenseListSkeleton />}

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
					<div className="space-y-3">
						<ExpenseList
							expenses={expenses}
							farmId={farmId!}
							filters={filters}
							currencyCode={currencyCode}
						/>
						<div className="flex flex-wrap items-center gap-2">
							<label className="text-caption text-muted-foreground">
								{t("page.perPage")}
							</label>
							<select
								className="h-9 rounded-md border border-input bg-background px-2 text-sm"
								value={pageSize}
								onChange={(event) => {
									setPageSize(Number(event.target.value));
									setPage(1);
									scrollToTop();
								}}
							>
								{pageSizeOptions.map((option) => (
									<option
										key={option}
										value={option}
									>
										{option}
									</option>
								))}
							</select>
							<Button
								variant="outline"
								onClick={() => {
									setPage((previous) => Math.max(previous - 1, 1));
									scrollToTop();
								}}
								disabled={page <= 1 || isFetching}
							>
								{t("page.previous")}
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									setPage((previous) => Math.min(previous + 1, totalPages));
									scrollToTop();
								}}
								disabled={page >= totalPages || isFetching}
							>
								{t("page.next")}
							</Button>
							<span className="text-caption text-muted-foreground">
								{t("page.pageLabel", { page, totalPages })}
							</span>
						</div>
						<p className="text-caption text-muted-foreground">
							{t("page.showingCount", {
								visible: expenses.length,
								total: totalExpenses,
							})}
						</p>
					</div>
				)}
			</div>
		</ScrollablePageLayout>
	);
}
