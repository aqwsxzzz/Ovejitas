import type { IUpcomingBirthRow } from "@/features/reports/types/reports-types";

export type BirthAlertSeverity = "overdue" | "imminent" | "upcoming";

export interface BirthAlert {
	row: IUpcomingBirthRow;
	severity: BirthAlertSeverity;
	/** Whole days from today. Negative when the due date has passed. */
	daysFromToday: number;
}

/** A birth due within this many days counts as imminent rather than upcoming. */
const IMMINENT_WINDOW_DAYS = 7;

const MS_PER_DAY = 86_400_000;

function startOfLocalDay(value: Date): number {
	return new Date(
		value.getFullYear(),
		value.getMonth(),
		value.getDate(),
	).getTime();
}

/**
 * Whole days from today to `isoDate`, both floored to the local calendar day so
 * a due date later today reads as 0 rather than rounding to 1.
 */
export function daysFromToday(isoDate: string, now: Date = new Date()): number {
	const due = startOfLocalDay(new Date(isoDate));
	return Math.round((due - startOfLocalDay(now)) / MS_PER_DAY);
}

/**
 * Classify a row from the upcoming-births report.
 *
 * Deliberately ignores the report's `days_until_due`: that field counts from the
 * query's `date_from`, not from today, and the report filters
 * `expected_due_at >= date_from` — so it is always >= 0 and can never signal an
 * overdue birth. Overdue is derived here, from `expected_due_at`.
 */
export function toBirthAlert(
	row: IUpcomingBirthRow,
	now: Date = new Date(),
): BirthAlert {
	const days = daysFromToday(row.expected_due_at, now);
	const severity: BirthAlertSeverity =
		days < 0 ? "overdue" : days <= IMMINENT_WINDOW_DAYS ? "imminent" : "upcoming";
	return { row, severity, daysFromToday: days };
}

/** Overdue first, then soonest — the order a farmer needs to act in. */
export function toSortedBirthAlerts(
	rows: IUpcomingBirthRow[],
	now: Date = new Date(),
): BirthAlert[] {
	return rows
		.map((row) => toBirthAlert(row, now))
		.sort((a, b) => a.daysFromToday - b.daysFromToday);
}

export function formatBirthCountdown(alert: BirthAlert): string {
	const { daysFromToday: days } = alert;
	if (days === 0) return "Hoy";
	if (days < 0) {
		const overdueBy = Math.abs(days);
		return overdueBy === 1 ? "Vencido hace 1 día" : `Vencido hace ${overdueBy} días`;
	}
	return days === 1 ? "Mañana" : `en ${days} d`;
}
