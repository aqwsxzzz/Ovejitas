import { useQuery } from "@tanstack/react-query";
import {
	getProfitabilityReport,
	getAggregateReport,
	getCostPerUnitReport,
	getTimelineReport,
	getInventorySummaryReport,
	getMaterialConsumptionAggregateReport,
	getProfitabilityReportPdf,
	getCostPerUnitReportPdf,
} from "@/features/reports/api/reports-api";
import type {
	IProfitabilityReportParams,
	IAggregateReportParams,
	ICostPerUnitReportParams,
	ITimelineReportParams,
	IInventorySummaryReportParams,
	IMaterialConsumptionAggregateReportParams,
	IReportPdfParams,
} from "@/features/reports/types/reports-types";

export const reportsQueryKeys = {
	all: ["reports"] as const,
	farm: (farmId: string | number) =>
		[...reportsQueryKeys.all, "farm", farmId] as const,
	profitability: (farmId: string | number) =>
		[...reportsQueryKeys.farm(farmId), "profitability"] as const,
	aggregate: (
		farmId: string | number,
		eventType: string,
		bucket?: string,
		dateFrom?: string,
		dateTo?: string,
		assetId?: number,
		unit?: string,
		adjustment?: string,
		currency?: string,
		groupBy?: string,
	) =>
		[
			...reportsQueryKeys.farm(farmId),
			"aggregate",
			eventType,
			bucket ?? "month",
			dateFrom ?? null,
			dateTo ?? null,
			assetId ?? null,
			unit ?? null,
			adjustment ?? null,
			currency ?? null,
			groupBy ?? null,
		] as const,
	profitabilityWithFilters: (
		farmId: string | number,
		dateFrom?: string,
		dateTo?: string,
		assetId?: number,
	) =>
		[
			...reportsQueryKeys.farm(farmId),
			"profitability",
			dateFrom ?? null,
			dateTo ?? null,
			assetId ?? null,
		] as const,
	costPerUnit: (
		farmId: string | number,
		unit?: string,
		dateFrom?: string,
		dateTo?: string,
		assetId?: number,
	) =>
		[
			...reportsQueryKeys.farm(farmId),
			"cost-per-unit",
			unit ?? "dozen",
			dateFrom ?? null,
			dateTo ?? null,
			assetId ?? null,
		] as const,
	timeline: (
		farmId: string | number,
		individualId: string | number,
		dateFrom?: string,
		dateTo?: string,
		type?: string,
		page?: number,
		pageSize?: number,
	) =>
		[
			...reportsQueryKeys.farm(farmId),
			"timeline",
			individualId,
			dateFrom ?? null,
			dateTo ?? null,
			type ?? null,
			page ?? 1,
			pageSize ?? 20,
		] as const,
	inventorySummary: (
		farmId: string | number,
		dateFrom?: string,
		dateTo?: string,
		assetId?: number,
		unit?: string,
	) =>
		[
			...reportsQueryKeys.farm(farmId),
			"inventory-summary",
			dateFrom ?? null,
			dateTo ?? null,
			assetId ?? null,
			unit ?? null,
		] as const,
	materialConsumptionAggregate: (
		farmId: string | number,
		bucket?: string,
		groupBy?: string,
		materialAssetId?: number,
		consumerAssetId?: number,
		reason?: string,
		dateFrom?: string,
		dateTo?: string,
	) =>
		[
			...reportsQueryKeys.farm(farmId),
			"material-consumption-aggregate",
			bucket ?? "day",
			groupBy ?? "material",
			materialAssetId ?? null,
			consumerAssetId ?? null,
			reason ?? null,
			dateFrom ?? null,
			dateTo ?? null,
		] as const,
};

/**
 * Get profitability report (income vs expense per asset)
 */
