import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	useGetProductionReport,
	useGetProfitabilityReport,
} from "@/features/reports/api/reports-queries";
import type {
	ProductionBucket,
	EventType,
} from "@/features/reports/types/reports-types";
import { ApiRequestError } from "@/lib/axios/axios-helper";

interface ProductionReportProps {
	farmId: string | number;
	eventType: EventType;
	bucket: ProductionBucket;
	dateFrom?: string;
	dateTo?: string;
	assetId?: number;
}

const formatEventType = (type: EventType): string => {
	const map: Record<EventType, string> = {
		production: "Producción",
		observation: "Observación",
		expense: "Gasto",
		income: "Ingreso",
		reproductive: "Reproducción",
		acquisition: "Adquisición",
		mortality: "Mortalidad",
	};
	return map[type];
};

const formatBucketStart = (isoDate: string): string => {
	try {
		return new Intl.DateTimeFormat(undefined, {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(isoDate));
	} catch {
		return isoDate;
	}
};

const parseDecimal = (value: string | null | undefined): number => {
	if (!value) return 0;
	return parseFloat(value);
};

export const ProductionReport = ({
	farmId,
	eventType,
	bucket,
	dateFrom,
	dateTo,
	assetId,
}: ProductionReportProps) => {
	const {
		data: report,
		isPending,
		isError,
		error,
	} = useGetProductionReport({
		farmId,
		bucket,
		type: eventType,
		date_from: dateFrom,
		date_to: dateTo,
		asset_id: assetId,
	});

	// Also fetch profitability to get asset names as reference
	const { data: profitability } = useGetProfitabilityReport({
		farmId,
		date_from: dateFrom,
		date_to: dateTo,
		asset_id: assetId,
	});

	const assetNameMap = useMemo(() => {
		if (!profitability?.data) return {};
		return profitability.data.reduce(
			(acc, row) => {
				acc[row.asset_id] = row.asset_name;
				return acc;
			},
			{} as Record<number, string>,
		);
	}, [profitability?.data]);

	const apiError = error instanceof ApiRequestError ? error : null;
	const hasDateRangeFilter = !!dateFrom || !!dateTo;
	const periodsWithRecords = report?.data?.length ?? 0;

	return (
		<Card className="v2-card">
			<CardHeader>
				<CardTitle className="text-lg">
					{formatEventType(eventType)} por período
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Report */}
				{isPending ? (
					<p className="text-sm text-muted-foreground">Cargando...</p>
				) : isError ? (
					<p className="text-sm text-destructive">
						{apiError?.message || "Error cargando reporte"}
					</p>
				) : !report?.data || report.data.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						{hasDateRangeFilter
							? "No hay eventos en el rango de fechas seleccionado."
							: `No hay datos de ${formatEventType(eventType).toLowerCase()}`}
					</p>
				) : (
					<div className="rounded-lg border overflow-hidden">
						{hasDateRangeFilter && (
							<div className="border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
								Mostrando {periodsWithRecords} período(s) con registros en el
								rango seleccionado.
							</div>
						)}
						<div className="grid grid-cols-5 border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
							<span>Período</span>
							<span>Activo</span>
							<span>Categoría</span>
							<span>Unidad</span>
							<span className="text-right">Total</span>
						</div>
						{report.data.map((row, idx) => (
							<div
								key={idx}
								className="grid grid-cols-5 border-b px-4 py-3 text-sm last:border-b-0 items-center"
							>
								<span>{formatBucketStart(row.bucket_start)}</span>
								<span className="font-medium">
									{assetNameMap[row.asset_id] || `Asset #${row.asset_id}`}
								</span>
								<span>
									{row.category_id ? (
										<Badge variant="outline">Cat #{row.category_id}</Badge>
									) : (
										<span className="text-muted-foreground">—</span>
									)}
								</span>
								<span>
									<Badge variant="secondary">{row.unit}</Badge>
								</span>
								<span className="text-right font-medium">
									{parseDecimal(row.total).toFixed(2)}
								</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
