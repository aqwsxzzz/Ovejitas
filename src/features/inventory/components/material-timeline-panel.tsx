import { useState } from "react";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";

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

interface MaterialTimelinePanelProps {
	farmId: string;
	materialId: string;
}

const EVENT_TYPE_FILTERS: Array<"all" | LivestockEventType> = [
	"all",
	"inventory",
	"expense",
	"income",
	"production",
	"observation",
	"reproductive",
	"acquisition",
	"mortality",
];

export function MaterialTimelinePanel({
	farmId,
	materialId,
}: MaterialTimelinePanelProps) {
	const [timelinePage, setTimelinePage] = useState(1);
	const [timelineTypeFilter, setTimelineTypeFilter] = useState<
		"all" | LivestockEventType
	>("all");

	const timelineQuery = useListEventsByAssetId({
		farmId,
		assetId: materialId,
		filters: {
			sort: "-occurred_at",
			type: timelineTypeFilter === "all" ? undefined : timelineTypeFilter,
			page: timelinePage,
			pageSize: MATERIAL_PAGE_SIZE,
		},
		enabled: !!farmId,
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Movements Timeline</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="mb-3 grid gap-3 md:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="timeline-type">Event type</Label>
						<Select
							value={timelineTypeFilter}
							onValueChange={(value) => {
								setTimelineTypeFilter(value as "all" | LivestockEventType);
								setTimelinePage(1);
							}}
						>
							<SelectTrigger
								id="timeline-type"
								className="w-full"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{EVENT_TYPE_FILTERS.map((type) => (
									<SelectItem
										key={type}
										value={type}
									>
										{type}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				{timelineQuery.isLoading ? (
					<LoadingState message="Cargando movimientos..." />
				) : null}
				{timelineQuery.error ? (
					<ErrorState
						description="No se pudieron cargar los movimientos."
						onRetry={() => void timelineQuery.refetch()}
					/>
				) : null}
				{!timelineQuery.isLoading &&
				!timelineQuery.error &&
				(timelineQuery.data?.data ?? []).length === 0 ? (
					<EmptyState title="Sin movimientos aún" />
				) : null}
				<div className="space-y-2">
					{(timelineQuery.data?.data ?? []).map((event) => (
						<div
							key={event.id}
							className="rounded-lg border px-3 py-2 text-sm"
						>
							<p className="font-medium">{event.type}</p>
							<p className="text-(--v2-ink-soft)">
								{formatDate(event.occurred_at)}
							</p>
							{getPayloadSource(event.payload) ? (
								<p className="text-xs text-(--v2-ink-soft)">
									source: {getPayloadSource(event.payload)}
								</p>
							) : null}
						</div>
					))}
				</div>
				<MaterialPaginationControls
					page={timelinePage}
					hasNext={timelineQuery.data?.meta.has_next ?? false}
					onPrevious={() =>
						setTimelinePage((current) => Math.max(1, current - 1))
					}
					onNext={() => setTimelinePage((current) => current + 1)}
				/>
			</CardContent>
		</Card>
	);
}
