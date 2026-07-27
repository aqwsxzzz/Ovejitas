import { useMemo } from "react";
import { Loader2 } from "lucide-react";

import { SectionCard } from "@/components/common/section-card";
import { EmptyState } from "@/components/common/empty-state";
import {
	PeriodSelect,
	useReportPeriod,
} from "@/features/reports/components/report-period-select";
import { useGetProduceOutcomeReport } from "@/features/reports/api/reports-queries";
import { formatCurrency } from "@/features/reports/utils/reports-format";

interface ProduceOutcomePanelProps {
	farmId: string;
	assetId: number;
}

/** Per-product outcome for this producer: how much it made, sold, lost, and earned. */
export function ProduceOutcomePanel({ farmId, assetId }: ProduceOutcomePanelProps) {
	const { selectedDays, setSelectedDays, date_from, date_to } =
		useReportPeriod(30);

	const { data: report, isPending } = useGetProduceOutcomeReport({
		farmId,
		asset_id: assetId,
		date_from: date_from.slice(0, 10),
		date_to: date_to.slice(0, 10),
	});

	const rows = useMemo(
		() =>
			(report?.data ?? []).filter((row) => row.producer_asset_id === assetId),
		[report, assetId],
	);

	return (
		<SectionCard
			title="Resultado de producción"
			description="Lo que este activo produjo, vendió, perdió y ganó por producto."
			action={
				<PeriodSelect value={selectedDays} onValueChange={setSelectedDays} />
			}
		>
			{isPending ? (
				<Loader2 className="mt-2 h-6 w-6 animate-spin" />
			) : rows.length === 0 ? (
				<EmptyState title="Sin producción vendida en el periodo" />
			) : (
				<div className="space-y-2">
					{rows.map((row) => (
						<div
							key={`${row.produce_asset_id}-${row.currency ?? "x"}`}
							className="rounded-lg border border-(--v2-border) bg-(--v2-surface) px-3 py-2 text-sm"
						>
							<div className="flex items-start justify-between gap-2">
								<p className="font-medium">{row.produce_name}</p>
								<p className="font-semibold text-success tabular-nums">
									{formatCurrency(row.income_total, row.currency)}
								</p>
							</div>
							<p className="mt-1 text-xs text-(--v2-ink-soft)">
								Producido {Number(row.produced).toFixed(2)} · Vendido{" "}
								{Number(row.sold).toFixed(2)} · Perdido{" "}
								{Number(row.lost).toFixed(2)} {row.unit}
							</p>
							{row.has_other_currency ? (
								<p className="mt-1 text-xs text-(--v2-ink-soft)">
									Hay ventas en otra moneda no incluidas aquí.
								</p>
							) : null}
						</div>
					))}
				</div>
			)}
		</SectionCard>
	);
}
