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
	const currentMonthStart = useMemo(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
	}, []);

	const { data: profitabilityReport } = useGetProfitabilityReport({
		farmId,
		filters: {
			assetId,
			dateFrom: currentMonthStart,
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
