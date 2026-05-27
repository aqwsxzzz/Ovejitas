import type { FinanceAssetKindFilter } from "@/features/finance/finance-types";
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

export const toApiDateTime = (
	rawDate: string,
	endOfDay: boolean,
): string | undefined => {
	if (!rawDate) return undefined;
	const timePart = endOfDay ? "23:59:59.999" : "00:00:00.000";
	const parsed = new Date(`${rawDate}T${timePart}`);
	return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

export const formatAssetKind = (
	kind: FinanceAssetKindFilter | LivestockAssetKind,
): string => {
	if (kind === "all") return "Todos los tipos";

	const labels: Record<LivestockAssetKind, string> = {
		animal: "Animal",
		crop: "Cultivo",
		equipment: "Equipo",
		material: "Material",
		location: "Ubicacion",
	};

	return labels[kind];
};