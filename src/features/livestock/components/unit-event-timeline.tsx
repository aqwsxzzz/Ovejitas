import type {
	ILivestockEvent,
	ILivestockEventCategory,
} from "@/features/livestock/types/livestock-types";

interface UnitEventTimelineProps {
	events: ILivestockEvent[];
	categories: ILivestockEventCategory[];
	onEditEvent?: (event: ILivestockEvent) => void;
	onDeleteEvent?: (event: ILivestockEvent) => Promise<void>;
	deletingEventId?: number | null;
	editingEventId?: number | null;
}

function canEditEvent(event: ILivestockEvent): boolean {
	return event.type !== "reproductive";
}

function eventTypeLabel(type: ILivestockEvent["type"]): string {
	switch (type) {
		case "production":
			return "Produccion";
		case "income":
			return "Ingreso";
		case "expense":
			return "Gasto";
		case "observation":
			return "Observacion";
		case "reproductive":
			return "Reproductivo";
		case "acquisition":
			return "Adquisicion";
		case "mortality":
			return "Mortalidad";
		default:
			return type;
	}
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
			<p className="text-sm text-[color:var(--v2-ink-soft)]">
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
						className="rounded-xl border border-[color:var(--v2-border)] bg-white px-3 py-2"
					>
						<div className="flex items-center justify-between gap-2">
							<p className="text-sm font-semibold leading-tight">
								{categoryLabel(categories, event.category_id)}
							</p>
							<span className="text-xs text-[color:var(--v2-ink-soft)]">
								{formatEventDate(event.occurred_at)}
							</span>
						</div>
						<div className="mt-1 flex items-center gap-2 text-xs text-[color:var(--v2-ink-soft)]">
							<span className="rounded-full border border-[color:var(--v2-border)] px-2 py-0.5">
								{eventTypeLabel(event.type)}
							</span>
							<span
								className={`rounded-full px-2 py-0.5 ${
									status === "logged"
										? "bg-emerald-100 text-emerald-700"
										: "bg-amber-100 text-amber-700"
								}`}
							>
								{status === "logged" ? "Registrado" : "Planificado"}
							</span>
							{event.quantity != null ? (
								<span>Cantidad: {Number(event.quantity)}</span>
							) : null}
							{event.amount != null ? (
								<span>
									Monto: ${Number(event.amount)} {event.currency ?? ""}
								</span>
							) : null}
						</div>
						{event.notes ? (
							<p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">
								{event.notes}
							</p>
						) : null}
						{onEditEvent || onDeleteEvent ? (
							<div className="mt-3 flex items-center gap-2">
								{onEditEvent && canEditEvent(event) ? (
									<button
										type="button"
										onClick={() => onEditEvent(event)}
										className="rounded-full border border-[color:var(--v2-border)] px-3 py-1 text-xs font-semibold"
									>
										{isEditing ? "Editando" : "Editar"}
									</button>
								) : null}
								{onDeleteEvent ? (
									<button
										type="button"
										onClick={() => void onDeleteEvent(event)}
										disabled={isDeleting}
										className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 disabled:opacity-60"
									>
										{isDeleting ? "Eliminando..." : "Eliminar"}
									</button>
								) : null}
							</div>
						) : null}
					</article>
				);
			})}
		</div>
	);
}
