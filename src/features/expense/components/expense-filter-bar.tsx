import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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

	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
			<Select
				value={filters.category ?? "all"}
				onValueChange={(value) =>
					onChange({
						...filters,
						category:
							value === "all"
								? undefined
								: (value as NonNullable<IExpenseListFilters["category"]>),
					})
				}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={t("filters.categoryPlaceholder")} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">{t("filters.allCategories")}</SelectItem>
					{expenseCategories.map((category) => (
						<SelectItem
							key={category}
							value={category}
						>
							{t(expenseCategoryLabelKeys[category] as never)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={filters.status ?? "all"}
				onValueChange={(value) =>
					onChange({
						...filters,
						status:
							value === "all"
								? undefined
								: (value as NonNullable<IExpenseListFilters["status"]>),
					})
				}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={t("filters.statusPlaceholder")} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
					{expenseStatuses.map((status) => (
						<SelectItem
							key={status}
							value={status}
						>
							{t(expenseStatusLabelKeys[status] as never)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={filters.paymentMethod ?? "all"}
				onValueChange={(value) =>
					onChange({
						...filters,
						paymentMethod:
							value === "all"
								? undefined
								: (value as NonNullable<IExpenseListFilters["paymentMethod"]>),
					})
				}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={t("filters.paymentMethodPlaceholder")} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">{t("filters.allPaymentMethods")}</SelectItem>
					{paymentMethods.map((method) => (
						<SelectItem
							key={method}
							value={method}
						>
							{t(paymentMethodLabelKeys[method] as never)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Button
				variant="outline"
				onClick={() => onChange({})}
			>
				{t("filters.clear")}
			</Button>
		</div>
	);
};
