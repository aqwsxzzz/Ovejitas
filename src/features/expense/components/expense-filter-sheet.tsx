import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
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

interface ExpenseFilterSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	filters: Partial<IExpenseListFilters>;
	onChange: (filters: Partial<IExpenseListFilters>) => void;
	onApply: () => void;
}

export const ExpenseFilterSheet = ({
	open,
	onOpenChange,
	filters,
	onChange,
	onApply,
}: ExpenseFilterSheetProps) => {
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
			...expenseStatuses.map((status) => ({
				label: t(expenseStatusLabelKeys[status] as never),
				value: status,
			})),
		],
		[t],
	);

	const paymentMethodOptions = useMemo(
		() => [
			...paymentMethods.map((method) => ({
				label: t(paymentMethodLabelKeys[method] as never),
				value: method,
			})),
		],
		[t],
	);

	const handleCategoryChange = (value: string) => {
		onChange({
			...filters,
			category:
				value === "all"
					? undefined
					: (value as NonNullable<IExpenseListFilters["category"]>),
		});
	};

	const handleStatusChange = (value: string) => {
		onChange({
			...filters,
			status:
				filters.status === value
					? undefined
					: (value as NonNullable<IExpenseListFilters["status"]>),
		});
	};

	const handlePaymentMethodChange = (value: string) => {
		onChange({
			...filters,
			paymentMethod:
				filters.paymentMethod === value
					? undefined
					: (value as NonNullable<IExpenseListFilters["paymentMethod"]>),
		});
	};

	const handleClearFilters = () => {
		onChange({});
	};

	const activeFilterCount = Object.values(filters).filter(
		(v) => v !== undefined,
	).length;

	const activeFiltersLabel =
		activeFilterCount === 1
			? t("filters.activeSingle", "active filter")
			: t("filters.activePlural", "active filters");

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
		>
			<SheetContent
				side="bottom"
				className="rounded-t-3xl max-h-[86vh] flex flex-col p-5"
			>
				<SheetHeader className="pb-2">
					<SheetTitle className="text-3xl font-semibold tracking-tight">
						{t("filters.title", "Filters")}
					</SheetTitle>
					{activeFilterCount > 0 && (
						<SheetDescription className="text-sm">
							{`${activeFilterCount} ${activeFiltersLabel}`}
						</SheetDescription>
					)}
				</SheetHeader>

				<div className="flex-1 overflow-y-auto space-y-6 py-2">
					{/* Category Filter */}
					<div className="space-y-2">
						<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							{t("filters.categoryLabel")}
						</label>
						<Select
							value={filters.category ?? "all"}
							onValueChange={handleCategoryChange}
						>
							<SelectTrigger className="h-12 rounded-2xl bg-muted/60 border-transparent px-4 text-base">
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

					{/* Status Filter */}
					<div className="space-y-2">
						<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							{t("filters.statusLabel")}
						</label>
						<div className="grid grid-cols-2 gap-2">
							{statusOptions.map((option) => {
								const isSelected = filters.status === option.value;

								return (
									<Button
										key={option.value}
										type="button"
										variant="outline"
										onClick={() => handleStatusChange(option.value)}
										className={cn(
											"h-11 rounded-full justify-start px-4 text-sm",
											isSelected
												? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
												: "bg-muted/60 border-transparent text-foreground hover:bg-muted",
										)}
									>
										{isSelected && <Check className="h-4 w-4 mr-2" />}
										<span className="truncate">{option.label}</span>
									</Button>
								);
							})}
						</div>
					</div>

					{/* Payment Method Filter */}
					<div className="space-y-2">
						<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							{t("filters.paymentMethodLabel")}
						</label>
						<div className="grid grid-cols-2 gap-2">
							{paymentMethodOptions.map((option) => {
								const isSelected = filters.paymentMethod === option.value;

								return (
									<Button
										key={option.value}
										type="button"
										variant="outline"
										onClick={() => handlePaymentMethodChange(option.value)}
										className={cn(
											"h-11 rounded-full justify-start px-4 text-sm",
											isSelected
												? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
												: "bg-muted/60 border-transparent text-foreground hover:bg-muted",
										)}
									>
										{isSelected && <Check className="h-4 w-4 mr-2" />}
										<span className="truncate">{option.label}</span>
									</Button>
								);
							})}
						</div>
					</div>
				</div>

				<SheetFooter className="border-t pt-4 mt-3">
					<Button
						type="button"
						size="lg"
						onClick={onApply}
						className="w-full rounded-full"
					>
						{t("filters.apply", "Apply Filters")}
					</Button>
					<Button
						type="button"
						variant="ghost"
						onClick={handleClearFilters}
						className="w-full uppercase tracking-[0.16em] text-xs font-semibold text-muted-foreground"
					>
						{t("filters.clear", "Clear all")}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
};
