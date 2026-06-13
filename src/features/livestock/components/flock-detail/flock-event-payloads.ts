import type {
	ILivestockAsset,
	ILivestockEvent,
	LivestockEventStatus,
} from "@/features/livestock/types/livestock-types";

import type { UnitEventFormData } from "../unit-event-form";

export function toCreateEventPayload(data: UnitEventFormData) {
	if (data.type === "production") {
		return {
			type: "production" as const,
			occurred_at: data.occurredAt,
			quantity: data.quantity ?? 0,
			unit: data.unit ?? "unit",
			category_id: data.categoryId,
			individual_id: data.individualId,
			notes: data.notes,
			payload: { status: data.status },
		};
	}
	if (data.type === "expense" || data.type === "income") {
		return {
			type: data.type,
			occurred_at: data.occurredAt,
			amount: data.amount ?? 0,
			category_id: data.categoryId,
			individual_id: data.individualId,
			notes: data.notes,
			payload: { status: data.status },
		};
	}
	if (data.type === "observation") {
		return {
			type: "observation" as const,
			occurred_at: data.occurredAt,
			category_id: data.categoryId,
			individual_id: data.individualId,
			quantity: data.quantity,
			unit: data.unit,
			notes: data.notes,
			payload: { status: data.status },
		};
	}
	if (data.type === "inventory") {
		return {
			type: "inventory" as const,
			occurred_at: data.occurredAt,
			adjustment: data.adjustment ?? "increment",
			quantity: data.quantity ?? 0,
			unit: data.unit ?? "unit",
			category_id: data.categoryId,
			individual_id: data.individualId,
			notes: data.notes,
			payload: { status: data.status },
		};
	}
	return {
		type: "reproductive" as const,
		occurred_at: data.occurredAt,
		individual_id: data.individualId!,
		category_id: data.categoryId,
		notes: data.notes,
		payload: { status: data.status },
	};
}

export function toUpdateEventPayload(
	asset: ILivestockAsset,
	editingEvent: ILivestockEvent,
	data: UnitEventFormData,
) {
	const nextIndividualId =
		asset.mode === "individual" ? (data.individualId ?? null) : null;
	return {
		occurred_at: data.occurredAt,
		individual_id: nextIndividualId,
		category_id: data.categoryId ?? null,
		notes: data.notes ?? null,
		payload: { ...editingEvent.payload, status: data.status },
		quantity:
			editingEvent.type === "production" ||
			editingEvent.type === "observation" ||
			editingEvent.type === "acquisition" ||
			editingEvent.type === "mortality" ||
			editingEvent.type === "inventory"
				? (data.quantity ?? null)
				: null,
		unit:
			editingEvent.type === "production" ||
			editingEvent.type === "observation" ||
			editingEvent.type === "acquisition" ||
			editingEvent.type === "inventory"
				? (data.unit ?? null)
				: null,
		amount:
			editingEvent.type === "income" ||
			editingEvent.type === "expense" ||
			editingEvent.type === "acquisition"
				? (data.amount ?? null)
				: null,
		adjustment:
			editingEvent.type === "inventory" ? (data.adjustment ?? null) : null,
	};
}

export function toEventFormInitialValues(editingEvent: ILivestockEvent) {
	const status: LivestockEventStatus =
		typeof editingEvent.payload.status === "string" &&
		editingEvent.payload.status === "planned"
			? "planned"
			: "logged";

	return {
		type: editingEvent.type,
		categoryId: editingEvent.category_id ?? undefined,
		status,
		occurredAt: editingEvent.occurred_at,
		individualId: editingEvent.individual_id ?? undefined,
		quantity:
			editingEvent.quantity != null ? Number(editingEvent.quantity) : undefined,
		unit: editingEvent.unit ?? undefined,
		amount:
			editingEvent.amount != null ? Number(editingEvent.amount) : undefined,
		adjustment: editingEvent.adjustment ?? undefined,
		notes: editingEvent.notes ?? undefined,
	};
}
