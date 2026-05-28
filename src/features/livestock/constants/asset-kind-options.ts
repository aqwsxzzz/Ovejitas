import type { LivestockAssetKind } from "@/features/livestock/types/livestock-types";

export interface AssetKindOption {
	kind: LivestockAssetKind;
	title: string;
	pluralLabel: string;
}

export const ASSET_KIND_OPTIONS: AssetKindOption[] = [
	{ kind: "animal", title: "Ganado", pluralLabel: "lotes" },
	{ kind: "material", title: "Materiales", pluralLabel: "materiales" },
	{ kind: "crop", title: "Cultivos", pluralLabel: "cultivos" },
	{ kind: "equipment", title: "Equipos", pluralLabel: "equipos" },
	{ kind: "location", title: "Ubicaciones", pluralLabel: "ubicaciones" },
];

export function isLivestockAssetKind(
	value: string,
): value is LivestockAssetKind {
	return (
		value === "animal" ||
		value === "material" ||
		value === "crop" ||
		value === "equipment" ||
		value === "location"
	);
}
