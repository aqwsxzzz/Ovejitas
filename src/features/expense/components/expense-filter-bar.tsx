import { Button } from "@/components/ui/button";
import {
	FilterChips,
	type FilterOption,
} from "@/components/common/filter-chips";
import {
	expenseCategories,
	expenseStatuses,
	paymentMethods,
	type IExpenseListFilters,
} from "@/features/expense/types/expense-types";
import {
	expenseCategoryLabelKeys,
	expenseStatusLabelKeys,
	paymentMethodLabelKeys,
} from "./expense-labels";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ExpenseFilterBarProps {
	filters: Partial<IExpenseListFilters>;
	onChange: (filters: Partial<IExpenseListFilters>) => void;
}

export const ExpenseFilterBar = ({
	filters,
	onChange,
}: ExpenseFilterBarProps) => {
	const { t } = useTranslation("expenses");

	const categoryOptions = useMemo<FilterOption[]>(
		() => [
			{ label: t("filters.allCategories"), value: "all" },
			...expenseCategories.map((category) => ({
				label: t(expenseCategoryLabelKeys[category] as never),
				value: category,
			})),
		],
		[t],
	);

	const statusOptions = useMemo<FilterOption[]>(
		() => [
			{ label: t("filters.allStatuses"), value: "all" },
			...expenseStatuses.map((status) => ({
				label: t(expenseStatusLabelKeys[status] as never),
				value: status,
			})),
		],
		[t],
	);

	const paymentMethodOptions = useMemo<FilterOption[]>(
		() => [
			{ label: t("filters.allPaymentMethods"), value: "all" },
			...paymentMethods.map((method) => ({
				label: t(paymentMethodLabelKeys[method] as never),
				value: method,
			})),
		],
		[t],
	);

	return (
		<div className="rounded-card border p-3 flex flex-col gap-3">
			<div className="space-y-1">
				<p className="text-caption text-muted-foreground font-semibold uppercase tracking-wide">
					{t("filters.categoryLabel")}
				</p>
				<FilterChips
					options={categoryOptions}
					selected={filters.category ?? "all"}
					onSelect={(value) =>
						onChange({
							...filters,
							category:
								value === "all"
									? undefined
									: (value as NonNullable<IExpenseListFilters["category"]>),
						})
					}
				/>
			</div>

			<div className="space-y-1">
				<p className="text-caption text-muted-foreground font-semibold uppercase tracking-wide">
					{t("filters.statusLabel")}
				</p>
				<FilterChips
					options={statusOptions}
					selected={filters.status ?? "all"}
					onSelect={(value) =>
						onChange({
							...filters,
							status:
								value === "all"
									? undefined
									: (value as NonNullable<IExpenseListFilters["status"]>),
						})
					}
				/>
			</div>

			<div className="space-y-1">
				<p className="text-caption text-muted-foreground font-semibold uppercase tracking-wide">
					{t("filters.paymentMethodLabel")}
				</p>
				<FilterChips
					options={paymentMethodOptions}
					selected={filters.paymentMethod ?? "all"}
					onSelect={(value) =>
						onChange({
							...filters,
							paymentMethod:
								value === "all"
									? undefined
									: (value as NonNullable<
											IExpenseListFilters["paymentMethod"]
										>),
						})
					}
				/>
			</div>

			<div>
				<Button
					variant="outline"
					onClick={() => onChange({})}
				>
					{t("filters.clear")}
				</Button>
			</div>
		</div>
	);
};
