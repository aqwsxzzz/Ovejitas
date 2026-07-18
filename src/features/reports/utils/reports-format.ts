import {
	EVENT_UNIT_LABELS,
	EVENT_UNITS_BY_DIMENSION,
	type EventUnit,
} from "@/shared/types/unit-types";

const COUNT_UNITS = new Set<EventUnit>(EVENT_UNITS_BY_DIMENSION.count);

const toNumber = (value: string | number | null | undefined): number => {
	if (typeof value === "number") return value;
	if (value == null) return NaN;
	return parseFloat(value);
};

/** Productivity percentage as a one-decimal string, or "—" when unavailable. */
export const formatProductivityPct = (value: string | null): string => {
	const parsed = toNumber(value);
	return Number.isFinite(parsed) ? `${parsed.toFixed(1)}%` : "—";
};

/**
 * Format a quantity in its product unit with thousands separators and the
 * Spanish unit label. Count units (unit/dozen/head) round to whole numbers;
 * mass and volume keep up to two decimals. Falls back to "—" when missing.
 */
export const formatProductionQuantity = (
	value: string | number | null,
	unit: EventUnit | null | undefined,
): string => {
	const parsed = toNumber(value);
	if (!Number.isFinite(parsed)) return "—";
	const maximumFractionDigits = unit && COUNT_UNITS.has(unit) ? 0 : 2;
	const formatted = new Intl.NumberFormat(undefined, {
		maximumFractionDigits,
	}).format(parsed);
	return unit ? `${formatted} ${EVENT_UNIT_LABELS[unit]}` : formatted;
};

/**
 * Format a monetary value in its currency, or "—" when unavailable. A null
 * currency (e.g. unpriced feed with no ledger currency) renders as a plain number.
 */
export const formatCurrency = (
	value: string | number | null,
	currency: string | null,
): string => {
	const parsed = toNumber(value);
	if (!Number.isFinite(parsed)) return "—";
	if (!currency) {
		return new Intl.NumberFormat(undefined, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(parsed);
	}
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(parsed);
	} catch {
		return `${parsed.toFixed(2)} ${currency}`;
	}
};
