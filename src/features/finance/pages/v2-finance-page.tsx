import { useState } from "react";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import {
	FinanceDashboardShell,
	type FinanceAlertItem,
	type FinanceInsightRow,
	type FinancePeriodWheel,
	type FinanceSummaryCardData,
	type FinanceTrendSection,
} from "@/features/finance/components/finance-dashboard-shell";
import {
	formatCurrency,
	getChartBucket,
	getPreviousRange,
	parseDateInput,
	parseDecimal,
	startOfDay,
	toDateInput,
	type FinanceDateRange,
	type FinanceRangePreset,
} from "@/features/finance/finance-dashboard-utils";
import {
	useGetAggregateReport,
	useGetProfitabilityReport,
} from "@/features/reports/api/reports-queries";
const PERIOD_WHEEL_RADIUS = 2;

const addDays = (value: Date, days: number): Date => {
	const next = new Date(value);
	next.setDate(next.getDate() + days);
	return next;
};

const getWeekStart = (value: Date): Date => {
	const next = startOfDay(value);
	const dayIndex = (next.getDay() + 6) % 7;
	next.setDate(next.getDate() - dayIndex);
	return next;
};

const buildWeekRange = (start: Date, today: Date): FinanceDateRange => {
	const from = startOfDay(start);
	const end = addDays(from, 6);
	const to = end > today ? today : end;
	return { from: toDateInput(from), to: toDateInput(to) };
};

const buildMonthRange = (
	year: number,
	month: number,
	today: Date,
): FinanceDateRange => {
	const from = new Date(year, month, 1);
	const end = new Date(year, month + 1, 0);
	const to = end > today ? today : end;
	return { from: toDateInput(from), to: toDateInput(to) };
};

const buildYearRange = (year: number, today: Date): FinanceDateRange => {
	const from = new Date(year, 0, 1);
	const end = new Date(year, 11, 31);
	const to = end > today ? today : end;
	return { from: toDateInput(from), to: toDateInput(to) };
};

const getDefaultPresetRange = (
	preset: FinanceRangePreset,
	today: Date,
): FinanceDateRange => {
	if (preset === "week") return buildWeekRange(getWeekStart(today), today);
	if (preset === "month")
		return buildMonthRange(today.getFullYear(), today.getMonth(), today);
	if (preset === "year") return buildYearRange(today.getFullYear(), today);
	return { from: toDateInput(today), to: toDateInput(today) };
};

const formatShortDate = (value: string): string =>
	new Intl.DateTimeFormat("es-ES", {
		day: "2-digit",
		month: "short",
	}).format(parseDateInput(value));

const formatRangeOptionLabel = (range: FinanceDateRange): string =>
	`${formatShortDate(range.from)} - ${formatShortDate(range.to)}`;

const monthLabel = (year: number, month: number): string =>
	new Intl.DateTimeFormat("es-ES", { month: "short" }).format(
		new Date(year, month, 1),
	);

const parseBucketYearMonth = (
	bucket: string,
): { year: number; month: number } | null => {
	const isoMatch = bucket.match(/^(\d{4})-(\d{2})/);
	if (isoMatch) {
		const year = Number(isoMatch[1]);
		const month = Number(isoMatch[2]) - 1;
		if (month >= 0 && month <= 11) {
			return { year, month };
		}
	}

	const bucketDate = new Date(bucket);
	if (Number.isNaN(bucketDate.getTime())) return null;
	return {
		year: bucketDate.getFullYear(),
		month: bucketDate.getMonth(),
	};
};

const buildAvailableMonths = (
	rows: Array<{ bucket: string }> = [],
	selectedYear: number,
): Set<number> => {
	const available = new Set<number>();
	for (const row of rows) {
		const parsed = parseBucketYearMonth(row.bucket);
		if (!parsed) continue;
		if (parsed.year !== selectedYear) continue;
		available.add(parsed.month);
	}
	return available;
};

const createEmptyRange = (): FinanceDateRange => {
	const today = startOfDay(new Date());
	return getDefaultPresetRange("month", today);
};

const getPrimaryCurrency = (
	currentTotals: Array<{ currency: string }>,
	previousTotals: Array<{ currency: string }>,
): string => currentTotals[0]?.currency ?? previousTotals[0]?.currency ?? "USD";

