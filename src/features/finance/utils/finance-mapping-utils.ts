// Utility functions for mapping, calculations, and alert logic from v2-finance-page
import {
	formatCurrency,
	parseDecimal,
} from "@/features/finance/finance-dashboard-utils";
import { parseBucketYearMonth } from "@/features/finance/utils/finance-date-utils";
import type {
	FinanceInsightRow,
	FinanceTrendSection,
	FinanceAlertItem,
} from "@/features/finance/components/finance-dashboard-shell";

export const calculateTrend = (
	current: number,
	previous: number,
): number | null => {
	if (previous === 0) return null;
	return ((current - previous) / Math.abs(previous)) * 100;
};

/**
 * Per-asset insight rows, derived from `profitability-full` rather than R1.
 *
 * R1 books feed cost on the material that was bought, never on the animal that
 * ate it, so a coop that consumed more feed than it earned still showed a
 * positive net — the loss list was missing the real losses. It also included
 * `material` and `produce` assets, which distort in opposite directions: feed
 * is a cost centre and can only ever look like a loss, while a produce pool
 * carries the whole sale income and outranks the animals that actually made it,
 * double-counting money already reported as their `allocated_produce_income`.
 *
 * `profitability-full` excludes both kinds by construction and exposes
 * `net_incl_materials` — (income + allocated produce income) − (direct expense
 * + feed) — which is the bottom line these lists were always reaching for.
 */
export const mapInsightRows = (
	rows: Array<{
		asset_id: number;
		asset_name: string;
		currency: string | null;
		income_total: string;
		allocated_produce_income: string;
		direct_expense_total: string;
		consumed_material_cost: string;
		total_cost: string;
		net_incl_materials: string;
		has_unvalued_consumption: boolean;
	}>,
	metric: "income" | "expense" | "net",
	currency: string,
	options?: {
		netMode?: "positive" | "negative" | "all";
	},
): FinanceInsightRow[] => {
	const netMode = options?.netMode ?? "positive";
	// One row per (asset, currency): comparing across currencies would be
	// meaningless, so only the currency these lists are labelled with is kept.
	const inCurrency = rows.filter((row) => row.currency === currency);
	// Income the asset earned, including the share of what its produce sold for.
	// `net_incl_materials` already counts that share; adding it to income here
	// keeps the two lists consistent rather than double-counting.
	const incomeOf = (row: (typeof rows)[number]) =>
		parseDecimal(row.income_total) + parseDecimal(row.allocated_produce_income);
	// Everything the asset cost: what was booked on it plus the feed it ate.
	const expenseOf = (row: (typeof rows)[number]) => parseDecimal(row.total_cost);
	const netOf = (row: (typeof rows)[number]) =>
		parseDecimal(row.net_incl_materials);

	const sorted = [...inCurrency].sort((left, right) => {
		if (metric === "income") return incomeOf(right) - incomeOf(left);
		if (metric === "expense") return expenseOf(right) - expenseOf(left);
		if (netMode === "negative") return netOf(left) - netOf(right);
		return netOf(right) - netOf(left);
	});
	const filtered =
		metric === "net"
			? netMode === "negative"
				? sorted.filter((row) => netOf(row) < 0)
				: netMode === "all"
					? sorted
					: sorted.filter((row) => netOf(row) >= 0)
			: sorted;
	const total = filtered.reduce((sum, row) => {
		if (metric === "income") return sum + incomeOf(row);
		if (metric === "expense") return sum + expenseOf(row);
		const netValue = netOf(row);
		return netMode === "negative" ? sum + Math.abs(netValue) : sum + netValue;
	}, 0);

	return filtered.slice(0, 5).map((row) => {
		const value =
			metric === "income"
				? incomeOf(row)
				: metric === "expense"
					? expenseOf(row)
					: netOf(row);
		const normalizedValue =
			metric === "net" && netMode === "negative" ? Math.abs(value) : value;
		const share = total > 0 ? (normalizedValue / total) * 100 : 0;
		return {
			assetId: String(row.asset_id),
			label: row.asset_name,
			subtitle:
				// Feed with no purchase behind it cannot be valued, so the cost is
				// understated and the net overstated. Saying so beats a confident
				// number the farmer cannot reconcile.
				row.has_unvalued_consumption
					? "Costo incompleto: alimento sin compra registrada"
					: metric === "net"
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

export const buildTrendSections = (
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

export const buildYearMonthSections = (
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

export const buildAlerts = (
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
