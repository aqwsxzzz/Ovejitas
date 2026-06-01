import type { ILivestockAsset } from "@/features/livestock/types/livestock-types";
import type { LivestockEventType } from "@/features/livestock/types/livestock-types";

import { Plus } from "lucide-react";

import { UnitEventForm } from "../unit-event-form";
import { UnitEventTimeline } from "../unit-event-timeline";
import { isLivestockEventType } from "./flock-detail-types";
import { useFlockEventActions } from "./use-flock-event-actions";
import { useFlockEventsData } from "./use-flock-events-data";

interface FlockEventsSectionProps {
	farmId: string;
	unitId: string;
	asset: ILivestockAsset;
	eventTypeFilter?: string;
	onEventTypeFilterChange?: (next: LivestockEventType | "all") => void;
}

function resolveType(value: string) {
	if (!isLivestockEventType(value)) return undefined;
	return value;
}

export function FlockEventsSection({
	farmId,
	unitId,
	asset,
	eventTypeFilter,
	onEventTypeFilterChange,
}: FlockEventsSectionProps) {
	const data = useFlockEventsData({ farmId, unitId, asset, eventTypeFilter });
	const actions = useFlockEventActions({ farmId, unitId, asset });
	const isMaterialAsset = asset.kind === "material";

	return (
		<div className="v2-card p-4">
			<div className="mb-3 flex items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<p className="v2-kicker">Eventos del activo</p>
					{data.hasAssetEvents ? (
						<select
							value={data.effectiveSelectedEventType ?? "all"}
							onChange={(event) => {
								const nextValue = event.target.value;
								if (nextValue === "all") {
									onEventTypeFilterChange?.("all");
									return;
								}
								const nextType = resolveType(nextValue);
								if (!nextType) return;
								onEventTypeFilterChange?.(nextType);
							}}
							className="rounded-full border border-(--v2-border) bg-white px-3 py-1 text-xs font-medium text-(--v2-ink)"
							aria-label="Filtrar eventos por tipo"
						>
							{data.eventTypeFilterOptions.map((option) => (
								<option
									key={option.value}
									value={option.value}
								>
									{option.label}
								</option>
							))}
						</select>
					) : null}
				</div>
				{!isMaterialAsset ? (
					<button
						type="button"
						onClick={() => {
							actions.setIsCreatingEvent((previous) => {
								const next = !previous;
								if (!next) actions.setEditingEvent(null);
								return next;
							});
						}}
						className="inline-flex items-center gap-2 rounded-full border border-(--v2-ink) px-3 py-1 text-xs font-semibold"
						aria-label={actions.isCreatingEvent ? "Cerrar" : "Nuevo evento"}
					>
						{actions.isCreatingEvent ? (
							<>
								<span className="hidden md:inline">Cerrar</span>
								<span
									className="md:hidden"
									aria-hidden="true"
								>
									×
								</span>
							</>
						) : (
							<>
								<Plus
									aria-hidden="true"
									className="h-3.5 w-3.5 md:hidden"
								/>
								<span className="hidden md:inline">Nuevo evento</span>
							</>
						)}
					</button>
				) : null}
			</div>

			{actions.isCreatingEvent ? (
				<div className="mb-4 rounded-xl border border-(--v2-border) bg-white p-3">
					<UnitEventForm
						categories={data.eventCategories}
						individuals={data.allIndividuals}
						assetKind={asset.kind}
						assetMode={asset.mode}
						onSubmit={actions.handleSubmitEvent}
						onCancel={() => {
							actions.setIsCreatingEvent(false);
							actions.setEditingEvent(null);
						}}
						isSubmitting={actions.isSavingEvent}
						onCreateEventCategory={actions.handleCreateEventCategory}
						initialValues={actions.initialValues}
						submitLabel={
							actions.editingEvent ? "Actualizar evento" : "Guardar evento"
						}
					/>
				</div>
			) : null}

			<div
				ref={data.eventsScrollContainerRef}
				className="max-h-104 overflow-y-auto pr-1"
			>
				<UnitEventTimeline
					events={data.visibleTimelineEvents}
					categories={data.eventCategories}
					onEditEvent={
						isMaterialAsset ? undefined : actions.handleStartEditEvent
					}
					onDeleteEvent={
						isMaterialAsset ? undefined : actions.handleDeleteEvent
					}
					deletingEventId={actions.deletingEventId}
					editingEventId={actions.editingEvent?.id ?? null}
				/>
				{data.hasNextEventsLogPage ? (
					<div
						ref={data.eventsLoadMoreRef}
						className="h-2"
					/>
				) : null}
			</div>
			{data.isPendingEventsLog ? (
				<p className="mt-2 text-xs text-(--v2-ink-soft)">
					Actualizando eventos...
				</p>
			) : null}
			{data.isFetchingNextEventsLogPage ? (
				<p className="mt-2 text-xs text-(--v2-ink-soft)">
					Cargando mas eventos...
				</p>
			) : null}
		</div>
	);
}
