import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetProfitabilityReport } from "@/features/reports/api/reports-queries";
import { ApiRequestError } from "@/lib/axios/axios-helper";

interface ProfitabilityReportProps {
	farmId: string | number;
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

export const ProfitabilityReport = ({
	farmId,
	dateFrom,
	dateTo,
	assetId,
}: ProfitabilityReportProps) => {
	const {
		data: report,
		isPending,
		isError,
		error,
	} = useGetProfitabilityReport({
		farmId,
		date_from: dateFrom,
		date_to: dateTo,
		asset_id: assetId,
	});

	const summary = useMemo(() => {
		if (!report?.data) return null;

		const rows = report.data;
		if (rows.length === 0) return null;

		// Group by currency and sum
		const byCurrency = rows.reduce(
			(acc, row) => {
				const curr = row.currency;
				if (!acc[curr]) {
					acc[curr] = {
						currency: curr,
						income_total: 0,
						expense_total: 0,
						net: 0,
					};
				}
				acc[curr].income_total += parseDecimal(row.income_total);
				acc[curr].expense_total += parseDecimal(row.expense_total);
				acc[curr].net += parseDecimal(row.net);
				return acc;
			},
			{} as Record<
				string,
				{
					currency: string;
					income_total: number;
					expense_total: number;
					net: number;
				}
			>,
		);

		return Object.values(byCurrency);
	}, [report?.data]);

	const apiError = error instanceof ApiRequestError ? error : null;

	return (
		<Card className="v2-card">
			<CardHeader>
				<CardTitle className="text-lg">Rentabilidad por Activo</CardTitle>
			</CardHeader>
			<CardContent>
				{isPending ? (
					<p className="text-sm text-muted-foreground">Cargando...</p>
				) : isError ? (
					<p className="text-sm text-destructive">
						{apiError?.message || "Error cargando reporte"}
					</p>
				) : !report?.data || report.data.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No hay datos de rentabilidad
					</p>
				) : (
					<div className="space-y-6">
						{/* Summary by currency */}
						{summary && summary.length > 0 && (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{summary.map((curr) => (
									<div
										key={curr.currency}
										className="rounded-lg border p-4"
									>
										<div className="space-y-2">
											<p className="text-xs font-medium text-muted-foreground">
												Ingresos ({curr.currency})
											</p>
											<p className="text-lg font-semibold">
												{formatCurrency(curr.income_total, curr.currency)}
											</p>
										</div>
										<div className="mt-4 space-y-2">
											<p className="text-xs font-medium text-muted-foreground">
												Gastos
											</p>
											<p className="text-lg font-semibold text-red-600">
												{formatCurrency(curr.expense_total, curr.currency)}
											</p>
										</div>
										<div className="mt-4 border-t pt-4 space-y-2">
											<p className="text-xs font-medium text-muted-foreground">
												Neto
											</p>
											<p
												className={`text-lg font-semibold ${
													curr.net >= 0 ? "text-green-600" : "text-red-600"
												}`}
											>
												{formatCurrency(curr.net, curr.currency)}
											</p>
										</div>
									</div>
								))}
							</div>
						)}

						{/* Details rows */}
						<div className="rounded-lg border overflow-hidden">
							<div className="grid grid-cols-5 border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
								<span>Activo</span>
								<span className="text-right">Ingresos</span>
								<span className="text-right">Gastos</span>
								<span className="text-right">Neto</span>
								<span className="text-right">Moneda</span>
							</div>
							{report.data.map((row) => {
								const income = parseDecimal(row.income_total);
								const expense = parseDecimal(row.expense_total);
								const net = parseDecimal(row.net);

								return (
									<div
										key={`${row.asset_id}-${row.currency}`}
										className="grid grid-cols-5 border-b px-4 py-3 text-sm last:border-b-0 items-center"
									>
										<span className="font-medium">{row.asset_name}</span>
										<span className="text-right">
											{formatCurrency(income, row.currency)}
										</span>
										<span className="text-right">
											{formatCurrency(expense, row.currency)}
										</span>
										<span
											className={`text-right font-medium ${
												net >= 0 ? "text-green-600" : "text-red-600"
											}`}
										>
											{formatCurrency(net, row.currency)}
										</span>
										<span className="text-right">
											<Badge variant="outline">{row.currency}</Badge>
										</span>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
