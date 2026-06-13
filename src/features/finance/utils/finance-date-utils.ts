// Utility functions for date and period logic from v2-finance-page
import {
	startOfDay,
	toDateInput,
	parseDateInput,
	type FinanceDateRange,
	type FinanceRangePreset,
} from "@/features/finance/finance-dashboard-utils";

export const PERIOD_WHEEL_RADIUS = 2;

export const addDays = (value: Date, days: number): Date => {
	const next = new Date(value);
	next.setDate(next.getDate() + days);
	return next;
};

export const getWeekStart = (value: Date): Date => {
	const next = startOfDay(value);
	const dayIndex = (next.getDay() + 6) % 7;
	next.setDate(next.getDate() - dayIndex);
	return next;
};

export const buildWeekRange = (start: Date, today: Date): FinanceDateRange => {
	const from = startOfDay(start);
	const end = addDays(from, 6);
	const to = end > today ? today : end;
	return { from: toDateInput(from), to: toDateInput(to) };
};

export const buildMonthRange = (
	year: number,
	month: number,
	today: Date,
): FinanceDateRange => {
	const from = new Date(year, month, 1);
	const end = new Date(year, month + 1, 0);
	const to = end > today ? today : end;
	return { from: toDateInput(from), to: toDateInput(to) };
};

export const buildYearRange = (year: number, today: Date): FinanceDateRange => {
	const from = new Date(year, 0, 1);
	const end = new Date(year, 11, 31);
	const to = end > today ? today : end;
	return { from: toDateInput(from), to: toDateInput(to) };
};

export const getDefaultPresetRange = (
	preset: FinanceRangePreset,
	today: Date,
): FinanceDateRange => {
	if (preset === "week") return buildWeekRange(getWeekStart(today), today);
	if (preset === "month")
		return buildMonthRange(today.getFullYear(), today.getMonth(), today);
	if (preset === "year") return buildYearRange(today.getFullYear(), today);
	return { from: toDateInput(today), to: toDateInput(today) };
};

export const formatShortDate = (value: string): string =>
	new Intl.DateTimeFormat("es-ES", {
		day: "2-digit",
		month: "short",
	}).format(parseDateInput(value));

export const formatRangeOptionLabel = (range: FinanceDateRange): string =>
	`${formatShortDate(range.from)} - ${formatShortDate(range.to)}`;

export const monthLabel = (year: number, month: number): string =>
	new Intl.DateTimeFormat("es-ES", { month: "short" }).format(
		new Date(year, month, 1),
	);

export const parseBucketYearMonth = (
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

export const buildAvailableMonths = (
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

export const createEmptyRange = (): FinanceDateRange => {
	const today = startOfDay(new Date());
	return getDefaultPresetRange("month", today);
};

export const getPrimaryCurrency = (
	currentTotals: Array<{ currency: string }>,
	previousTotals: Array<{ currency: string }>,
): string => currentTotals[0]?.currency ?? previousTotals[0]?.currency ?? "USD";

export const pickTotal = <T extends { currency: string }>(
	items: T[],
	currency: string,
): T | undefined => items.find((item) => item.currency === currency);

// Helper for periodWheel logic
export function getPeriodWheel({
	rangePreset,
	selectedFromDate,
	selectedYear,
	currentYear,
	today,
	currentRange,
	availableMonths,
	setRange,
}: {
	rangePreset: FinanceRangePreset;
	selectedFromDate: Date;
	selectedYear: number;
	currentYear: number;
	today: Date;
	currentRange: FinanceDateRange;
	availableMonths: Set<number>;
	setRange: (range: FinanceDateRange) => void;
}) {
	if (rangePreset === "custom") return undefined;
	if (rangePreset === "week") {
		return {
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
			onSelect: (key: string) => {
				const from = key.replace("week:", "");
				setRange(buildWeekRange(parseDateInput(from), today));
			},
		};
	}
	if (rangePreset === "month") {
		return {
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
					disabled: isFutureMonth || (!hasData && !selected && !isCurrentMonth),
				};
			}),
			onSelect: (key: string) => {
				const [, value] = key.split(":");
				const [yearRaw, monthRaw] = value.split("-");
				const nextYear = Number(yearRaw);
				const nextMonth = Number(monthRaw) - 1;
				setRange(buildMonthRange(nextYear, nextMonth, today));
			},
		};
	}
	// year
	return {
		label: "Años",
		options: Array.from({ length: PERIOD_WHEEL_RADIUS * 2 + 1 }, (_, index) => {
			const year = selectedYear + (index - PERIOD_WHEEL_RADIUS);
			return {
				key: `year:${year}`,
				label: String(year),
				selected: year === selectedYear,
				disabled: year > currentYear,
			};
		}).filter((option) => !option.disabled),
		onSelect: (key: string) => {
			const year = Number(key.replace("year:", ""));
			setRange(buildYearRange(year, today));
		},
	};
}
