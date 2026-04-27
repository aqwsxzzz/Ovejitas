/**
 * Adapter layer to convert backend API responses to frontend domain types
 */

import type {
	Individual,
	ProductionUnit,
} from "@/shared/types/v2-domain-types";
import type {
	BackendAssetRead,
	BackendIndividualRead,
} from "@/shared/api/v2-backend-api";

/** Convert backend Asset to frontend ProductionUnit */
export function adaptAssetToProductionUnit(
	asset: BackendAssetRead,
): ProductionUnit {
	return {
		id: asset.id,
		farmId: asset.farm_id,
		name: asset.name,
		categoryLabel: kindToLabel(asset.kind),
		kind: asset.kind,
		mode: asset.mode === "aggregated" ? "aggregate" : asset.mode,
		status: asset.status === "archived" ? "inactive" : asset.status,
		location: asset.location,
		tags: asset.tags ?? [],
		// TODO: Add headCount from separate endpoint when available
		headCount: undefined,
		headCountChange: undefined,
	};
}

/** Convert backend Individual to frontend Individual */
export function adaptIndividualToFrontend(
	individual: BackendIndividualRead,
): Individual {
	return {
		id: individual.id,
		unitId: individual.asset_id,
		name: individual.name ?? individual.tag,
		tag: individual.tag,
		sex: individual.sex,
		birthDate: individual.birth_date,
		status: individual.status,
		parentId: individual.parent_id,
		motherId: individual.mother_id,
		fatherId: individual.father_id,
		attributes: individual.attributes,
	};
}

/** Convert frontend ProductionUnit to backend Asset create payload */
export function adaptProductionUnitToAsset(unit: Partial<ProductionUnit>) {
	return {
		name: unit.name,
		kind: unit.kind ?? "animal",
		mode: unit.mode === "aggregate" ? "aggregated" : unit.mode,
		location: unit.location,
		tags: unit.tags,
	};
}

/** Convert kind enum to human-readable label */
function kindToLabel(kind: string): string {
	const labels: Record<string, string> = {
		animal: "Animal",
		crop: "Crop",
		equipment: "Equipment",
		material: "Material",
		location: "Location",
	};
	return labels[kind] ?? kind;
}
