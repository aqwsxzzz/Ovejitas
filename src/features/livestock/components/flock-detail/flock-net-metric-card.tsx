import { useMemo } from "react";

import {
	MetricBreakdownCard,
	type MetricBreakdownRow,
} from "@/components/common/metric-breakdown-card";
import { useGetProfitabilityFullReport } from "@/features/reports/api/reports-queries";
import { formatCurrency } from "@/features/reports/utils/reports-format";

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

	const { data: report, isPending } = useGetProfitabilityFullReport({
		farmId,
		date_from: monthRange.start,
		date_to: monthRange.end,
		asset_id: assetId,
	});

	const row = useMemo(
		() => report?.data.find((item) => item.asset_id === assetId) ?? null,
		[report, assetId],
	);

	const breakdown = useMemo<MetricBreakdownRow[]>(() => {
		if (!row) return [];
		const rows: MetricBreakdownRow[] = [
			{
				label: "Ingresos",
				value: formatCurrency(row.income_total, row.currency),
				tone: "positive",
			},
			{
				label: "Gasto directo",
				value: formatCurrency(row.direct_expense_total, row.currency),
				tone: "negative",
			},
		];
		if (!isMaterialAsset) {
			rows.push({
				label: "Alimento",
				value: formatCurrency(row.consumed_material_cost, row.currency),
				tone: "negative",
			});
		}
		return rows;
	}, [row, isMaterialAsset]);

	const footnotes = useMemo(() => {
		if (!row) return ["Sin movimientos financieros este mes."];
		const notes: string[] = [];
		if (row.has_unvalued_consumption) {
			notes.push(
				"Alimento sin costo registrado: el neto puede estar sobrestimado.",
			);
		}
		if (row.has_other_currency) {
			notes.push("Excluye montos en otra moneda.");
		}
		return notes;
	}, [row]);

	return (
		<MetricBreakdownCard
			label={isMaterialAsset ? "Valor neto · mes" : "Neto real · mes"}
			value={row ? formatCurrency(row.net_incl_materials, row.currency) : "—"}
			isLoading={isPending}
			breakdown={breakdown}
			footnotes={footnotes}
		/>
	);
}
