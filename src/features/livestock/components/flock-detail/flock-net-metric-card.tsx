import { useMemo } from "react";

import { useGetProfitabilityReport } from "@/features/livestock/api/livestock-queries";

import { formatMoney, parseNumeric } from "./flock-detail-utils";
import { FlockMetricCard } from "./flock-metric-card";

interface FlockNetMetricCardProps {
	farmId: string;
	assetId: number;
	isMaterialAsset: boolean;
}

export function FlockNetMetricCard({
	farmId,
	assetId,
	isMaterialAsset,
}: FlockNetMetricCardProps) {
	const monthRange = useMemo(() => {
		const now = new Date();
		const start = new Date(now.getFullYear(), now.getMonth(), 1)
			.toISOString()
			.slice(0, 10);
		const end = now.toISOString().slice(0, 10);
		return { start, end };
	}, []);

	const { data: profitabilityReport } = useGetProfitabilityReport({
		farmId,
		filters: {
			assetId,
			dateFrom: monthRange.start,
			dateTo: monthRange.end,
		},
		enabled: !!farmId,
	});

	const netMonth = useMemo(() => {
		const assetRow = profitabilityReport?.data.find(
			(row) => row.asset_id === assetId,
		);
		if (!assetRow) return 0;
		return parseNumeric(assetRow.net);
	}, [profitabilityReport, assetId]);

	return (
		<FlockMetricCard
			label={isMaterialAsset ? "Valor neto · mes" : "Neto · mes"}
			value={formatMoney(netMonth)}
			note={
				isMaterialAsset
					? "Calculado con movimientos financieros del activo"
					: "Calculado con eventos de ingreso y gasto del mes"
			}
		/>
	);
}
