import { DateSelector } from "@/components/common/DateSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { financialTransactionTypeLabelKeys } from "@/features/expense/components/expense-labels";
import { toYyyyMmDd } from "@/features/expense/components/expense-form-schema";
import {
	financialSummaryGroupBy,
	financialSummaryPeriods,
	financialTransactionTypes,
	type IExpenseListFilters,
} from "@/features/expense/types/expense-types";
import type { ISpecie } from "@/features/specie/types/specie-types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ExpenseFilterPanelProps {
	filters: Partial<IExpenseListFilters>;
	onChange: (filters: Partial<IExpenseListFilters>) => void;
	onApply: () => void;
	onClear: () => void;
	variant: "toolbar" | "sidebar";
	speciesData: ISpecie[];
}

const toDateValue = (value?: string) =>
	value ? new Date(`${value}T00:00:00`) : undefined;

export const ExpenseFilterPanel = ({
	filters,
	onChange,
	onApply,
	onClear,
	variant,
	speciesData,
}: ExpenseFilterPanelProps) => {
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

	const groupByOptions = useMemo(
		() =>
			financialSummaryGroupBy.map((groupBy) => ({
				label: t(`filters.groupByOptions.${groupBy}`),
				value: groupBy,
			})),
		[t],
	);

	const periodOptions = useMemo(
		() =>
			financialSummaryPeriods.map((period) => ({
				label: t(`filters.periodOptions.${period}`),
				value: period,
			})),
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

	const setGroupBy = (value: string) => {
		onChange({
			...filters,
			groupBy:
				value === "all"
					? undefined
					: (value as NonNullable<IExpenseListFilters["groupBy"]>),
		});
	};

	const setPeriod = (value: string) => {
		onChange({
			...filters,
			period:
				value === "all"
					? undefined
					: (value as NonNullable<IExpenseListFilters["period"]>),
		});
	};

	const setDate = (key: "from" | "to", date?: Date) => {
		onChange({
			...filters,
			[key]: date ? toYyyyMmDd(date) : undefined,
		});
	};

	const controls = (
		<>
			<div className="space-y-1">
				<p className="text-caption text-muted-foreground font-semibold uppercase tracking-wide">
					{t("filters.typeLabel")}
				</p>
				<Select
					value={filters.type ?? "all"}
					onValueChange={setType}
				>
					<SelectTrigger className="h-10">
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

			<div className="space-y-1">
				<p className="text-caption text-muted-foreground font-semibold uppercase tracking-wide">
					{t("filters.speciesLabel")}
				</p>
				<Select
					value={filters.speciesId ?? "all"}
					onValueChange={setSpeciesId}
				>
					<SelectTrigger className="h-10">
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

			<div className="space-y-1">
				<p className="text-caption text-muted-foreground font-semibold uppercase tracking-wide">
					{t("filters.groupByLabel")}
				</p>
				<Select
					value={filters.groupBy ?? "all"}
					onValueChange={setGroupBy}
				>
					<SelectTrigger className="h-10">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("filters.allGroupBy")}</SelectItem>
						{groupByOptions.map((option) => (
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
					{t("filters.periodLabel")}
				</p>
				<Select
					value={filters.period ?? "all"}
					onValueChange={setPeriod}
				>
					<SelectTrigger className="h-10">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("filters.allPeriods")}</SelectItem>
						{periodOptions.map((option) => (
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
					{t("filters.fromLabel")}
				</p>
				<div className="flex items-center gap-2">
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
			</div>

			<div className="space-y-1">
				<p className="text-caption text-muted-foreground font-semibold uppercase tracking-wide">
					{t("filters.toLabel")}
				</p>
				<div className="flex items-center gap-2">
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
		</>
	);

	if (variant === "toolbar") {
		return (
			<Card className="hidden md:flex lg:hidden border border-border/70 shadow-none py-4">
				<CardContent className="px-4">
					<div className="grid grid-cols-1 gap-3 xl:grid-cols-7">
						{controls}
						<div className="flex items-end justify-end gap-2">
							<Button
								type="button"
								variant="ghost"
								onClick={onClear}
							>
								{t("filters.clear")}
							</Button>
							<Button
								type="button"
								onClick={onApply}
							>
								{t("filters.apply")}
							</Button>
						</div>
					</div>
					<p className="mt-2 text-sm text-muted-foreground">
						{activeFilterCount > 0
							? t("filters.count", { count: activeFilterCount })
							: t("filters.noSelection")}
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
						{t("filters.title")}
					</h3>
					<p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
						{t("filters.refine")}
					</p>
				</div>

				<div className="space-y-4">{controls}</div>

				<div className="flex items-center gap-2 pt-2">
					<Button
						type="button"
						variant="ghost"
						onClick={onClear}
					>
						{t("filters.clear")}
					</Button>
					<Button
						type="button"
						onClick={onApply}
					>
						{t("filters.apply")}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
