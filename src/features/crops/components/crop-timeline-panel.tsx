import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useListEventsByAssetId } from "@/features/livestock/api/livestock-queries";
import type { LivestockEventType } from "@/features/livestock/types/livestock-types";
import { MaterialPaginationControls } from "@/features/inventory/components/material-pagination-controls";
import {
	formatDate,
	getPayloadSource,
	MATERIAL_PAGE_SIZE,
} from "@/features/inventory/components/material-detail-utils";

interface CropTimelinePanelProps {
	farmId: string;
	cropId: string;
}

const EVENT_TYPE_FILTERS: Array<"all" | LivestockEventType> = [
	"all",
	"production",
	"expense",
	"income",
	"observation",
];

const EVENT_TYPE_LABELS: Record<"all" | LivestockEventType, string> = {
	all: "Todos",
	production: "Producción",
	expense: "Gasto",
	income: "Ingreso",
	observation: "Observación",
	reproductive: "Reproductivo",
	acquisition: "Adquisición",
	mortality: "Mortalidad",
	inventory: "Inventario",
};

export function CropTimelinePanel({ farmId, cropId }: CropTimelinePanelProps) {
	const [page, setPage] = useState(1);
	const [typeFilter, setTypeFilter] = useState<"all" | LivestockEventType>(
		"all",
	);

	const eventsQuery = useListEventsByAssetId({
		farmId,
		assetId: cropId,
		filters: {
			sort: "-occurred_at",
			type: typeFilter === "all" ? undefined : typeFilter,
			page,
			pageSize: MATERIAL_PAGE_SIZE,
		},
		enabled: !!farmId,
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Timeline de eventos</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="mb-3">
					<div className="space-y-1.5">
						<Label htmlFor="crop-timeline-type">Tipo de evento</Label>
						<Select
							value={typeFilter}
							onValueChange={(value) => {
								setTypeFilter(value as "all" | LivestockEventType);
								setPage(1);
							}}
						>
							<SelectTrigger
								id="crop-timeline-type"
								className="w-full max-w-48"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{EVENT_TYPE_FILTERS.map((type) => (
									<SelectItem
										key={type}
										value={type}
									>
										{EVENT_TYPE_LABELS[type]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{eventsQuery.isLoading ? (
					<p className="text-sm text-(--v2-ink-soft)">Cargando eventos...</p>
				) : null}
				{eventsQuery.error ? (
					<p className="text-sm text-destructive">Error al cargar eventos.</p>
				) : null}
				{!eventsQuery.isLoading &&
				!eventsQuery.error &&
				(eventsQuery.data?.data ?? []).length === 0 ? (
					<p className="text-sm text-(--v2-ink-soft)">
						No hay eventos registrados.
					</p>
				) : null}

				<div className="space-y-2">
					{(eventsQuery.data?.data ?? []).map((event) => (
						<div
							key={event.id}
							className="rounded-lg border px-3 py-2 text-sm"
						>
							<div className="flex items-center justify-between gap-2">
								<span className="font-medium">{EVENT_TYPE_LABELS[event.type] ?? event.type}</span>
								<span className="text-xs text-(--v2-ink-soft)">
									{formatDate(event.occurred_at)}
								</span>
							</div>
							{event.quantity && event.unit ? (
								<p className="mt-0.5 text-(--v2-ink-soft)">
									{event.quantity} {event.unit}
								</p>
							) : null}
							{event.amount && event.currency ? (
								<p className="mt-0.5 text-(--v2-ink-soft)">
									{event.amount} {event.currency}
								</p>
							) : null}
							{event.notes ? (
								<p className="mt-0.5 text-xs text-(--v2-ink-soft)">
									{event.notes}
								</p>
							) : null}
							{getPayloadSource(event.payload) ? (
								<p className="mt-0.5 text-xs text-(--v2-ink-soft)">
									fuente: {getPayloadSource(event.payload)}
								</p>
							) : null}
						</div>
					))}
				</div>

				<MaterialPaginationControls
					page={page}
					hasNext={eventsQuery.data?.meta.has_next ?? false}
					onPrevious={() => setPage((current) => Math.max(1, current - 1))}
					onNext={() => setPage((current) => current + 1)}
				/>
			</CardContent>
		</Card>
	);
}
