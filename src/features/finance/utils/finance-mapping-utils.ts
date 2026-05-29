// Utility functions for mapping, calculations, and alert logic from v2-finance-page
import { formatCurrency, parseDecimal } from "@/features/finance/finance-dashboard-utils";
import type {
	FinanceInsightRow,
	FinanceTrendSection,
	FinanceAlertItem
} from "@/features/finance/components/finance-dashboard-shell";

export const calculateTrend = (
	current: number,
	previous: number,
): number | null => {
	if (previous === 0) return null;
	return ((current - previous) / Math.abs(previous)) * 100;
};

export const mapInsightRows = (
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
			assetId: String(row.asset_id),
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
		const parsed =
			(row.bucket.match(/^(\d{4})-(\d{2})/)
				? {
						year: Number(row.bucket.slice(0, 4)),
						month: Number(row.bucket.slice(5, 7)) - 1,
					}
				: null) ||
			(() => {
				const bucketDate = new Date(row.bucket);
				if (Number.isNaN(bucketDate.getTime())) return null;
				return {
					year: bucketDate.getFullYear(),
					month: bucketDate.getMonth(),
				};
			})();
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
		const parsed =
			(row.bucket.match(/^(\d{4})-(\d{2})/)
				? {
						year: Number(row.bucket.slice(0, 4)),
						month: Number(row.bucket.slice(5, 7)) - 1,
					}
				: null) ||
			(() => {
				const bucketDate = new Date(row.bucket);
				if (Number.isNaN(bucketDate.getTime())) return null;
				return {
					year: bucketDate.getFullYear(),
					month: bucketDate.getMonth(),
				};
			})();
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
