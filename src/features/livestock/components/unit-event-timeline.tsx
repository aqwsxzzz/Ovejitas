import { Button } from "@/components/ui/button";
import {
	getEventTypeLabel,
	type ILivestockEvent,
	type ILivestockEventCategory,
} from "@/features/livestock/types/livestock-types";
import { formatProductionQuantity } from "@/features/reports/utils/reports-format";

interface UnitEventTimelineProps {
	events: ILivestockEvent[];
	categories: ILivestockEventCategory[];
	onEditEvent?: (event: ILivestockEvent) => void;
	onDeleteEvent?: (event: ILivestockEvent) => Promise<void>;
	deletingEventId?: number | null;
	editingEventId?: number | null;
}

function canEditEvent(event: ILivestockEvent): boolean {
	return event.type !== "reproductive" && !isActionOwnedEvent(event);
}

function canDeleteEvent(event: ILivestockEvent): boolean {
	return !isActionOwnedEvent(event);
}

function isActionOwnedEvent(event: ILivestockEvent): boolean {
	return typeof event.payload.source === "string";
}

function categoryLabel(
	categories: ILivestockEventCategory[],
	categoryId: number | null,
): string {
	if (!categoryId) return "Sin categoria";
	return (
		categories.find((category) => category.id === categoryId)?.name ??
		String(categoryId)
	);
}

function formatEventDate(value: string): string {
	return new Date(value).toLocaleString("es-EC", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getEventStatus(event: ILivestockEvent): "logged" | "planned" {
	const candidate = event.payload?.status;
	return candidate === "planned" ? "planned" : "logged";
}

export function UnitEventTimeline({
	events,
	categories,
	onEditEvent,
	onDeleteEvent,
	deletingEventId,
	editingEventId,
}: UnitEventTimelineProps) {
	if (events.length === 0) {
		return (
			<p className="text-sm text-(--v2-ink-soft)">
				No hay eventos registrados para este lote.
			</p>
		);
	}

	return (
		<div className="space-y-2">
			{events.map((event) => {
				const status = getEventStatus(event);
				const isDeleting = deletingEventId === event.id;
				const isEditing = editingEventId === event.id;
				return (
					<article
						key={event.id}
						className="rounded-xl border border-(--v2-border) bg-white px-3 py-2"
					>
						<div className="flex items-center justify-between gap-2">
							<p className="text-sm font-semibold leading-tight">
								{getEventTypeLabel(event.type)}
							</p>
							<span className="text-xs text-(--v2-ink-soft)">
								{formatEventDate(event.occurred_at)}
							</span>
						</div>
						<div className="mt-1 flex items-center gap-2 text-xs text-(--v2-ink-soft)">
							{event.category_id ? (
								<span className="rounded-full border border-(--v2-border) px-2 py-0.5">
									{categoryLabel(categories, event.category_id)}
								</span>
							) : null}
							<span
								className={`rounded-full px-2 py-0.5 ${
									status === "logged"
										? "bg-success/15 text-success"
										: "bg-warning/15 text-warning"
								}`}
							>
								{status === "logged" ? "Registrado" : "Planificado"}
							</span>
							{event.quantity != null ? (
								<span>
									Cantidad:{" "}
									{formatProductionQuantity(event.quantity, event.unit)}
								</span>
							) : null}
							{event.amount != null ? (
								<span>
									Monto: ${Number(event.amount)} {event.currency ?? ""}
								</span>
							) : null}
						</div>
						{event.notes ? (
							<p className="mt-1 text-sm text-(--v2-ink-soft)">{event.notes}</p>
						) : null}
						{onEditEvent || onDeleteEvent ? (
							<div className="mt-3 flex items-center gap-2">
								{onEditEvent && canEditEvent(event) ? (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => onEditEvent(event)}
									>
										{isEditing ? "Editando" : "Editar"}
									</Button>
								) : null}
								{onDeleteEvent && canDeleteEvent(event) ? (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => void onDeleteEvent(event)}
										disabled={isDeleting}
										className="text-destructive hover:bg-destructive/10 hover:text-destructive"
									>
										{isDeleting ? "Eliminando..." : "Eliminar"}
									</Button>
								) : null}
							</div>
						) : null}
					</article>
				);
			})}
		</div>
	);
}
