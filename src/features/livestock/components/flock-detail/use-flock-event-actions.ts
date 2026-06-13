import { useCallback, useState } from "react";

import {
	useCreateEventByAssetId,
	useCreateEventCategoryByFarmId,
	useDeleteEventByAssetId,
	useUpdateEventByAssetId,
} from "@/features/livestock/api/livestock-queries";
import type {
	ILivestockAsset,
	ILivestockEvent,
	LivestockEventType,
} from "@/features/livestock/types/livestock-types";

import type { UnitEventFormData } from "../unit-event-form";
import { isActionOwnedEvent } from "./flock-detail-types";
import {
	toCreateEventPayload,
	toEventFormInitialValues,
	toUpdateEventPayload,
} from "./flock-event-payloads";

interface UseFlockEventActionsParams {
	farmId: string;
	unitId: string;
	asset: ILivestockAsset;
}

export function useFlockEventActions({
	farmId,
	unitId,
	asset,
}: UseFlockEventActionsParams) {
	const [isCreatingEvent, setIsCreatingEvent] = useState(false);
	const [isSavingEvent, setIsSavingEvent] = useState(false);
	const [editingEvent, setEditingEvent] = useState<ILivestockEvent | null>(
		null,
	);
	const [deletingEventId, setDeletingEventId] = useState<number | null>(null);

	const createEventMutation = useCreateEventByAssetId();
	const updateEventMutation = useUpdateEventByAssetId();
	const deleteEventMutation = useDeleteEventByAssetId();
	const createEventCategoryMutation = useCreateEventCategoryByFarmId();

	const handleStartEditEvent = useCallback((event: ILivestockEvent) => {
		if (isActionOwnedEvent(event)) {
			alert(
				"Este evento fue generado por una accion del sistema. Edita la accion original para mantener consistencia.",
			);
			return;
		}
		setEditingEvent(event);
		setIsCreatingEvent(true);
	}, []);

	const handleDeleteEvent = useCallback(
		async (event: ILivestockEvent) => {
			if (isActionOwnedEvent(event)) {
				alert(
					"Este evento fue generado por una accion del sistema. Eliminalo desde la accion original para evitar desbalances.",
				);
				return;
			}
			if (!confirm("Eliminar este evento?")) return;

			setDeletingEventId(event.id);
			try {
				await deleteEventMutation.mutateAsync({
					farmId,
					assetId: unitId,
					eventId: event.id,
				});
				if (editingEvent?.id === event.id) {
					setEditingEvent(null);
					setIsCreatingEvent(false);
				}
			} finally {
				setDeletingEventId(null);
			}
		},
		[farmId, unitId, editingEvent, deleteEventMutation],
	);

	const handleSubmitEvent = useCallback(
		async (data: UnitEventFormData) => {
			if (data.type === "reproductive" && data.individualId == null) return;
			setIsSavingEvent(true);
			try {
				if (!editingEvent) {
					await createEventMutation.mutateAsync({
						farmId,
						assetId: unitId,
						data: toCreateEventPayload(data),
					});
					setIsCreatingEvent(false);
					return;
				}
				if (isActionOwnedEvent(editingEvent)) {
					alert(
						"Este evento fue generado por una accion del sistema. Edita la accion original para mantener consistencia.",
					);
					setEditingEvent(null);
					setIsCreatingEvent(false);
					return;
				}
				await updateEventMutation.mutateAsync({
					farmId,
					assetId: unitId,
					eventId: editingEvent.id,
					data: toUpdateEventPayload(asset, editingEvent, data),
				});
				setEditingEvent(null);
				setIsCreatingEvent(false);
			} finally {
				setIsSavingEvent(false);
			}
		},
		[
			asset,
			editingEvent,
			farmId,
			unitId,
			createEventMutation,
			updateEventMutation,
		],
	);

	const handleCreateEventCategory = useCallback(
		async ({
			type,
			name,
			color,
		}: {
			type: LivestockEventType;
			name: string;
			color?: string;
		}) => {
			const createdCategory = await createEventCategoryMutation.mutateAsync({
				farmId,
				data: { type, name, color },
			});
			return createdCategory.id;
		},
		[farmId, createEventCategoryMutation],
	);

	return {
		isCreatingEvent,
		isSavingEvent,
		editingEvent,
		deletingEventId,
		setIsCreatingEvent,
		setEditingEvent,
		handleStartEditEvent,
		handleDeleteEvent,
		handleSubmitEvent,
		handleCreateEventCategory,
		initialValues: editingEvent
			? toEventFormInitialValues(editingEvent)
			: undefined,
	};
}
