import { useMemo } from "react";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetAggregateReport } from "@/features/reports/api/reports-queries";
import type {
	ProductionBucket,
	EventType,
	Unit,
} from "@/features/reports/types/reports-types";
import { ApiRequestError } from "@/lib/axios/axios-helper";

interface ProductionReportProps {
	farmId: string | number;
	eventType: EventType;
	bucket: ProductionBucket;
	unit?: Unit;
	dateFrom?: string;
	dateTo?: string;
	assetId?: number;
}

const formatEventType = (type: EventType): string => {
	const map: Record<EventType, string> = {
		production: "Produccion",
		observation: "Observacion",
		expense: "Gasto",
		income: "Ingreso",
		reproductive: "Reproduccion",
		acquisition: "Adquisicion",
		mortality: "Mortalidad",
		inventory: "Inventario",
	};
	return map[type];
};

const formatBucketStart = (isoDate: string): string => {
	try {
		return new Intl.DateTimeFormat(undefined, {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(new Date(isoDate));
	} catch {
		return isoDate;
	}
};

const parseDecimal = (value: string | null | undefined): number => {
	if (!value) return 0;
	return parseFloat(value);
};

const isWholeUnitEventType = (eventType: EventType): boolean =>
	eventType === "mortality" ||
	eventType === "acquisition" ||
	eventType === "reproductive";

const formatMeasureLabel = (measure: string): string => {
	if (measure === "sum_quantity") return "Cantidad total";
	if (measure === "sum_amount") return "Monto total";
	if (measure === "count") return "Conteo";
	return measure;
};

const formatGroupLabel = (groupKey: string | null | undefined): string => {
	if (groupKey === "unit") return "Unidad";
	if (groupKey === "currency") return "Moneda";
	if (groupKey === "asset") return "Activo";
	return "Grupo";
};

const formatValue = (value: number, asInteger: boolean): string => {
	if (asInteger) {
		return new Intl.NumberFormat(undefined, {
			maximumFractionDigits: 0,
		}).format(Math.round(value));
	}

	return value.toFixed(2);
};

export const ProductionReport = ({
	farmId,
	eventType,
	bucket,
	unit,
	dateFrom,
	dateTo,
	assetId,
}: ProductionReportProps) => {
	const unitFilter = eventType === "production" ? unit : undefined;
	const groupByAsset =
		eventType === "mortality" || eventType === "acquisition"
			? "asset"
			: undefined;

	const {
		data: report,
		isPending,
		isError,
		error,
	} = useGetAggregateReport({
		farmId,
		bucket,
		type: eventType,
		date_from: dateFrom,
		date_to: dateTo,
		asset_id: assetId,
		unit: unitFilter,
		group_by: groupByAsset,
	});

	const apiError = error instanceof ApiRequestError ? error : null;
	const hasDateRangeFilter = !!dateFrom || !!dateTo;
	const periodsWithRecords = report?.data?.length ?? 0;
	const hasGroupData = (report?.data ?? []).some(
		(row) => !!row.group || !!row.group_label,
	);
	const shouldDisplayWholeUnits =
		isWholeUnitEventType(eventType) || report?.meta.measure === "count";

	const totalsByGroup = useMemo(() => {
		if (!report?.data) return [];

		const grouped = report.data.reduce(
			(acc, row) => {
				const groupKey = row.group_label ?? row.group ?? "Sin grupo";
				acc[groupKey] = (acc[groupKey] ?? 0) + parseDecimal(row.value);
				return acc;
			},
			{} as Record<string, number>,
		);

		return Object.entries(grouped).map(([group, total]) => ({
			group,
			total,
		}));
	}, [report]);

	const groupLabel = formatGroupLabel(report?.meta.group_key);
	const measureLabel = formatMeasureLabel(
		report?.meta.measure ?? "sum_quantity",
	);

	return (
		<Card className="v2-card">
			<CardHeader>
				<CardTitle className="text-lg">
					{formatEventType(eventType)} por periodo
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{!assetId && !hasGroupData && (
					<p className="text-xs text-muted-foreground">
						Este reporte muestra un agregado de toda la granja para el periodo
						seleccionado. Para ver un activo especifico, usa el filtro "Un
						activo especifico".
					</p>
				)}
				{totalsByGroup.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{totalsByGroup.map((item) => (
							<div
								key={item.group}
								className="rounded-lg border p-4"
							>
								<p className="text-xs font-medium text-muted-foreground">
									{item.group === "Sin grupo"
										? "Total general"
										: `Total (${item.group})`}
								</p>
								<p className="text-lg font-semibold mt-2">
									{formatValue(item.total, shouldDisplayWholeUnits)}
								</p>
							</div>
						))}
					</div>
				)}

				{isPending ? (
					<LoadingState />
				) : isError ? (
					<ErrorState description={apiError?.message} />
				) : !report?.data || report.data.length === 0 ? (
					<EmptyState
						title={
							hasDateRangeFilter
								? "No hay eventos en el rango de fechas seleccionado."
								: `No hay datos de ${formatEventType(eventType).toLowerCase()}`
						}
					/>
				) : (
					<div className="rounded-lg border overflow-hidden">
						{hasDateRangeFilter && (
							<div className="border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
								Mostrando {periodsWithRecords} periodo(s) con registros en el
								rango seleccionado. Medida: {measureLabel}.
							</div>
						)}
						<div
							className={`grid ${hasGroupData ? "grid-cols-3" : "grid-cols-2"} border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground`}
						>
							<span>Periodo</span>
							{hasGroupData && <span>{groupLabel}</span>}
							<span className="text-right">Valor</span>
						</div>
						{report.data.map((row, idx) => (
							<div
								key={idx}
								className={`grid ${hasGroupData ? "grid-cols-3" : "grid-cols-2"} border-b px-4 py-3 text-sm last:border-b-0 items-center`}
							>
								<span>{formatBucketStart(row.bucket)}</span>
								{hasGroupData && (
									<span>
										{row.group_label || row.group ? (
											<Badge variant="secondary">
												{row.group_label ?? row.group}
											</Badge>
										) : (
											<span className="text-muted-foreground">Sin grupo</span>
										)}
									</span>
								)}
								<span className="text-right font-medium">
									{formatValue(
										parseDecimal(row.value),
										shouldDisplayWholeUnits,
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
