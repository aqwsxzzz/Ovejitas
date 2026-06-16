import { useState } from "react";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useListEventsByAssetId,
	useListEventCategoriesByFarmId,
} from "@/features/livestock/api/livestock-queries";
import type { LivestockEventType } from "@/features/livestock/types/livestock-types";
import {
	formatDate,
	getPayloadSource,
} from "@/features/inventory/components/material-detail-utils";
import { EquipmentEventForm } from "@/features/equipment/components/equipment-event-form";
import { useEquipmentActions } from "@/features/equipment/hooks/use-equipment-actions";

interface EquipmentTimelinePanelProps {
	farmId: string;
	equipmentId: string;
}

type EventFilter = "all" | LivestockEventType;

const EVENT_TYPE_FILTERS: EventFilter[] = [
	"all",
	"expense",
	"income",
	"observation",
];

const EVENT_TYPE_LABELS: Record<string, string> = {
	all: "Todos",
	expense: "Gasto",
	income: "Ingreso",
	observation: "Observación",
	production: "Producción",
	acquisition: "Adquisición",
	mortality: "Mortalidad",
	inventory: "Inventario",
	reproductive: "Reproductivo",
};

const PAGE_SIZE = 20;

export function EquipmentTimelinePanel({
	farmId,
	equipmentId,
}: EquipmentTimelinePanelProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [page, setPage] = useState(1);
	const [typeFilter, setTypeFilter] = useState<EventFilter>("all");

	const timelineQuery = useListEventsByAssetId({
		farmId,
		assetId: equipmentId,
		filters: {
			sort: "-occurred_at",
			type: typeFilter === "all" ? undefined : typeFilter,
			page,
			pageSize: PAGE_SIZE,
		},
		enabled: !!farmId,
	});

	const categoriesQuery = useListEventCategoriesByFarmId({
		farmId,
		filters: { archived: false, page: 1, pageSize: 100 },
		enabled: !!farmId,
	});

	const actions = useEquipmentActions(farmId, equipmentId);

	const events = timelineQuery.data?.data ?? [];
	const hasNext = timelineQuery.data?.meta.has_next ?? false;

	const handleToggleCreate = () => {
		setIsCreating((prev) => !prev);
	};

	const handleEventSubmit: typeof actions.handleEventSubmit = async (data) => {
		await actions.handleEventSubmit(data);
		if (!actions.error) {
			setIsCreating(false);
		}
	};

	return (
		<div className="v2-card p-4">
			<div className="mb-3 flex items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<p className="v2-kicker">Historial de eventos</p>
					{events.length > 0 || typeFilter !== "all" ? (
						<Select
							value={typeFilter}
							onValueChange={(v) => {
								setTypeFilter(v as EventFilter);
								setPage(1);
							}}
						>
							<SelectTrigger className="h-7 rounded-full border-(--v2-border) bg-white px-3 text-xs font-medium">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{EVENT_TYPE_FILTERS.map((type) => (
									<SelectItem
										key={type}
										value={type}
									>
										{EVENT_TYPE_LABELS[type] ?? type}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : null}
				</div>

				<Button
					type="button"
					variant={isCreating ? "outline" : "default"}
					size="sm"
					onClick={handleToggleCreate}
					aria-label={isCreating ? "Cerrar" : "Nuevo evento"}
				>
					{isCreating ? (
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
				</Button>
			</div>

			{isCreating ? (
				<div className="mb-4 rounded-xl border border-(--v2-border) bg-white p-3">
					<EquipmentEventForm
						categories={categoriesQuery.data ?? []}
						isSubmitting={actions.isSubmitting}
						errorMessage={actions.error}
						onSubmit={handleEventSubmit}
					/>
				</div>
			) : null}

			{timelineQuery.isLoading ? (
				<LoadingState message="Cargando eventos..." />
			) : null}
			{timelineQuery.error ? (
				<p className="text-sm text-destructive">
					No se pudieron cargar los eventos.
				</p>
			) : null}
			{!timelineQuery.isLoading &&
			!timelineQuery.error &&
			events.length === 0 ? (
				<EmptyState title="Sin eventos registrados" />
			) : null}

			<div className="space-y-2">
				{events.map((event) => (
					<div
						key={event.id}
						className="rounded-lg border px-3 py-2 text-sm"
					>
						<p className="font-medium">
							{EVENT_TYPE_LABELS[event.type] ?? event.type}
						</p>
						<p className="text-(--v2-ink-soft)">
							{formatDate(event.occurred_at)}
						</p>
						{getPayloadSource(event.payload) ? (
							<p className="text-xs text-(--v2-ink-soft)">
								fuente: {getPayloadSource(event.payload)}
							</p>
						) : null}
					</div>
				))}
			</div>

			{events.length > 0 ? (
				<div className="mt-3 flex items-center justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page <= 1}
					>
						Anterior
					</Button>
					<p className="text-xs text-(--v2-ink-soft)">Página {page}</p>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setPage((p) => p + 1)}
						disabled={!hasNext}
					>
						Siguiente
					</Button>
				</div>
			) : null}
		</div>
	);
}