const pickTotal = <T extends { currency: string }>(
	items: T[],
	currency: string,
): T | undefined => items.find((item) => item.currency === currency);

const calculateTrend = (current: number, previous: number): number | null => {
	if (previous === 0) return null;
	return ((current - previous) / Math.abs(previous)) * 100;
};

const mapInsightRows = (
	rows: Array<{
		asset_id: number;
		asset_name: string;
		currency: string;
		income_total: string;
		expense_total: string;
		net: string;
	}>,
	metric: "income" | "expense" | "net",
	currency: string,
	options?: {
		netMode?: "positive" | "negative" | "all";
	},
): FinanceInsightRow[] => {
	const netMode = options?.netMode ?? "positive";
	const sorted = [...rows].sort((left, right) => {
		if (metric === "income")
			return parseDecimal(right.income_total) - parseDecimal(left.income_total);
		if (metric === "expense")
			return (
				parseDecimal(right.expense_total) - parseDecimal(left.expense_total)
			);
		if (netMode === "negative") {
			return parseDecimal(left.net) - parseDecimal(right.net);
		}
		return parseDecimal(right.net) - parseDecimal(left.net);
	});
	const filtered =
		metric === "net"
			? netMode === "negative"
				? sorted.filter((row) => parseDecimal(row.net) < 0)
				: netMode === "all"
					? sorted
					: sorted.filter((row) => parseDecimal(row.net) >= 0)
			: sorted;
	const total = filtered.reduce((sum, row) => {
		if (metric === "income") return sum + parseDecimal(row.income_total);
		if (metric === "expense") return sum + parseDecimal(row.expense_total);
		const netValue = parseDecimal(row.net);
		return netMode === "negative" ? sum + Math.abs(netValue) : sum + netValue;
	}, 0);

	return filtered.slice(0, 5).map((row) => {
		const value =
			metric === "income"
				? parseDecimal(row.income_total)
				: metric === "expense"
					? parseDecimal(row.expense_total)
					: parseDecimal(row.net);
		const normalizedValue =
			metric === "net" && netMode === "negative" ? Math.abs(value) : value;
		const share = total > 0 ? (normalizedValue / total) * 100 : 0;
		return {
			label: row.asset_name,
			subtitle:
				metric === "net"
					? netMode === "negative"
						? "Contribucion a perdida"
						: "Contribucion a ganancia"
					: `${metric === "income" ? "Impulsor de ingresos" : "Impulsor de gastos"}`,
			value: formatCurrency(value, currency),
			shareLabel: `${share.toFixed(1)}% del total`,
			fill: share,
			trend:
				metric === "expense" || (metric === "net" && value < 0)
					? "negative"
					: "positive",
		};
	});
};

const buildTrendSections = (
	incomeRows: Array<{
		bucket: string;
		group_label?: string | null;
		group: string | null;
		value: string;
	}>,
	expenseRows: Array<{
		bucket: string;
		group_label?: string | null;
		group: string | null;
		value: string;
	}>,
): FinanceTrendSection[] => {
	const sectionMap = new Map<
		string,
		Map<string, { income: number; expense: number }>
	>();
	for (const row of incomeRows) {
		const currency = row.group_label ?? row.group ?? "USD";
		const byBucket = sectionMap.get(currency) ?? new Map();
		const current = byBucket.get(row.bucket) ?? { income: 0, expense: 0 };
		current.income += parseDecimal(row.value);
		byBucket.set(row.bucket, current);
		sectionMap.set(currency, byBucket);
	}
	for (const row of expenseRows) {
		const currency = row.group_label ?? row.group ?? "USD";
		const byBucket = sectionMap.get(currency) ?? new Map();
		const current = byBucket.get(row.bucket) ?? { income: 0, expense: 0 };
		current.expense += parseDecimal(row.value);
		byBucket.set(row.bucket, current);
		sectionMap.set(currency, byBucket);
	}

	return Array.from(sectionMap.entries()).map(([currency, byBucket]) => ({
		currency,
		rows: Array.from(byBucket.entries())
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([bucket, values]) => ({
				label: bucket,
				income: values.income,
				expense: values.expense,
				net: values.income - values.expense,
			})),
	}));
};

