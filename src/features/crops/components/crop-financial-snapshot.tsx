import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
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
		<Card>
			<CardHeader>
				<CardTitle>Resumen financiero</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
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
					<div
						key={total.currency}
						className="rounded-lg border px-3 py-3"
					>
						<div className="flex items-center justify-between text-sm">
							<span className="text-(--v2-ink-soft)">Moneda</span>
							<span className="font-semibold">{total.currency}</span>
						</div>
						<div className="mt-3 grid gap-2 md:grid-cols-3">
							<div className="rounded-lg bg-destructive/10 px-3 py-2">
								<p className="text-xs uppercase tracking-[0.08em] text-destructive">
									Gastos
								</p>
								<p className="text-base font-semibold">
									{toNumber(total.expense_total).toFixed(2)}
								</p>
							</div>
							<div className="rounded-lg bg-success/10 px-3 py-2">
								<p className="text-xs uppercase tracking-[0.08em] text-success">
									Ingresos
								</p>
								<p className="text-base font-semibold">
									{toNumber(total.income_total).toFixed(2)}
								</p>
							</div>
							<div className="rounded-lg bg-(--v2-surface) px-3 py-2">
								<p className="text-xs uppercase tracking-[0.08em] text-(--v2-ink-soft)">
									Neto
								</p>
								<p className="text-base font-semibold">
									{toNumber(total.net).toFixed(2)}
								</p>
							</div>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
