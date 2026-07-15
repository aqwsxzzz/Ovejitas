import { useMemo } from "react";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetCostPerUnitReport } from "@/features/reports/api/reports-queries";
import { getCostPerUnitReportPdf } from "@/features/reports/api/reports-api";
import { ReportPdfButton } from "@/features/reports/components/report-pdf-button";
import type { Unit } from "@/features/reports/types/reports-types";
import {
	formatCurrency,
	formatProductionQuantity,
} from "@/features/reports/utils/reports-format";
import { ApiRequestError } from "@/lib/axios/axios-helper";

interface CostPerUnitReportProps {
	farmId: string | number;
	unit: Unit;
	dateFrom?: string;
	dateTo?: string;
	assetId?: number;
}

const parseDecimal = (value: string | null | undefined): number => {
	if (!value) return 0;
	return parseFloat(value);
};

export const CostPerUnitReport = ({
	farmId,
	unit,
	dateFrom,
	dateTo,
	assetId,
}: CostPerUnitReportProps) => {
	const {
		data: report,
		isPending,
		isError,
		error,
	} = useGetCostPerUnitReport({
		farmId,
		unit,
		date_from: dateFrom,
		date_to: dateTo,
		asset_id: assetId,
	});

	const summary = useMemo(() => {
		if (!report?.data) return [];

		const grouped = report.data.reduce(
			(acc, row) => {
				if (!acc[row.currency]) {
					acc[row.currency] = {
						currency: row.currency,
						quantity: 0,
						total_cost: 0,
					};
				}
				acc[row.currency].quantity += parseDecimal(row.production_quantity);
				acc[row.currency].total_cost += parseDecimal(row.total_cost);
				return acc;
			},
			{} as Record<
				string,
				{ currency: string; quantity: number; total_cost: number }
			>,
		);

		return Object.values(grouped).map((item) => ({
			...item,
			cost_per_unit: item.quantity > 0 ? item.total_cost / item.quantity : 0,
		}));
	}, [report]);

	const hasUnvaluedConsumption = useMemo(
		() => (report?.data ?? []).some((row) => row.has_unvalued_consumption),
		[report],
	);

	const apiError = error instanceof ApiRequestError ? error : null;

	return (
		<Card className="v2-card">
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<CardTitle className="text-lg">Costo por unidad</CardTitle>
				<ReportPdfButton
					filename="costo-por-unidad.pdf"
					fetchPdf={() =>
						getCostPerUnitReportPdf({
							farmId,
							unit,
							date_from: dateFrom,
							date_to: dateTo,
							asset_id: assetId,
						}).then((response) => response.data)
					}
				/>
			</CardHeader>
			<CardContent>
				{isPending ? (
					<LoadingState />
				) : isError ? (
					<ErrorState description={apiError?.message} />
				) : !report?.data || report.data.length === 0 ? (
					<EmptyState title="No hay datos de costo por unidad" />
				) : (
					<div className="space-y-6">
						{summary.length > 0 && (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{summary.map((item) => (
									<div
										key={item.currency}
										className="rounded-lg border p-4"
									>
										<p className="text-xs font-medium text-muted-foreground">
											Costo total ({item.currency})
										</p>
										<p className="text-lg font-semibold mt-2">
											{formatCurrency(item.total_cost, item.currency)}
										</p>
										<p className="text-xs text-muted-foreground mt-3">
											Cantidad:{" "}
											{formatProductionQuantity(item.quantity, report.unit)}
										</p>
										<p className="text-sm font-medium mt-2">
											Costo/u:{" "}
											{formatCurrency(item.cost_per_unit, item.currency)}
										</p>
									</div>
								))}
							</div>
						)}

						{hasUnvaluedConsumption ? (
							<p className="text-xs text-(--v2-ink-soft)">
								Algunos activos consumieron alimento sin costo registrado
								(ingresado por inventario, no por compra). Su costo por unidad
								puede estar subestimado.
							</p>
						) : null}

						<div className="rounded-lg border overflow-x-auto">
							<div className="grid min-w-180 grid-cols-6 border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
								<span>Activo</span>
								<span className="text-right">Cantidad</span>
								<span className="text-right">Gasto directo</span>
								<span className="text-right">Costo alimento</span>
								<span className="text-right">Costo total</span>
								<span className="text-right">Costo / unidad</span>
							</div>
							{report.data.map((row) => (
								<div
									key={`${row.asset_id}-${row.currency}`}
									className="grid min-w-180 grid-cols-6 border-b px-4 py-3 text-sm last:border-b-0 items-center"
								>
									<span className="flex items-center gap-2 font-medium">
										{row.asset_name}
										{row.has_unvalued_consumption ? (
											<Badge variant="warning">Sin costo</Badge>
										) : null}
									</span>
									<span className="text-right">
										{formatProductionQuantity(
											row.production_quantity,
											report.unit,
										)}
									</span>
									<span className="text-right">
										{formatCurrency(
											parseDecimal(row.direct_expense_total),
											row.currency,
										)}
									</span>
									<span className="text-right">
										{formatCurrency(
											parseDecimal(row.consumed_material_cost),
											row.currency,
										)}
									</span>
									<span className="text-right">
										{formatCurrency(parseDecimal(row.total_cost), row.currency)}
									</span>
									<span className="text-right font-medium">
										{formatCurrency(row.cost_per_unit, row.currency)}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
