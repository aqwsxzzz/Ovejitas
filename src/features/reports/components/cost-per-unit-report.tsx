import { useMemo } from "react";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetCostPerUnitReport } from "@/features/reports/api/reports-queries";
import type { Unit } from "@/features/reports/types/reports-types";
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

const formatCurrency = (value: number, currency: string): string => {
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value);
	} catch {
		return `${value.toFixed(2)} ${currency}`;
	}
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

		if (report.totals && report.totals.length > 0) {
			return report.totals.map((item) => ({
				currency: item.currency,
				quantity: parseDecimal(item.quantity),
				expense_total: parseDecimal(item.expense_total),
				cost_per_unit: parseDecimal(item.cost_per_unit),
			}));
		}

		const grouped = report.data.reduce(
			(acc, row) => {
				if (!acc[row.currency]) {
					acc[row.currency] = {
						currency: row.currency,
						quantity: 0,
						expense_total: 0,
					};
				}
				acc[row.currency].quantity += parseDecimal(row.quantity);
				acc[row.currency].expense_total += parseDecimal(row.expense_total);
				return acc;
			},
			{} as Record<
				string,
				{ currency: string; quantity: number; expense_total: number }
			>,
		);

		return Object.values(grouped).map((item) => ({
			...item,
			cost_per_unit: item.quantity > 0 ? item.expense_total / item.quantity : 0,
		}));
	}, [report]);

	const apiError = error instanceof ApiRequestError ? error : null;

	return (
		<Card className="v2-card">
			<CardHeader>
				<CardTitle className="text-lg">Costo por unidad</CardTitle>
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
											Gasto total ({item.currency})
										</p>
										<p className="text-lg font-semibold mt-2">
											{formatCurrency(item.expense_total, item.currency)}
										</p>
										<p className="text-xs text-muted-foreground mt-3">
											Cantidad: {item.quantity.toFixed(2)} {report.unit}
										</p>
										<p className="text-sm font-medium mt-2">
											Costo/u:{" "}
											{formatCurrency(item.cost_per_unit, item.currency)}
										</p>
									</div>
								))}
							</div>
						)}

						<div className="rounded-lg border overflow-hidden">
							<div className="grid grid-cols-5 border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
								<span>Activo</span>
								<span className="text-right">Cantidad</span>
								<span className="text-right">Gasto total</span>
								<span className="text-right">Costo / unidad</span>
								<span className="text-right">Moneda</span>
							</div>
							{report.data.map((row) => (
								<div
									key={`${row.asset_id}-${row.currency}`}
									className="grid grid-cols-5 border-b px-4 py-3 text-sm last:border-b-0 items-center"
								>
									<span className="font-medium">{row.asset_name}</span>
									<span className="text-right">
										{parseDecimal(row.quantity).toFixed(2)} {report.unit}
									</span>
									<span className="text-right">
										{formatCurrency(
											parseDecimal(row.expense_total),
											row.currency,
										)}
									</span>
									<span className="text-right font-medium">
										{formatCurrency(
											parseDecimal(row.cost_per_unit),
											row.currency,
										)}
									</span>
									<span className="text-right">
										<Badge variant="outline">{row.currency}</Badge>
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
