import { useQuery } from "@tanstack/react-query";
import {
	getProfitabilityReport,
	getProductionReport,
	getCostPerUnitReport,
	getTimelineReport,
} from "@/features/reports/api/reports-api";
import type {
	IProfitabilityReportParams,
	IProductionReportParams,
	ICostPerUnitReportParams,
	ITimelineReportParams,
} from "@/features/reports/types/reports-types";

export const reportsQueryKeys = {
	all: ["reports"] as const,
	farm: (farmId: string | number) =>
		[...reportsQueryKeys.all, "farm", farmId] as const,
	profitability: (farmId: string | number) =>
		[...reportsQueryKeys.farm(farmId), "profitability"] as const,
	production: (
		farmId: string | number,
		bucket?: string,
		type?: string,
		dateFrom?: string,
		dateTo?: string,
		assetId?: number,
		unit?: string,
	) =>
		[
			...reportsQueryKeys.farm(farmId),
			"production",
			bucket ?? "month",
			type ?? "production",
			dateFrom ?? null,
			dateTo ?? null,
			assetId ?? null,
			unit ?? null,
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
	costPerUnit: (farmId: string | number, unit?: string) =>
		[
			...reportsQueryKeys.farm(farmId),
			"cost-per-unit",
			unit ?? "dozen",
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
 * Get production report (SUM quantity bucketed over time)
 */
export const useGetProductionReport = (
	params: IProductionReportParams,
	enabled = true,
) =>
	useQuery({
		queryKey: reportsQueryKeys.production(
			params.farmId,
			params.bucket,
			params.type,
			params.date_from,
			params.date_to,
			params.asset_id,
			params.unit,
		),
		queryFn: () => getProductionReport(params),
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
		queryKey: reportsQueryKeys.costPerUnit(params.farmId, params.unit),
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
