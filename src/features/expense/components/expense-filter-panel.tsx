import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
import { Check } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ExpenseFilterPanelProps {
	filters: Partial<IExpenseListFilters>;
	onChange: (filters: Partial<IExpenseListFilters>) => void;
	onApply: () => void;
	onClear: () => void;
	variant: "toolbar" | "sidebar";
}

export const ExpenseFilterPanel = ({
	filters,
	onChange,
	onApply,
	onClear,
	variant,
}: ExpenseFilterPanelProps) => {
	const { t } = useTranslation("expenses");

	const categoryOptions = useMemo(
		() => [
			{ label: t("filters.allCategories"), value: "all" },
			...expenseCategories.map((category) => ({
				label: t(expenseCategoryLabelKeys[category] as never),
				value: category,
			})),
		],
		[t],
	);

	const statusOptions = useMemo(
		() => [
			{ label: t("filters.allStatuses"), value: "all" },
			...expenseStatuses.map((status) => ({
				label: t(expenseStatusLabelKeys[status] as never),
				value: status,
			})),
		],
		[t],
	);

	const paymentMethodOptions = useMemo(
		() => [
			{ label: t("filters.allPaymentMethods"), value: "all" },
			...paymentMethods.map((method) => ({
				label: t(paymentMethodLabelKeys[method] as never),
				value: method,
			})),
		],
		[t],
	);

	const activeFilterCount = Object.values(filters).filter(
		(value) => value !== undefined,
	).length;

	const setCategory = (value: string) => {
		onChange({
			...filters,
			category:
				value === "all"
					? undefined
					: (value as NonNullable<IExpenseListFilters["category"]>),
		});
	};

	const setStatus = (value: string) => {
		onChange({
			...filters,
			status:
				value === "all"
					? undefined
					: (value as NonNullable<IExpenseListFilters["status"]>),
		});
	};

	const toggleStatus = (value: string) => {
		onChange({
			...filters,
			status:
				filters.status === value
					? undefined
					: (value as NonNullable<IExpenseListFilters["status"]>),
		});
	};

	const togglePaymentMethod = (value: string) => {
		onChange({
			...filters,
			paymentMethod:
				filters.paymentMethod === value
					? undefined
					: (value as NonNullable<IExpenseListFilters["paymentMethod"]>),
		});
	};

	const setPaymentMethod = (value: string) => {
		onChange({
			...filters,
			paymentMethod:
				value === "all"
					? undefined
					: (value as NonNullable<IExpenseListFilters["paymentMethod"]>),
		});
	};

	if (variant === "toolbar") {
		return (
			<Card className="hidden md:flex lg:hidden border border-border/70 shadow-none py-4">
				<CardContent className="px-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3 xl:grid-cols-4">
						<div className="space-y-1">
							<p className="text-caption text-muted-foreground font-semibold uppercase tracking-wide">
								{t("filters.categoryLabel")}
							</p>
							<Select
								value={filters.category ?? "all"}
								onValueChange={setCategory}
							>
								<SelectTrigger className="h-10">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{categoryOptions.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1">
							<p className="text-caption text-muted-foreground font-semibold uppercase tracking-wide">
								{t("filters.statusLabel")}
							</p>
							<Select
								value={filters.status ?? "all"}
								onValueChange={setStatus}
							>
								<SelectTrigger className="h-10">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{statusOptions.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1">
							<p className="text-caption text-muted-foreground font-semibold uppercase tracking-wide">
								{t("filters.paymentMethodLabel")}
							</p>
							<Select
								value={filters.paymentMethod ?? "all"}
								onValueChange={setPaymentMethod}
							>
								<SelectTrigger className="h-10">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{paymentMethodOptions.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-end justify-end gap-2">
							<Button
								type="button"
								variant="ghost"
								onClick={onClear}
							>
								{t("filters.clear", "Clear")}
							</Button>
							<Button
								type="button"
								onClick={onApply}
							>
								{t("filters.apply", "Apply")}
							</Button>
						</div>
					</div>

					<p className="mt-2 text-sm text-muted-foreground">
						{activeFilterCount > 0
							? t("filters.count", {
									count: activeFilterCount,
									defaultValue: "{{count}} selected",
								})
							: t("filters.noSelection", "No filters selected")}
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="hidden lg:flex border border-border/70 shadow-none py-4 bg-card">
			<CardContent className="px-4 space-y-5">
				<div>
					<h3 className="text-2xl font-semibold tracking-tight">
						{t("filters.title", "Filters")}
					</h3>
					<p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
						{t("filters.refine", "Refine expenses")}
					</p>
				</div>

				<div className="space-y-2">
					<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
						{t("filters.categoryLabel")}
					</p>
					<Select
						value={filters.category ?? "all"}
						onValueChange={setCategory}
					>
						<SelectTrigger className="h-10 rounded-xl bg-muted/50 border-transparent px-3">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{categoryOptions.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
						{t("filters.statusLabel")}
					</p>
					<div className="grid grid-cols-2 gap-2">
						{statusOptions.slice(1).map((option) => {
							const isSelected = filters.status === option.value;

							return (
								<Button
									key={option.value}
									type="button"
									variant="outline"
									onClick={() => toggleStatus(option.value)}
									className={cn(
										"h-9 rounded-full justify-start px-3 text-xs",
										isSelected
											? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
											: "bg-muted/50 border-transparent text-foreground hover:bg-muted",
									)}
								>
									{isSelected && <Check className="h-3.5 w-3.5 mr-1.5" />}
									<span className="truncate">{option.label}</span>
								</Button>
							);
						})}
					</div>
				</div>

				<div className="space-y-2">
					<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
						{t("filters.paymentMethodLabel")}
					</p>
					<div className="grid grid-cols-2 gap-2">
						{paymentMethodOptions.slice(1).map((option) => {
							const isSelected = filters.paymentMethod === option.value;

							return (
								<Button
									key={option.value}
									type="button"
									variant="outline"
									onClick={() => togglePaymentMethod(option.value)}
									className={cn(
										"h-9 rounded-full justify-start px-3 text-xs",
										isSelected
											? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
											: "bg-muted/50 border-transparent text-foreground hover:bg-muted",
									)}
								>
									{isSelected && <Check className="h-3.5 w-3.5 mr-1.5" />}
									<span className="truncate">{option.label}</span>
								</Button>
							);
						})}
					</div>
				</div>

				<div className="pt-3 border-t">
					<Button
						type="button"
						onClick={onApply}
						className="w-full rounded-full"
					>
						{t("filters.apply", "Apply Filters")}
					</Button>
					<Button
						type="button"
						variant="ghost"
						onClick={onClear}
						className="w-full mt-1 uppercase tracking-[0.12em] text-[11px] text-muted-foreground"
					>
						{t("filters.clear", "Clear filters")}
					</Button>
					<p className="mt-2 text-xs text-muted-foreground text-center">
						{activeFilterCount > 0
							? t("filters.count", {
									count: activeFilterCount,
									defaultValue: "{{count}} selected",
								})
							: t("filters.noSelection", "No filters selected")}
					</p>
				</div>
			</CardContent>
		</Card>
	);
};
