import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { FinanceDashboardShell } from "@/features/finance/components/finance-dashboard-shell";
import {
	getChartBucket,
	getPreviousRange,
	parseDateInput,
	startOfDay,
	toDateInput,
	type FinanceDateRange,
	type FinanceRangePreset,
} from "@/features/finance/finance-dashboard-utils";
import {
	useGetAggregateReport,
	useGetProfitabilityReport,
} from "@/features/reports/api/reports-queries";
import {
	createEmptyRange,
	getDefaultPresetRange,
	buildAvailableMonths,
	getPrimaryCurrency,
	pickTotal,
	getPeriodWheel,
} from "../utils/finance-date-utils";
import {
	mapInsightRows,
	buildTrendSections,
	buildYearMonthSections,
	buildAlerts,
	calculateTrend,
} from "../utils/finance-mapping-utils";
import {
	formatCurrency,
	parseDecimal,
} from "@/features/finance/finance-dashboard-utils";

export function V2FinancePage() {
	const navigate = useNavigate();
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

	const summaryCards = [
		{
			label: "Ingresos",
			metric: "income" as const,
			value: currentSummary
				? formatCurrency(currentIncome, primaryCurrency)
				: "—",
			trendLabel: "comparado al periodo anterior",
			trendValue: calculateTrend(currentIncome, previousIncome),
			currency: primaryCurrency,
		},
		{
			label: "Gastos",
			metric: "expense" as const,
			value: currentSummary
				? formatCurrency(currentExpense, primaryCurrency)
				: "—",
			trendLabel: "comparado al periodo anterior",
			trendValue: calculateTrend(currentExpense, previousExpense),
			currency: primaryCurrency,
		},
		{
			label: "Balance neto",
			metric: "net" as const,
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

	const periodWheel = getPeriodWheel({
		rangePreset,
		selectedFromDate,
		selectedYear,
		currentYear,
		today,
		currentRange,
		availableMonths,
		setRange,
	});

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

	const handleInsightAssetClick = (assetId: string) => {
		void navigate({
			to: "/v2/production-units/flock/$unitId",
			params: { unitId: assetId },
			search: {
				eventType: undefined,
			},
		});
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
			onInsightAssetClick={handleInsightAssetClick}
		/>
	);
}
