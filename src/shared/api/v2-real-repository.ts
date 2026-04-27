/**
 * Real API repository for v2 - wraps backend API calls with frontend adapters
 * This replaces the mock repository when backend is available
 * Fallback: Keep mock functions for offline/demo mode
 */

import * as backendApi from "@/shared/api/v2-backend-api";
import {
	adaptAssetToProductionUnit,
	adaptIndividualToFrontend,
} from "@/shared/api/v2-backend-adapter";
import type {
	Individual,
	ProductionUnit,
	DashboardSnapshot,
	FinanceSummary,
	FeedSummary,
	FarmEvent,
	EventCreatePayload,
} from "@/shared/types/v2-domain-types";

// ============= Current User & Farm Context =============

let _currentFarmId: string | null = null;

export function setCurrentFarmId(farmId: string) {
	_currentFarmId = farmId;
}

export function getCurrentFarmId(): string {
	if (!_currentFarmId) throw new Error("Farm ID not set");
	return _currentFarmId;
}

// ============= Production Units (Assets) =============

export async function listProductionUnits(options?: {
	page?: number;
	pageSize?: number;
	q?: string;
	sort?: string;
	kind?: backendApi.AssetKind;
	mode?: backendApi.AssetMode;
}): Promise<{
	items: ProductionUnit[];
	total: number;
	page: number;
	pageSize: number;
}> {
	const farmId = getCurrentFarmId();
	const result = await backendApi.fetchAssets(farmId, options);

	return {
		items: result.items.map(adaptAssetToProductionUnit),
		total: result.total,
		page: result.page,
		pageSize: result.page_size,
	};
}

export async function getProductionUnit(
	unitId: string,
): Promise<ProductionUnit> {
	const farmId = getCurrentFarmId();
	const asset = await backendApi.fetchAsset(farmId, unitId);
	return adaptAssetToProductionUnit(asset);
}

export async function createProductionUnit(unit: {
	name: string;
	categoryLabel?: string;
	kind?: backendApi.AssetKind;
	mode: "aggregate" | "individual";
	location?: string;
	tags?: string[];
}): Promise<ProductionUnit> {
	const farmId = getCurrentFarmId();
	const asset = await backendApi.createAsset(farmId, {
		name: unit.name,
		kind: unit.kind ?? "animal",
		mode: unit.mode === "aggregate" ? "aggregated" : unit.mode,
		location: unit.location,
		tags: unit.tags,
	});
	return adaptAssetToProductionUnit(asset);
}

export async function updateProductionUnit(
	unitId: string,
	updates: Partial<ProductionUnit>,
): Promise<ProductionUnit> {
	const farmId = getCurrentFarmId();
	const asset = await backendApi.updateAsset(farmId, unitId, {
		name: updates.name,
		status: updates.status === "inactive" ? "archived" : updates.status,
		location: updates.location,
		tags: updates.tags,
	});
	return adaptAssetToProductionUnit(asset);
}

export async function deleteProductionUnit(unitId: string): Promise<void> {
	const farmId = getCurrentFarmId();
	await backendApi.deleteAsset(farmId, unitId);
}

// ============= Individuals =============

export async function listIndividuals(
	unitId: string,
	options?: {
		page?: number;
		pageSize?: number;
		q?: string;
	},
): Promise<{
	items: Individual[];
	total: number;
	page: number;
	pageSize: number;
}> {
	const farmId = getCurrentFarmId();
	const result = await backendApi.fetchIndividuals(farmId, unitId, options);

	return {
		items: result.items.map(adaptIndividualToFrontend),
		total: result.total,
		page: result.page,
		pageSize: result.page_size,
	};
}

export async function getIndividual(
	unitId: string,
	individualId: string,
): Promise<Individual> {
	const farmId = getCurrentFarmId();
	const individual = await backendApi.fetchIndividual(
		farmId,
		unitId,
		individualId,
	);
	return adaptIndividualToFrontend(individual);
}

export async function createIndividual(
	unitId: string,
	data: {
		name?: string;
		tag: string;
		sex?: "male" | "female" | "unknown";
		birthDate?: string;
		parentId?: string;
		motherId?: string;
		fatherId?: string;
		attributes?: Record<string, string | number | boolean>;
	},
): Promise<Individual> {
	const farmId = getCurrentFarmId();
	const individual = await backendApi.createIndividual(farmId, unitId, {
		name: data.name,
		tag: data.tag,
		sex: data.sex,
		birth_date: data.birthDate,
		parent_id: data.parentId,
		mother_id: data.motherId,
		father_id: data.fatherId,
		attributes: data.attributes,
	});
	return adaptIndividualToFrontend(individual);
}

export async function updateIndividual(
	unitId: string,
	individualId: string,
	data: Partial<{
		name: string;
		tag: string;
		sex: "male" | "female" | "unknown";
		status: "active" | "sold" | "deceased";
		motherId: string;
		fatherId: string;
		attributes: Record<string, string | number | boolean>;
	}>,
): Promise<Individual> {
	const farmId = getCurrentFarmId();
	const individual = await backendApi.updateIndividual(
		farmId,
		unitId,
		individualId,
		{
			name: data.name,
			tag: data.tag,
			sex: data.sex,
			status: data.status,
			mother_id: data.motherId,
			father_id: data.fatherId,
			attributes: data.attributes,
		},
	);
	return adaptIndividualToFrontend(individual);
}

export async function deleteIndividual(
	unitId: string,
	individualId: string,
): Promise<void> {
	const farmId = getCurrentFarmId();
	await backendApi.deleteIndividual(farmId, unitId, individualId);
}

// ============= Dashboard & Summary Views =============

/** TODO: Wire real dashboard data when report endpoints are available */
export function getDashboardSnapshot(): DashboardSnapshot {
	throw new Error(
		"Dashboard snapshot not yet implemented. Waiting for report endpoints.",
	);
}

/** TODO: Wire real finance data when report endpoints are available */
export function getFinanceSummary(): FinanceSummary {
	throw new Error(
		"Finance summary not yet implemented. Waiting for report endpoints.",
	);
}

/** TODO: Wire real feed data when report endpoints are available */
export function getFeedSummary(): FeedSummary {
	throw new Error(
		"Feed summary not yet implemented. Waiting for report endpoints.",
	);
}

// ============= Events & Categories =============

/** TODO: Wire event creation when endpoints are fully exposed */
export async function createEvent(
	_payload: EventCreatePayload,
): Promise<FarmEvent> {
	throw new Error(
		"Event creation not yet implemented. Waiting for event endpoints.",
	);
}

export async function listEvents(_params?: {
	unitId?: string;
	individualId?: string;
	type?: FarmEvent["type"];
	status?: FarmEvent["status"];
}): Promise<FarmEvent[]> {
	throw new Error(
		"Event listing not yet implemented. Waiting for event endpoints.",
	);
}

export async function listCategories(): Promise<any[]> {
	const farmId = getCurrentFarmId();
	try {
		return await backendApi.fetchEventCategories(farmId);
	} catch (error) {
		console.warn("Event categories endpoint not available yet", error);
		return [];
	}
}
