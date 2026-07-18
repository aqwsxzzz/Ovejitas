import type {
	IAssetProductionTargetRead,
	ProductionTargetBasis,
	ProductionTargetPeriod,
} from "@/features/livestock/types/production-targets-types";

/** Trim trailing decimal zeros from a backend decimal string ("1.000" -> "1"). */
export function normalizeRate(value: string | null): string {
	if (value == null) return "";
	const parsed = Number(value);
	return Number.isFinite(parsed) ? String(parsed) : "";
}

export function todayISODate(): string {
	return new Date().toISOString().slice(0, 10);
}

const BASIS_LABELS: Record<ProductionTargetBasis, string> = {
	per_head_continuous: "por cabeza",
	per_event: "por evento",
	total: "total",
};

export function basisLabel(basis: ProductionTargetBasis): string {
	return BASIS_LABELS[basis];
}

const PERIOD_LABELS: Record<ProductionTargetPeriod, string> = {
	day: "día",
	year: "año",
};

export function periodLabel(period: ProductionTargetPeriod | null): string {
	return period ? PERIOD_LABELS[period] : "";
}

/** Active = not archived and still within its effective window as of today. */
export function isTargetActive(
	target: IAssetProductionTargetRead,
	today: string,
): boolean {
	if (target.archived_at != null) return false;
	return target.effective_to == null || target.effective_to >= today;
}
