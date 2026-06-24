import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetCoopProductivityReport } from "@/features/reports/api/reports-queries";

interface CoopProductivityCardProps {
	farmId: string;
	assetId: number;
	/** Window size in days for the productivity calculation. */
	windowDays?: number;
}

const formatPct = (value: string | null): string => {
	if (value == null) return "—";
	const parsed = parseFloat(value);
	return Number.isFinite(parsed) ? `${parsed.toFixed(1)}%` : "—";
};

export function CoopProductivityCard({
	farmId,
	assetId,
	windowDays = 30,
}: CoopProductivityCardProps) {
	const { date_from, date_to } = useMemo(() => {
		const now = new Date();
		const from = new Date(now);
		from.setDate(from.getDate() - windowDays);
		return { date_from: from.toISOString(), date_to: now.toISOString() };
	}, [windowDays]);

	const { data, isPending } = useGetCoopProductivityReport({
		farmId,
		date_from,
		date_to,
	});

	// The report is farm-wide (one row per coop, no per-asset filter); pick
	// this coop's row from the returned set.
	const row = data?.data.find((entry) => entry.asset_id === assetId);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">
					Productividad (últimos {windowDays} días)
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isPending ? (
					<p className="text-sm text-(--v2-ink-soft)">Cargando...</p>
				) : !row ? (
					<p className="text-sm text-(--v2-ink-soft)">
						Sin producción de huevos en el periodo.
					</p>
				) : row.missing_capacity ? (
					<p className="text-sm text-(--v2-ink-soft)">
						Define la postura esperada y registra el lote para calcular la
						productividad.
					</p>
				) : (
					<div className="flex items-baseline gap-3">
						<span className="text-2xl font-semibold">
							{formatPct(row.productivity_pct)}
						</span>
						<span className="text-sm text-(--v2-ink-soft)">
							{row.produced} producidos / {row.expected ?? "—"} esperados
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
