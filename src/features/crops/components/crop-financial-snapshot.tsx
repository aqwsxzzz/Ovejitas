import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { MetricBreakdownCard } from "@/components/common/metric-breakdown-card";
import { toNumber } from "@/features/inventory/components/material-detail-utils";
import type { IProfitabilityTotal } from "@/features/reports/types/reports-types";

interface CropFinancialSnapshotProps {
	totals: IProfitabilityTotal[];
	isLoading: boolean;
	isError: boolean;
}

export function CropFinancialSnapshot({
	totals,
	isLoading,
	isError,
}: CropFinancialSnapshotProps) {
	return (
		<div className="space-y-3">
			<p className="text-[10px] uppercase tracking-[0.08em] text-(--v2-ink-soft)">
				Resumen financiero
			</p>
			{isLoading ? (
				<LoadingState message="Cargando resumen financiero..." />
			) : null}
			{isError ? (
				<ErrorState description="Error al cargar el resumen financiero." />
			) : null}
			{!isLoading && !isError && totals.length === 0 ? (
				<EmptyState title="Sin gastos aún" />
			) : null}
			{totals.map((total) => (
				<MetricBreakdownCard
					key={total.currency}
					label={`Neto · ${total.currency}`}
					value={toNumber(total.net).toFixed(2)}
					breakdown={[
						{
							label: "Ingresos",
							value: toNumber(total.income_total).toFixed(2),
							tone: "positive",
						},
						{
							label: "Gastos",
							value: toNumber(total.expense_total).toFixed(2),
							tone: "negative",
						},
					]}
				/>
			))}
		</div>
	);
}
