import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ProductionProductivityReport } from "@/features/reports/components/production-productivity-report";
import { CostPerUnitReport } from "@/features/reports/components/cost-per-unit-report";
import { ProductionReport } from "@/features/reports/components/production-report";
import { ProfitabilityReport } from "@/features/reports/components/profitability-report";
import { SalesValueReport } from "@/features/reports/components/sales-value-report";
import type { FinanceFilters, FinanceReportType } from "@/features/finance/finance-types";
import { formatAssetKind, toApiDateTime } from "@/features/finance/finance-utils";

interface FinanceReportBuilderProps {
	farmId: string;
	filters: FinanceFilters;
}

const REPORT_OPTIONS: Array<{ value: FinanceReportType; label: string }> = [
	{ value: "profitability", label: "Rentabilidad por activo" },
	{ value: "income-trend", label: "Ingresos por periodo" },
	{ value: "expense-trend", label: "Gastos por periodo" },
	{ value: "cost-per-unit", label: "Costo por unidad" },
	{ value: "production-productivity", label: "Productividad de producción" },
	{ value: "sales-value", label: "Valor de venta por unidad" },
];

export const FinanceReportBuilder = ({
	farmId,
	filters,
}: FinanceReportBuilderProps) => {
	const [reportType, setReportType] = useState<FinanceReportType>("profitability");
	const dateFrom = toApiDateTime(filters.dateFrom, false);
	const dateTo = toApiDateTime(filters.dateTo, true);
	const blocksKindScopedReports = filters.assetKind !== "all" && !filters.assetId;

	return (
		<div className="space-y-4">
			<Card className="v2-card">
				<CardHeader>
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div>
							<CardTitle className="text-lg">Reportes detallados</CardTitle>
							<p className="mt-1 text-sm text-muted-foreground">
								Usa los mismos filtros de finanzas para abrir un reporte puntual.
							</p>
						</div>
						<div className="w-full md:w-70">
							<Select
								value={reportType}
								onValueChange={(value) => setReportType(value as FinanceReportType)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{REPORT_OPTIONS.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				{blocksKindScopedReports && (
					<CardContent className="pt-0 text-sm text-muted-foreground">
						Los reportes detallados todavia no aceptan filtro nativo por tipo de activo.
						 Selecciona un activo especifico de {formatAssetKind(filters.assetKind).toLowerCase()} o quita ese filtro.
					</CardContent>
				)}
			</Card>

			{!blocksKindScopedReports && reportType === "profitability" && (
				<ProfitabilityReport
					farmId={farmId}
					dateFrom={dateFrom}
					dateTo={dateTo}
					assetId={filters.assetId}
				/>
			)}
			{!blocksKindScopedReports && reportType === "income-trend" && (
				<ProductionReport
					farmId={farmId}
					eventType="income"
					bucket={filters.bucket}
					dateFrom={dateFrom}
					dateTo={dateTo}
					assetId={filters.assetId}
				/>
			)}
			{!blocksKindScopedReports && reportType === "expense-trend" && (
				<ProductionReport
					farmId={farmId}
					eventType="expense"
					bucket={filters.bucket}
					dateFrom={dateFrom}
					dateTo={dateTo}
					assetId={filters.assetId}
				/>
			)}
			{!blocksKindScopedReports && reportType === "cost-per-unit" && (
				<CostPerUnitReport
					farmId={farmId}
					unit={filters.productionUnit}
					dateFrom={dateFrom}
					dateTo={dateTo}
					assetId={filters.assetId}
				/>
			)}
			{reportType === "production-productivity" && dateFrom && dateTo && (
				<ProductionProductivityReport
					farmId={farmId}
					dateFrom={dateFrom}
					dateTo={dateTo}
				/>
			)}
			{reportType === "sales-value" && (
				<SalesValueReport
					farmId={farmId}
					dateFrom={dateFrom}
					dateTo={dateTo}
				/>
			)}
		</div>
	);
};