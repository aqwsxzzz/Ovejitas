import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { toNumber } from "@/features/inventory/components/material-detail-utils";
import type { IAggregateRow } from "@/features/reports/types/reports-types";

interface CropProductionSnapshotProps {
	rows: IAggregateRow[];
	isLoading: boolean;
	isError: boolean;
}

export function CropProductionSnapshot({
	rows,
	isLoading,
	isError,
}: CropProductionSnapshotProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Produccion (este mes)</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{isLoading ? <LoadingState message="Cargando produccion..." /> : null}
				{isError ? (
					<p className="text-sm text-destructive">
						Error al cargar el reporte de produccion.
					</p>
				) : null}
				{!isLoading && !isError && rows.length === 0 ? (
					<EmptyState title="Sin cosechas registradas aún" />
				) : null}
				<div className="space-y-2">
					{rows.map((row) => (
						<div
							key={`${row.bucket}-${row.unit ?? "unit"}`}
							className="flex items-center justify-between rounded-lg border px-3 py-2"
						>
							<span className="text-sm text-(--v2-ink-soft)">
								{new Date(row.bucket).toLocaleDateString("es", {
									month: "short",
									year: "numeric",
								})}
							</span>
							<span className="text-sm font-semibold">
								{toNumber(row.value).toFixed(2)} {row.unit ?? ""}
							</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
