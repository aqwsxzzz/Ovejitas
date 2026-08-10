import { useQuery } from "@tanstack/react-query";

import {
	getCostPerUnitReport,
	getProductionReport,
	getProfitabilityReport,
} from "@/features/livestock/api/livestock-api";
import { getInventorySummaryReport } from "@/features/reports/api/reports-api";
import { livestockQueryKeys } from "@/features/livestock/api/livestock-query-keys";
import type {
	LivestockEventType,
	LivestockEventUnit,
	ReportBucket,
} from "@/features/livestock/types/livestock-types";

/**
 * Report cache keys. Kept beside the report hooks rather than in
 * `livestock-query-keys.ts` because nothing outside this module references them.
 */
export const livestockReportQueryKeys = {
	profitabilityReport: (
		farmId: string,
		assetId?: number,
		dateFrom?: string,
		dateTo?: string,
	) =>
		[
			...livestockQueryKeys.all,
			"profitabilityReport",
			farmId,
			assetId ?? "",
			dateFrom ?? "",
			dateTo ?? "",
		] as const,
	productionReport: (
		farmId: string,
		assetId?: number,
		type?: LivestockEventType,
		unit?: LivestockEventUnit,
		bucket?: ReportBucket,
		dateFrom?: string,
		dateTo?: string,
	) =>
		[
			...livestockQueryKeys.all,
			"productionReport",
			farmId,
			assetId ?? "",
			type ?? "production",
			unit ?? "",
			bucket ?? "day",
			dateFrom ?? "",
			dateTo ?? "",
		] as const,
	costPerUnitReport: (
		farmId: string,
		unit: LivestockEventUnit,
		assetId?: number,
		dateFrom?: string,
		dateTo?: string,
	) =>
		[
			...livestockQueryKeys.all,
			"costPerUnitReport",
			farmId,
			unit,
			assetId ?? "",
			dateFrom ?? "",
			dateTo ?? "",
		] as const,
};

// --- Report hooks ---

interface ReportBaseFilters {
	assetId?: number;
	dateFrom?: string;
	dateTo?: string;
}

export const useGetProfitabilityReport = ({
	farmId,
	filters,
	enabled = true,
}: {
	farmId: string;
	filters?: ReportBaseFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockReportQueryKeys.profitabilityReport(
			farmId,
			filters?.assetId,
			filters?.dateFrom,
			filters?.dateTo,
		),
		queryFn: () => getProfitabilityReport({ farmId, filters }),
		enabled: enabled && !!farmId,
	});

interface ProductionReportFilters extends ReportBaseFilters {
	type?: LivestockEventType;
	unit?: LivestockEventUnit;
	bucket?: ReportBucket;
}

export const useGetProductionReport = ({
	farmId,
	filters,
	enabled = true,
}: {
	farmId: string;
	filters?: ProductionReportFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockReportQueryKeys.productionReport(
			farmId,
			filters?.assetId,
			filters?.type,
			filters?.unit,
			filters?.bucket,
			filters?.dateFrom,
			filters?.dateTo,
		),
		queryFn: () => getProductionReport({ farmId, filters }),
		enabled: enabled && !!farmId,
	});

interface CostPerUnitReportFilters extends ReportBaseFilters {
	unit: LivestockEventUnit;
}

export const useGetCostPerUnitReport = ({
	farmId,
	filters,
	enabled = true,
}: {
	farmId: string;
	filters: CostPerUnitReportFilters;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: livestockReportQueryKeys.costPerUnitReport(
			farmId,
			filters.unit,
			filters.assetId,
			filters.dateFrom,
			filters.dateTo,
		),
		queryFn: () => getCostPerUnitReport({ farmId, filters }),
		enabled: enabled && !!farmId,
	});

export const useGetAggregatedHeadcountByAssetId = ({
	farmId,
	assetId,
	enabled = true,
}: {
	farmId: string;
	assetId: string;
	enabled?: boolean;
}) =>
	useQuery({
		queryKey: [
			...livestockQueryKeys.all,
			"aggregatedHeadcount",
			farmId,
			assetId,
		],
		queryFn: async () => {
			const report = await getInventorySummaryReport({
				farmId,
				asset_id: Number(assetId),
			});

			const net = report.data.reduce((sum, row) => {
				const onHand = Number(row.on_hand);
				return sum + (Number.isFinite(onHand) ? onHand : 0);
			}, 0);

			return {
				acquisitionTotal: 0,
				mortalityTotal: 0,
				net,
			};
		},
		enabled: enabled && !!farmId && !!assetId,
	});

