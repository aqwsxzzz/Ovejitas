import type { FinanceAssetKindFilter } from "@/features/finance/finance-types";
import { formatAssetKindLabel } from "@/features/livestock/constants/asset-kind-options";
import type { LivestockAssetKind } from "@/features/livestock/types/livestock-types";

export const parseDecimal = (value: string | null | undefined): number => {
	if (!value) return 0;
	return Number.parseFloat(value);
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

export const formatDateLabel = (value: string): string => {
	try {
		return new Intl.DateTimeFormat(undefined, {
			month: "short",
			day: "2-digit",
		}).format(new Date(value));
	} catch {
		return value;
	}
};

/**
 * A `<input type="date">` value is already the bound the backend wants: bare
 * "YYYY-MM-DD", resolved on the farm's calendar, with `date_to` rolled to the
 * end of its local day server-side. Converting it to a UTC instant here is what
 * made "today" windows drop the day's own events.
 */
export const toApiDate = (rawDate: string): string | undefined => {
	if (!rawDate) return undefined;
	return Number.isNaN(new Date(`${rawDate}T00:00:00`).getTime())
		? undefined
		: rawDate;
};

export const formatAssetKind = (
	kind: FinanceAssetKindFilter | LivestockAssetKind,
): string => {
	if (kind === "all") return "Todos los tipos";
	return formatAssetKindLabel(kind);
};