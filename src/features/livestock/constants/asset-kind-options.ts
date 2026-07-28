import type { LivestockAssetKind } from "@/features/livestock/types/livestock-types";

export interface AssetKindOption {
	kind: LivestockAssetKind;
	title: string;
	pluralLabel: string;
}

/**
 * Singular Spanish name for an asset kind — the one users read on badges.
 *
 * The raw value is a backend enum (`produce`, `crop`, `equipment`, `location`),
 * so it must never reach the UI: capitalising it happens to look Spanish for
 * `animal` and `material` and is plainly English for the rest.
 */
export const ASSET_KIND_LABELS: Record<LivestockAssetKind, string> = {
	animal: "Animal",
	crop: "Cultivo",
	equipment: "Equipo",
	material: "Material",
	produce: "Producto",
	location: "Ubicacion",
};

/** Falls back to "Animal", the kind an asset with no `kind` is treated as. */
export function formatAssetKindLabel(
	kind: LivestockAssetKind | null | undefined,
): string {
	return kind ? ASSET_KIND_LABELS[kind] : ASSET_KIND_LABELS.animal;
}

export const ASSET_KIND_OPTIONS: AssetKindOption[] = [
	{ kind: "animal", title: "Ganado", pluralLabel: "lotes" },
	{ kind: "material", title: "Materiales", pluralLabel: "materiales" },
	{ kind: "produce", title: "Productos", pluralLabel: "productos" },
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
		value === "produce" ||
		value === "crop" ||
		value === "equipment" ||
		value === "location"
	);
}
