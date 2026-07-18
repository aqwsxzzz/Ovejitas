import { useMemo } from "react";
import { Loader2 } from "lucide-react";

import {
	PeriodSelect,
	useReportPeriod,
} from "@/features/reports/components/report-period-select";
import { useGetProfitabilityFullReport } from "@/features/reports/api/reports-queries";

import { CurrencyNetBlock } from "./currency-net-block";
import { buildCurrencyNetEntries } from "./flock-net-entries";

interface FlockNetMetricCardProps {
	farmId: string;
	assetId: number;
	isMaterialAsset: boolean;
}

/**
 * Per-currency net for an asset. Each currency with activity gets its own block —
 * income, direct expense, feed, and feed-inclusive net, all in that currency.
 * Currencies are never summed together.
 */
export function FlockNetMetricCard({
	farmId,
	assetId,
	isMaterialAsset,
}: FlockNetMetricCardProps) {
	const { selectedDays, setSelectedDays, date_from, date_to } =
		useReportPeriod(30);

	const { data: report, isPending } = useGetProfitabilityFullReport({
		farmId,
		asset_id: assetId,
		date_from: date_from.slice(0, 10),
		date_to: date_to.slice(0, 10),
	});

	const entries = useMemo(
		() =>
			buildCurrencyNetEntries(
				(report?.data ?? []).filter((row) => row.asset_id === assetId),
			),
		[report, assetId],
	);

	return (
		<div className="v2-card flex-1 p-3">
			<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
				<p className="text-[10px] uppercase tracking-[0.08em] text-(--v2-ink-soft)">
					{isMaterialAsset ? "Valor neto" : "Neto real"}
				</p>
				<div className="ml-auto shrink-0">
					<PeriodSelect value={selectedDays} onValueChange={setSelectedDays} />
				</div>
			</div>

			{isPending ? (
				<Loader2 className="mt-3 h-6 w-6 animate-spin" />
			) : entries.length === 0 ? (
				<p className="mt-3 text-sm text-(--v2-ink-soft)">
					Sin movimientos financieros en el periodo.
				</p>
			) : (
				<div className="mt-3 space-y-2">
					{entries.map((entry) => (
						<CurrencyNetBlock
							key={entry.currency ?? "sin-moneda"}
							entry={entry}
						/>
					))}
				</div>
			)}

			{!isMaterialAsset ? (
				<p className="mt-2 text-xs text-(--v2-ink-soft)">
					El neto incluye el alimento consumido, valuado en la moneda de compra.
				</p>
			) : null}
		</div>
	);
}
