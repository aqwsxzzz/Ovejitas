import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetSalesValueReport } from "@/features/reports/api/reports-queries";
import { ApiRequestError } from "@/lib/axios/axios-helper";

interface SalesValueReportProps {
	farmId: string | number;
	dateFrom?: string;
	dateTo?: string;
}

const formatMoney = (value: string | null, currency: string): string => {
	if (value == null) return "—";
	const parsed = parseFloat(value);
	if (!Number.isFinite(parsed)) return "—";
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency,
		}).format(parsed);
	} catch {
		return `${parsed.toFixed(2)} ${currency}`;
	}
};

export const SalesValueReport = ({
	farmId,
	dateFrom,
	dateTo,
}: SalesValueReportProps) => {
	const { data, isPending, isError, error } = useGetSalesValueReport({
		farmId,
		date_from: dateFrom,
		date_to: dateTo,
	});

	const apiError = error instanceof ApiRequestError ? error : null;
	const rows = data?.data ?? [];

	return (
		<Card className="v2-card">
			<CardHeader>
				<CardTitle className="text-lg">Valor de venta por unidad</CardTitle>
			</CardHeader>
			<CardContent>
				{isPending ? (
					<p className="text-sm text-muted-foreground">Cargando...</p>
				) : isError ? (
					<p className="text-sm text-destructive">
						{apiError?.message || "Error cargando reporte"}
					</p>
				) : rows.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No hay ventas registradas en este periodo.
					</p>
				) : (
					<div className="rounded-lg border overflow-hidden">
						<div className="grid grid-cols-4 border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
							<span>Activo</span>
							<span className="text-right">Ingreso total</span>
							<span className="text-right">Cantidad</span>
							<span className="text-right">Valor / unidad</span>
						</div>
						{rows.map((row) => (
							<div
								key={`${row.asset_id}-${row.currency}`}
								className="grid grid-cols-4 items-center border-b px-4 py-3 text-sm last:border-b-0"
							>
								<span className="font-medium">{row.asset_name}</span>
								<span className="text-right">
									{formatMoney(row.income_total, row.currency)}
								</span>
								<span className="text-right">
									{row.ambiguous ? (
										<Badge variant="outline">Unidades mixtas</Badge>
									) : (
										`${row.quantity_sold ?? "—"} ${row.unit ?? ""}`
									)}
								</span>
								<span className="text-right font-medium">
									{row.ambiguous
										? "—"
										: formatMoney(row.value_per_unit, row.currency)}
								</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
