import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { Badge } from "@/components/ui/badge";
import { useFarmCurrencyMap } from "@/features/currency/api/currency-queries";
import { getCurrencyCode } from "@/features/currency/currency-utils";
import { getEventTypeLabel } from "@/features/livestock/types/livestock-types";
import { useGetTimelineReport } from "@/features/reports/api/reports-queries";
import type { EventType } from "@/features/reports/types/reports-types";
import { formatProductionQuantity } from "@/features/reports/utils/reports-format";
import { ApiRequestError } from "@/lib/axios/axios-helper";

interface IndividualTimelineReportProps {
	farmId: string | number;
	individualId?: number;
	/** Optional event-type filter; omit to show all event types. */
	eventType?: EventType;
	dateFrom?: string;
	dateTo?: string;
}

const formatDateTime = (isoDate: string): string => {
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

export const IndividualTimelineReport = ({
	farmId,
	individualId,
	eventType,
	dateFrom,
	dateTo,
}: IndividualTimelineReportProps) => {
	const hasDateRangeFilter = !!dateFrom || !!dateTo;
	const { data: currencyCodeById } = useFarmCurrencyMap({
		farmId: String(farmId),
	});

	const {
		data: report,
		isPending,
		isError,
		error,
	} = useGetTimelineReport(
		{
			farmId,
			individualId: individualId ?? 0,
			page: 1,
			page_size: 20,
			date_from: dateFrom,
			date_to: dateTo,
			type: eventType,
		},
		!!individualId,
	);

	const apiError = error instanceof ApiRequestError ? error : null;

	return (
		<Card className="v2-card">
			<CardHeader>
				<CardTitle className="text-lg">Timeline por Individuo</CardTitle>
			</CardHeader>
			<CardContent>
				{!individualId ? (
					<p className="text-sm text-muted-foreground">
						Ingresa un ID de individuo para ver el timeline.
					</p>
				) : isPending ? (
					<LoadingState />
				) : isError ? (
					<ErrorState description={apiError?.message} />
				) : !report?.data || report.data.length === 0 ? (
					<EmptyState
						title={
							hasDateRangeFilter
								? "No hay eventos en el rango de fechas seleccionado para este individuo."
								: "No hay eventos para el individuo seleccionado."
						}
					/>
				) : (
					<div className="space-y-3">
						{report.data.map((eventItem) => (
							<div
								key={eventItem.id}
								className="rounded-lg border p-3"
							>
								<div className="flex items-start justify-between gap-2">
									<div>
										<p className="text-sm font-medium">
											{formatDateTime(eventItem.occurred_at)}
										</p>
										<p className="text-xs text-muted-foreground">
											Evento #{eventItem.id}
										</p>
									</div>
									<Badge variant="outline">
									{getEventTypeLabel(eventItem.type)}
								</Badge>
								</div>
								<div className="mt-2 text-sm text-muted-foreground">
									{eventItem.notes || "Sin notas"}
								</div>
								<div className="mt-2 flex flex-wrap gap-2 text-xs">
									{eventItem.quantity && eventItem.unit && (
										<Badge variant="secondary">
											{formatProductionQuantity(
												eventItem.quantity,
												eventItem.unit,
											)}
										</Badge>
									)}
									{eventItem.amount != null && (
										<Badge variant="secondary">
											{eventItem.amount}{" "}
											{getCurrencyCode(
												currencyCodeById,
												eventItem.currency_id,
											)}
										</Badge>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
