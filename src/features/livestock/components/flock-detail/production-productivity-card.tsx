import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	PeriodSelect,
	useReportPeriod,
} from "@/features/reports/components/report-period-select";
import { useGetProductionProductivityReport } from "@/features/reports/api/reports-queries";
import {
	formatProductionQuantity,
	formatProductivityPct,
} from "@/features/reports/utils/reports-format";
import type { IProductionProductivityRow } from "@/features/reports/types/reports-types";

interface ProductionProductivityCardProps {
	farmId: string;
	assetId: number;
	/** Initial window size in days for the productivity calculation. */
	windowDays?: number;
}

// Bar fill is capped at 100% even when output beats the target, so a lot at
// 120% still reads as "full" rather than overflowing its track.
function ProductivityRow({ row }: { row: IProductionProductivityRow }): React.ReactElement {
	const fill = Math.min(
		100,
		Math.max(0, Number.parseFloat(row.productivity_pct ?? "") || 0),
	);

	return (
		<div className="space-y-1.5">
			<div className="flex items-baseline justify-between gap-2">
				<span className="min-w-0 truncate font-medium">{row.product_name}</span>
				<span className="shrink-0 text-base font-semibold tabular-nums">
					{formatProductivityPct(row.productivity_pct)}
				</span>
			</div>

			{row.missing_capacity ? (
				<p className="text-sm text-(--v2-ink-soft)">
					Define la meta para calcular la productividad.
				</p>
			) : (
				<>
					<div className="h-1.5 overflow-hidden rounded-full bg-muted">
						<div
							className="h-full rounded-full bg-success"
							style={{ width: `${Math.max(2, fill)}%` }}
						/>
					</div>
					<p className="text-xs text-(--v2-ink-soft)">
						<span className="whitespace-nowrap tabular-nums">
							{formatProductionQuantity(row.produced, row.unit)} producidos
						</span>{" "}
						/{" "}
						<span className="whitespace-nowrap tabular-nums">
							{formatProductionQuantity(row.expected, row.unit)} esperados
						</span>
					</p>
				</>
			)}
		</div>
	);
}

// Expected output is time-weighted, so a shorter window scales it down
// proportionally — the report accepts any date range, not just 30 days.
export function ProductionProductivityCard({
	farmId,
	assetId,
	windowDays = 30,
}: ProductionProductivityCardProps) {
	const { selectedDays, setSelectedDays, date_from, date_to } =
		useReportPeriod(windowDays);

	const { data, isPending } = useGetProductionProductivityReport({
		farmId,
		date_from,
		date_to,
	});

	// The report is farm-wide (one row per asset × product); keep this asset's rows.
	const rows = useMemo(
		() => data?.data.filter((entry) => entry.asset_id === assetId) ?? [],
		[data, assetId],
	);

	// Nothing produced and no target configured for this lot — stay out of the way.
	if (!isPending && rows.length === 0) return null;

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
				<CardTitle className="text-base">Productividad</CardTitle>
				<PeriodSelect value={selectedDays} onValueChange={setSelectedDays} />
			</CardHeader>
			<CardContent className="space-y-4">
				{isPending ? (
					<p className="text-sm text-(--v2-ink-soft)">Cargando...</p>
				) : (
					rows.map((row) => (
						<ProductivityRow
							key={`${row.category_id}-${row.unit ?? ""}`}
							row={row}
						/>
					))
				)}
			</CardContent>
		</Card>
	);
}
