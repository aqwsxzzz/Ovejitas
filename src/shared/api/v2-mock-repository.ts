import {
	v2CategorySeed,
	v2EventSeed,
	v2FarmSeed,
	v2IndividualSeed,
	v2InventorySeed,
	v2UnitSeed,
} from "@/shared/api/v2-mock-seed";
import {
	selectDashboardSnapshot,
	selectFeedSummary,
	selectFlockDetailSnapshot,
	selectFinanceSummary,
	selectUnitDashboardSlices,
} from "@/shared/api/v2-mock-selectors";
import { selectLivestockGroups } from "@/shared/api/v2-mock-selectors";
import type {
	DashboardSnapshot,
	EventCreatePayload,
	FarmEvent,
	FeedSummary,
	FlockDetailSnapshot,
	FinanceSummary,
	UnitDashboardSlice,
} from "@/shared/types/v2-domain-types";
import type { LivestockGroup } from "@/shared/types/v2-domain-types";

const db = {
	farm: v2FarmSeed,
	units: [...v2UnitSeed],
	individuals: [...v2IndividualSeed],
	categories: [...v2CategorySeed],
	inventory: [...v2InventorySeed],
	events: [...v2EventSeed],
};

function makeEventId(): string {
	return `evt-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function listEvents(params?: {
	unitId?: string;
	individualId?: string;
	type?: FarmEvent["type"];
	status?: FarmEvent["status"];
}): FarmEvent[] {
	return db.events.filter((event) => {
		if (params?.unitId && event.unitId !== params.unitId) return false;
		if (params?.individualId && event.individualId !== params.individualId)
			return false;
		if (params?.type && event.type !== params.type) return false;
		if (params?.status && event.status !== params.status) return false;
		return true;
	});
}

export function createEvent(payload: EventCreatePayload): FarmEvent {
	const created: FarmEvent = {
		id: makeEventId(),
		farmId: payload.farmId,
		unitId: payload.unitId,
		individualId: payload.individualId,
		type: payload.type,
		categoryId: payload.categoryId,
		occurredAt: payload.occurredAt,
		status: payload.status ?? "logged",
		quantity: payload.quantity,
		amount: payload.amount,
		notes: payload.notes,
		metadata: payload.metadata,
	};

	db.events.unshift(created);
	return created;
}

export function getDashboardSnapshot(): DashboardSnapshot {
	return selectDashboardSnapshot({
		farmName: db.farm.name,
		units: db.units,
		events: db.events,
		inventory: db.inventory,
	});
}

export function getFinanceSummary(): FinanceSummary {
	return selectFinanceSummary(db.events);
}

export function getFeedSummary(): FeedSummary {
	return selectFeedSummary(db.inventory);
}

export function listProductionUnits() {
	return [...db.units];
}

export function listCategories() {
	return [...db.categories];
}

export function getUnitDashboardSlices(): UnitDashboardSlice[] {
	return selectUnitDashboardSlices({
		units: db.units,
		individuals: db.individuals,
		events: db.events,
		inventory: db.inventory,
	});
}

export function listLivestockGroups(): LivestockGroup[] {
	return selectLivestockGroups({
		units: db.units,
		individuals: db.individuals,
		events: db.events,
	});
}

export function getFlockDetailSnapshot(
	unitId: string,
): FlockDetailSnapshot | null {
	const unit = db.units.find(
		(candidate) => candidate.id === unitId && candidate.mode === "aggregate",
	);

	if (!unit) return null;

	return selectFlockDetailSnapshot({
		unit,
		events: db.events,
	});
}