export const useGetProfitabilityReport = (
	params: IProfitabilityReportParams,
	enabled = true,
) =>
	useQuery({
		queryKey: reportsQueryKeys.profitabilityWithFilters(
			params.farmId,
			params.date_from,
			params.date_to,
			params.asset_id,
		),
		queryFn: () => getProfitabilityReport(params),
		enabled: enabled && !!params.farmId,
	});

/**
 * Get aggregate report (bucketed event aggregation)
 */
export const useGetAggregateReport = (
	params: IAggregateReportParams,
	enabled = true,
) =>
	useQuery({
		queryKey: reportsQueryKeys.aggregate(
			params.farmId,
			params.type,
			params.bucket,
			params.date_from,
			params.date_to,
			params.asset_id,
			params.unit,
			params.adjustment,
			params.currency,
			params.group_by,
		),
		queryFn: () => getAggregateReport(params),
		enabled: enabled && !!params.farmId,
	});

/**
 * Get cost per unit report (expense ÷ produced quantity)
 * Note: `unit` param is required
 */
export const useGetCostPerUnitReport = (
	params: ICostPerUnitReportParams,
	enabled = true,
) =>
	useQuery({
		queryKey: reportsQueryKeys.costPerUnit(
			params.farmId,
			params.unit,
			params.date_from,
			params.date_to,
			params.asset_id,
		),
		queryFn: () => getCostPerUnitReport(params),
		enabled: enabled && !!params.farmId && !!params.unit,
	});

/**
 * Get event timeline for one individual (paginated)
 */
export const useGetTimelineReport = (
	params: ITimelineReportParams,
	enabled = true,
) =>
	useQuery({
		queryKey: reportsQueryKeys.timeline(
			params.farmId,
			params.individualId,
			params.date_from,
			params.date_to,
			params.type,
			params.page,
			params.page_size,
		),
		queryFn: () => getTimelineReport(params),
		enabled: enabled && !!params.farmId && !!params.individualId,
	});

/**
 * Get current on-hand inventory summary
 */
export const useGetInventorySummaryReport = (
	params: IInventorySummaryReportParams,
	enabled = true,
) =>
	useQuery({
		queryKey: reportsQueryKeys.inventorySummary(
			params.farmId,
			params.date_from,
			params.date_to,
			params.asset_id,
			params.unit,
		),
		queryFn: () => getInventorySummaryReport(params),
		enabled: enabled && !!params.farmId,
	});

/**
 * Get material consumption aggregate report
 */
export const useGetMaterialConsumptionAggregateReport = (
	params: IMaterialConsumptionAggregateReportParams,
	enabled = true,
) =>
	useQuery({
		queryKey: reportsQueryKeys.materialConsumptionAggregate(
			params.farmId,
			params.bucket,
			params.group_by,
			params.material_asset_id,
			params.consumer_asset_id,
			params.reason,
			params.date_from,
			params.date_to,
		),
		queryFn: () => getMaterialConsumptionAggregateReport(params),
		enabled: enabled && !!params.farmId,
	});

/**
 * Download profitability report PDF
 */
export const useGetProfitabilityReportPdf = (
	params: IReportPdfParams,
	enabled = true,
) =>
	useQuery({
		queryKey: [
			...reportsQueryKeys.farm(params.farmId),
			"profitability-pdf",
			params.date_from ?? null,
			params.date_to ?? null,
			params.asset_id ?? null,
		] as const,
		queryFn: () => getProfitabilityReportPdf(params).then((res) => res.data),
		enabled: enabled && !!params.farmId,
	});

/**
 * Download cost per unit report PDF
 */
export const useGetCostPerUnitReportPdf = (
	params: IReportPdfParams,
	enabled = true,
) =>
	useQuery({
		queryKey: [
			...reportsQueryKeys.farm(params.farmId),
			"cost-per-unit-pdf",
			params.unit ?? null,
			params.date_from ?? null,
			params.date_to ?? null,
			params.asset_id ?? null,
		] as const,
		queryFn: () => getCostPerUnitReportPdf(params).then((res) => res.data),
		enabled: enabled && !!params.farmId && !!params.unit,
	});
