import type { FinanceFilters } from "@/features/finance/finance-types";

export type FinanceRangePreset = "week" | "month" | "year" | "custom";

export interface FinanceDateRange {
	from: string;
	to: string;
}

const pad = (value: number): string => String(value).padStart(2, "0");

export const toDateInput = (value: Date): string =>
	`${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;

export const startOfDay = (value: Date): Date => {
	const next = new Date(value);
	next.setHours(0, 0, 0, 0);
	return next;
};

export const parseDateInput = (value: string): Date =>
	new Date(`${value}T12:00:00`);

export const getRangeForPreset = (
	preset: FinanceRangePreset,
	baseDate = new Date(),
): FinanceDateRange => {
	const today = startOfDay(baseDate);
	if (preset === "custom") {
		return { from: toDateInput(today), to: toDateInput(today) };
	}

	const from = new Date(today);
	if (preset === "week") from.setDate(from.getDate() - 6);
	if (preset === "month") from.setDate(1);
	if (preset === "year") from.setMonth(0, 1);

	return { from: toDateInput(from), to: toDateInput(today) };
};

export const getPreviousRange = (range: FinanceDateRange): FinanceDateRange => {
	const from = parseDateInput(range.from);
	const to = parseDateInput(range.to);
	const days = Math.max(
		1,
		Math.round((to.getTime() - from.getTime()) / 86400000) + 1,
	);
	const previousTo = new Date(from);
	previousTo.setDate(previousTo.getDate() - 1);
	const previousFrom = new Date(previousTo);
	previousFrom.setDate(previousFrom.getDate() - (days - 1));

	return {
		from: toDateInput(previousFrom),
		to: toDateInput(previousTo),
	};
};

export const getChartBucket = (
	preset: FinanceRangePreset,
	range: FinanceDateRange,
) => {
	if (preset === "week") return "day";
	if (preset === "year") return "month";
	const from = parseDateInput(range.from);
	const to = parseDateInput(range.to);
	const days = Math.max(
		1,
		Math.round((to.getTime() - from.getTime()) / 86400000) + 1,
	);
	return days > 90 ? "month" : "week";
};

export const parseDecimal = (value: string | null | undefined): number => {
	if (!value) return 0;
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : 0;
};

export const formatCurrency = (value: number, currency: string): string => {
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value);
	} catch {
		return `${value.toFixed(2)} ${currency}`;
	}
};

export const formatPercent = (value: number): string => {
	const sign = value > 0 ? "+" : "";
	return `${sign}${value.toFixed(1)}%`;
};

export const formatRangeLabel = (value: FinanceDateRange): string => {
	const formatter = new Intl.DateTimeFormat(undefined, {
		month: "short",
		day: "2-digit",
	});
	return `${formatter.format(parseDateInput(value.from))} - ${formatter.format(parseDateInput(value.to))}`;
};

export const buildFinanceRangeFromFilters = (
	filters: FinanceFilters,
): FinanceDateRange => ({
	from: filters.dateFrom,
	to: filters.dateTo,
});