const buildYearMonthSections = (
	year: number,
	incomeRows: Array<{
		bucket: string;
		group_label?: string | null;
		group: string | null;
		value: string;
	}>,
	expenseRows: Array<{
		bucket: string;
		group_label?: string | null;
		group: string | null;
		value: string;
	}>,
): FinanceTrendSection[] => {
	const monthFormatter = new Intl.DateTimeFormat("es-ES", { month: "short" });
	const currencyMap = new Map<
		string,
		Array<{ income: number; expense: number }>
	>();

	for (const row of incomeRows) {
		const currency = row.group_label ?? row.group ?? "USD";
		const parsed = parseBucketYearMonth(row.bucket);
		if (!parsed || parsed.year !== year) continue;
		const monthIndex = parsed.month;
		const months =
			currencyMap.get(currency) ??
			Array.from({ length: 12 }, () => ({ income: 0, expense: 0 }));
		months[monthIndex].income += parseDecimal(row.value);
		currencyMap.set(currency, months);
	}

	for (const row of expenseRows) {
		const currency = row.group_label ?? row.group ?? "USD";
		const parsed = parseBucketYearMonth(row.bucket);
		if (!parsed || parsed.year !== year) continue;
		const monthIndex = parsed.month;
		const months =
			currencyMap.get(currency) ??
			Array.from({ length: 12 }, () => ({ income: 0, expense: 0 }));
		months[monthIndex].expense += parseDecimal(row.value);
		currencyMap.set(currency, months);
	}

	if (currencyMap.size === 0) {
		currencyMap.set(
			"USD",
			Array.from({ length: 12 }, () => ({ income: 0, expense: 0 })),
		);
	}

	return Array.from(currencyMap.entries()).map(([currency, months]) => ({
		currency,
		rows: months.map((values, monthIndex) => ({
			label: monthFormatter.format(new Date(year, monthIndex, 1)),
			income: values.income,
			expense: values.expense,
			net: values.income - values.expense,
		})),
	}));
};

const buildAlerts = (
	currentIncome: number,
	previousIncome: number,
	currentExpense: number,
	previousExpense: number,
	lossRows: FinanceInsightRow[],
): FinanceAlertItem[] => {
	const alerts: FinanceAlertItem[] = [];
	const incomeTrend = calculateTrend(currentIncome, previousIncome);
	const expenseTrend = calculateTrend(currentExpense, previousExpense);

	if (expenseTrend !== null && expenseTrend > 15) {
		alerts.push({
			tone: "warning",
			title: `Gastos +${expenseTrend.toFixed(0)}%`,
			detail:
				"La granja esta gastando mas que en el periodo anterior. Revisa primero los mayores impulsores de costo.",
		});
	}
	if (incomeTrend !== null && incomeTrend < -10) {
		alerts.push({
			tone: "warning",
			title: `Ingresos -${Math.abs(incomeTrend).toFixed(0)}%`,
			detail:
				"El flujo de ingresos es mas debil que en el periodo anterior. Revisa ventas y tiempos de produccion.",
		});
	}
	if (lossRows.length > 0) {
		alerts.push({
			tone: "warning",
			title: `${lossRows.length} activos con perdida`,
			detail: `${lossRows[0].label} es el mayor contribuyente de perdida ahora.`,
		});
	}
	if (alerts.length === 0) {
		alerts.push({
			tone: "info",
			title: "Finanzas estables",
			detail:
				"No se detectaron senales de alerta importantes para el periodo seleccionado.",
		});
	}

	return alerts.slice(0, 3);
};

