import { DateSelector } from "@/components/common/DateSelector";
import { Button } from "@/components/ui/button";
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
import { financialTransactionTypeLabelKeys } from "@/features/expense/components/expense-labels";
import { toYyyyMmDd } from "@/features/expense/components/expense-form-schema";
import {
	financialTransactionTypes,
	type IExpenseListFilters,
} from "@/features/expense/types/expense-types";
import type { ISpecie } from "@/features/specie/types/specie-types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ExpenseFilterSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	filters: Partial<IExpenseListFilters>;
	onChange: (filters: Partial<IExpenseListFilters>) => void;
	onApply: () => void;
	speciesData: ISpecie[];
}

const toDateValue = (value?: string) =>
	value ? new Date(`${value}T00:00:00`) : undefined;

export const ExpenseFilterSheet = ({
	open,
	onOpenChange,
	filters,
	onChange,
	onApply,
	speciesData,
}: ExpenseFilterSheetProps) => {
	const { t } = useTranslation("expenses");

	const typeOptions = useMemo(
		() => [
			{ label: t("filters.allTypes"), value: "all" },
			...financialTransactionTypes.map((type) => ({
				label: t(financialTransactionTypeLabelKeys[type] as never),
				value: type,
			})),
		],
		[t],
	);

	const speciesOptions = useMemo(
		() => [
			{ label: t("filters.allSpecies"), value: "all" },
			...speciesData
				.filter((specie) => specie.translations?.[0]?.name)
				.map((specie) => ({
					label: specie.translations?.[0]?.name ?? specie.id,
					value: specie.id,
				})),
		],
		[speciesData, t],
	);

	const activeFilterCount = Object.values(filters).filter(
		(value) => value !== undefined && value !== "",
	).length;

	const setType = (value: string) => {
		onChange({
			...filters,
			type:
				value === "all"
					? undefined
					: (value as NonNullable<IExpenseListFilters["type"]>),
		});
	};

	const setSpeciesId = (value: string) => {
		onChange({
			...filters,
			speciesId: value === "all" ? undefined : value,
		});
	};

	const setDate = (key: "from" | "to", date?: Date) => {
		onChange({
			...filters,
			[key]: date ? toYyyyMmDd(date) : undefined,
		});
	};

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
						{t("filters.title")}
					</SheetTitle>
					{activeFilterCount > 0 && (
						<SheetDescription className="text-sm">
							{t("filters.count", { count: activeFilterCount })}
						</SheetDescription>
					)}
				</SheetHeader>

				<div className="flex-1 overflow-y-auto space-y-6 py-2">
					<div className="space-y-2">
						<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							{t("filters.typeLabel")}
						</label>
						<Select
							value={filters.type ?? "all"}
							onValueChange={setType}
						>
							<SelectTrigger className="h-12 rounded-2xl bg-muted/60 border-transparent px-4 text-base">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{typeOptions.map((option) => (
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
						<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							{t("filters.speciesLabel")}
						</label>
						<Select
							value={filters.speciesId ?? "all"}
							onValueChange={setSpeciesId}
						>
							<SelectTrigger className="h-12 rounded-2xl bg-muted/60 border-transparent px-4 text-base">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{speciesOptions.map((option) => (
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
						<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							{t("filters.fromLabel")}
						</label>
						<DateSelector
							date={toDateValue(filters.from)}
							setDate={(date) => setDate("from", date)}
						/>
						{filters.from && (
							<Button
								type="button"
								variant="ghost"
								onClick={() => setDate("from", undefined)}
							>
								{t("filters.clearDate")}
							</Button>
						)}
					</div>

					<div className="space-y-2">
						<label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							{t("filters.toLabel")}
						</label>
						<DateSelector
							date={toDateValue(filters.to)}
							setDate={(date) => setDate("to", date)}
						/>
						{filters.to && (
							<Button
								type="button"
								variant="ghost"
								onClick={() => setDate("to", undefined)}
							>
								{t("filters.clearDate")}
							</Button>
						)}
					</div>
				</div>

				<SheetFooter className="pt-4 border-t border-border">
					<div className="flex gap-2 w-full">
						<Button
							type="button"
							variant="outline"
							onClick={() => onChange({})}
							className="flex-1"
						>
							{t("filters.clear")}
						</Button>
						<Button
							onClick={() => {
								onApply();
								onOpenChange(false);
							}}
							className="flex-1"
						>
							{t("filters.apply")}
						</Button>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
};
