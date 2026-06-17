import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetCoopProductivityReport } from "@/features/reports/api/reports-queries";
import { ApiRequestError } from "@/lib/axios/axios-helper";

interface CoopProductivityReportProps {
	farmId: string | number;
	dateFrom: string;
	dateTo: string;
}

const formatPct = (value: string | null): string => {
	if (value == null) return "—";
	const parsed = parseFloat(value);
	return Number.isFinite(parsed) ? `${parsed.toFixed(1)}%` : "—";
};

export const CoopProductivityReport = ({
	farmId,
	dateFrom,
	dateTo,
}: CoopProductivityReportProps) => {
	const { data, isPending, isError, error } = useGetCoopProductivityReport({
		farmId,
		date_from: dateFrom,
		date_to: dateTo,
	});

	const apiError = error instanceof ApiRequestError ? error : null;
	const rows = data?.data ?? [];

	return (
		<Card className="v2-card">
			<CardHeader>
				<CardTitle className="text-lg">Productividad de gallineros</CardTitle>
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
						No hay datos de productividad para este periodo.
					</p>
				) : (
					<div className="rounded-lg border overflow-hidden">
						<div className="grid grid-cols-4 border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
							<span>Gallinero</span>
							<span className="text-right">Producido</span>
							<span className="text-right">Esperado</span>
							<span className="text-right">Productividad</span>
						</div>
						{rows.map((row) => (
							<div
								key={row.asset_id}
								className="grid grid-cols-4 items-center border-b px-4 py-3 text-sm last:border-b-0"
							>
								<span className="font-medium">{row.asset_name}</span>
								<span className="text-right">{row.produced}</span>
								<span className="text-right">{row.expected ?? "—"}</span>
								<span className="text-right">
									{row.missing_capacity ? (
										<Badge variant="outline">Sin capacidad</Badge>
									) : (
										<span className="font-medium">
											{formatPct(row.productivity_pct)}
										</span>
									)}
								</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