export function V2FinancePage() {
	const { data: currentUser } = useGetUserProfile();
	const farmId = currentUser?.lastVisitedFarmId ?? "";
	const today = startOfDay(new Date());
	const [rangePreset, setRangePreset] = useState<FinanceRangePreset>("month");
	const [range, setRange] = useState<FinanceDateRange>(() =>
		createEmptyRange(),
	);

	const currentRange = range;
	const selectedFromDate = parseDateInput(currentRange.from);
	const selectedYear = selectedFromDate.getFullYear();
	const currentYear = today.getFullYear();
	const previousRange = getPreviousRange(currentRange);
	const bucket = getChartBucket(rangePreset, currentRange);
	const isRangeValid = currentRange.from <= currentRange.to;
	const hasFarm = !!farmId;
	const yearStart = toDateInput(new Date(selectedYear, 0, 1));
	const yearEnd = toDateInput(new Date(selectedYear, 11, 31));

	const currentProfitabilityQuery = useGetProfitabilityReport(
		{
			farmId,
			date_from: currentRange.from,
			date_to: currentRange.to,
		},
		hasFarm && isRangeValid,
	);
	const previousProfitabilityQuery = useGetProfitabilityReport(
		{
			farmId,
			date_from: previousRange.from,
			date_to: previousRange.to,
		},
		hasFarm && isRangeValid,
	);
	const incomeQuery = useGetAggregateReport(
		{
			farmId,
			bucket,
			type: "income",
			date_from: currentRange.from,
			date_to: currentRange.to,
		},
		hasFarm && isRangeValid,
	);
	const expenseQuery = useGetAggregateReport(
		{
			farmId,
			bucket,
			type: "expense",
			date_from: currentRange.from,
			date_to: currentRange.to,
		},
		hasFarm && isRangeValid,
	);
	const monthlyIncomeAvailabilityQuery = useGetAggregateReport(
		{
			farmId,
			bucket: "month",
			type: "income",
			date_from: yearStart,
			date_to: yearEnd,
		},
		hasFarm && rangePreset === "month",
	);
	const monthlyExpenseAvailabilityQuery = useGetAggregateReport(
		{
			farmId,
			bucket: "month",
			type: "expense",
			date_from: yearStart,
			date_to: yearEnd,
		},
		hasFarm && rangePreset === "month",
	);

	const currentTotals = currentProfitabilityQuery.data?.totals ?? [];
	const previousTotals = previousProfitabilityQuery.data?.totals ?? [];
	const primaryCurrency = getPrimaryCurrency(currentTotals, previousTotals);
	const currentSummary = pickTotal(currentTotals, primaryCurrency);
	const previousSummary = pickTotal(previousTotals, primaryCurrency);
	const currentRows = currentProfitabilityQuery.data?.data ?? [];

	const currentIncome = parseDecimal(currentSummary?.income_total);
	const currentExpense = parseDecimal(currentSummary?.expense_total);
	const currentNet = parseDecimal(currentSummary?.net);
	const previousIncome = parseDecimal(previousSummary?.income_total);
	const previousExpense = parseDecimal(previousSummary?.expense_total);
	const previousNet = parseDecimal(previousSummary?.net);

	const summaryCards: FinanceSummaryCardData[] = [
		{
			label: "Ingresos",
			metric: "income",
			value: currentSummary
				? formatCurrency(currentIncome, primaryCurrency)
				: "—",
			trendLabel: "comparado al periodo anterior",
			trendValue: calculateTrend(currentIncome, previousIncome),
			currency: primaryCurrency,
		},
		{
			label: "Gastos",
			metric: "expense",
			value: currentSummary
				? formatCurrency(currentExpense, primaryCurrency)
				: "—",
			trendLabel: "comparado al periodo anterior",
			trendValue: calculateTrend(currentExpense, previousExpense),
			currency: primaryCurrency,
		},
		{
			label: "Balance neto",
			metric: "net",
			value: currentSummary ? formatCurrency(currentNet, primaryCurrency) : "—",
			trendLabel: "comparado al periodo anterior",
			trendValue: calculateTrend(currentNet, previousNet),
			currency: primaryCurrency,
		},
	];

	const profitabilityRows = mapInsightRows(currentRows, "net", primaryCurrency);
	const lossRows = mapInsightRows(currentRows, "net", primaryCurrency, {
		netMode: "negative",
	});
	const expenseRows = mapInsightRows(currentRows, "expense", primaryCurrency);
	const incomeRows = mapInsightRows(currentRows, "income", primaryCurrency);
	const chartSections =
		rangePreset === "month"
			? buildYearMonthSections(
					selectedYear,
					monthlyIncomeAvailabilityQuery.data?.data ?? [],
					monthlyExpenseAvailabilityQuery.data?.data ?? [],
				)
			: buildTrendSections(
					incomeQuery.data?.data ?? [],
					expenseQuery.data?.data ?? [],
				);
	const alerts = buildAlerts(
		currentIncome,
		previousIncome,
		currentExpense,
		previousExpense,
		lossRows,
	);
	const availableMonths = buildAvailableMonths(
		[
			...(monthlyIncomeAvailabilityQuery.data?.data ?? []),
			...(monthlyExpenseAvailabilityQuery.data?.data ?? []),
		],
		selectedYear,
	);

	const periodWheel: FinancePeriodWheel | undefined =
		rangePreset === "custom"
			? undefined
			: rangePreset === "week"
				? {
						label: "Semanas",
						options: Array.from(
							{ length: PERIOD_WHEEL_RADIUS * 2 + 1 },
							(_, index) => {
								const offset = index - PERIOD_WHEEL_RADIUS;
								const selectedWeekStart = getWeekStart(selectedFromDate);
								const weekStart = addDays(selectedWeekStart, offset * 7);
								const weekRange = buildWeekRange(weekStart, today);
								return {
									key: `week:${weekRange.from}`,
									label: formatRangeOptionLabel(weekRange),
									selected:
										weekRange.from === currentRange.from &&
										weekRange.to === currentRange.to,
									disabled: weekStart > today,
								};
							},
						).filter((option) => !option.disabled),
						onSelect: (key) => {
							const from = key.replace("week:", "");
							setRange(buildWeekRange(parseDateInput(from), today));
						},
					}
				: rangePreset === "month"
					? {
							label: `Meses ${selectedYear}`,
							options: Array.from({ length: 12 }, (_, month) => {
								const selected =
									selectedFromDate.getFullYear() === selectedYear &&
									selectedFromDate.getMonth() === month;
								const isFutureMonth =
									selectedYear === currentYear && month > today.getMonth();
								const isCurrentMonth =
									selectedYear === currentYear && month === today.getMonth();
								const hasData = availableMonths.has(month);
								return {
									key: `month:${selectedYear}-${String(month + 1).padStart(2, "0")}`,
									label: monthLabel(selectedYear, month),
									selected,
									disabled:
										isFutureMonth || (!hasData && !selected && !isCurrentMonth),
								};
							}),
							onSelect: (key) => {
								const [, value] = key.split(":");
								const [yearRaw, monthRaw] = value.split("-");
								const nextYear = Number(yearRaw);
								const nextMonth = Number(monthRaw) - 1;
								setRange(buildMonthRange(nextYear, nextMonth, today));
							},
						}
					: {
							label: "Años",
							options: Array.from(
								{ length: PERIOD_WHEEL_RADIUS * 2 + 1 },
								(_, index) => {
									const year = selectedYear + (index - PERIOD_WHEEL_RADIUS);
									return {
										key: `year:${year}`,
										label: String(year),
										selected: year === selectedYear,
										disabled: year > currentYear,
									};
								},
							).filter((option) => !option.disabled),
							onSelect: (key) => {
								const year = Number(key.replace("year:", ""));
								setRange(buildYearRange(year, today));
							},
						};

	if (!hasFarm) {
		return (
			<section className="rounded-3xl border-0 bg-card/90 p-5 shadow-sm">
				<p className="v2-kicker">Finanzas</p>
				<h1 className="mt-2 text-2xl font-semibold tracking-tight">Finanzas</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Selecciona una granja para ver su panel financiero.
				</p>
			</section>
		);
	}

	const handlePresetChange = (nextPreset: FinanceRangePreset) => {
		setRangePreset(nextPreset);
		setRange(getDefaultPresetRange(nextPreset, today));
	};

	return (
		<FinanceDashboardShell
			rangePreset={rangePreset}
			onPresetChange={handlePresetChange}
			range={currentRange}
			onRangeChange={setRange}
			summaryCards={summaryCards}
			chartSections={chartSections}
			profitabilityRows={profitabilityRows}
			lossRows={lossRows}
			expenseRows={expenseRows}
			incomeRows={incomeRows}
			alerts={alerts}
			isCustomRange={rangePreset === "custom"}
			periodWheel={periodWheel}
		/>
	);
}
