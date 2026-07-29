import { formatAssetKindLabel } from "@/features/livestock/constants/asset-kind-options";
import type { ILivestockAsset } from "@/features/livestock/types/livestock-types";

export function formatMoney(value: number): string {
	const sign = value >= 0 ? "+" : "-";
	return `${sign}$${Math.abs(value).toFixed(2)}`;
}

export function parseNumeric(value: string | null): number {
	if (!value) return 0;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

export function toModeLabel(asset: ILivestockAsset): string | null {
	if (asset.mode == null) return null;
	return asset.mode === "aggregated" ? "Agrupado" : "Individual";
}

export function toKindLabel(asset: ILivestockAsset): string {
	return formatAssetKindLabel(asset.kind);
}
