import { axiosHelper } from "@/lib/axios/axios-helper";
import { axiosInstance } from "@/lib/axios";
import type {
	IProfitabilityReport,
	IAggregateReport,
	ICostPerUnitReport,
	ITimelineReport,
	IInventorySummaryReport,
	IProfitabilityReportParams,
	IAggregateReportParams,
	ICostPerUnitReportParams,
	ITimelineReportParams,
	IInventorySummaryReportParams,
	IMaterialConsumptionAggregateReport,
	IMaterialConsumptionAggregateReportParams,
	IReportPdfParams,
} from "@/features/reports/types/reports-types";

/**
 * R1 — Income minus expense per asset
 * GET /api/v1/farms/{farm_id}/reports/profitability
 */
export const getProfitabilityReport = ({
	farmId,
	date_from,
	date_to,
	asset_id,
}: IProfitabilityReportParams) =>
	axiosHelper<IProfitabilityReport>({
		method: "get",
		url: `/api/v1/farms/${farmId}/reports/profitability`,
		urlParams: {
			date_from,
			date_to,
			asset_id,
		},
	});

/**
 * R2 — Generic time-bucketed aggregate over one event type
 * GET /api/v1/farms/{farm_id}/reports/aggregate
 */
export const getAggregateReport = ({
	farmId,
	bucket,
	type,
	date_from,
	date_to,
	asset_id,
	unit,
	adjustment,
	currency,
	group_by,
}: IAggregateReportParams) =>
	axiosHelper<IAggregateReport>({
		method: "get",
		url: `/api/v1/farms/${farmId}/reports/aggregate`,
		urlParams: {
			bucket,
			type,
			date_from,
			date_to,
			asset_id,
			unit,
			adjustment,
			currency,
			group_by,
		},
	});

/**
 * R3 — Expense total ÷ produced quantity, per asset
 * GET /api/v1/farms/{farm_id}/reports/cost-per-unit
 * Note: `unit` is required
 */
export const getCostPerUnitReport = ({
	farmId,
	unit,
	date_from,
	date_to,
	asset_id,
}: ICostPerUnitReportParams) =>
	axiosHelper<ICostPerUnitReport>({
		method: "get",
		url: `/api/v1/farms/${farmId}/reports/cost-per-unit`,
		urlParams: {
			unit,
			date_from,
			date_to,
			asset_id,
		},
	});

/**
 * R4 — Paginated event timeline for one individual
 * GET /api/v1/farms/{farm_id}/reports/individuals/{individual_id}/timeline
 */
export const getTimelineReport = ({
	farmId,
	individualId,
	page = 1,
	page_size = 20,
	date_from,
	date_to,
	type,
}: ITimelineReportParams) =>
	axiosHelper<ITimelineReport>({
		method: "get",
		url: `/api/v1/farms/${farmId}/reports/individuals/${individualId}/timeline`,
		urlParams: {
			page,
			page_size,
			date_from,
			date_to,
			type,
		},
	});

/**
 * R5 — Current on-hand inventory across material assets
 * GET /api/v1/farms/{farm_id}/reports/inventory-summary
 */
export const getInventorySummaryReport = ({
	farmId,
	date_from,
	date_to,
	asset_id,
	unit,
}: IInventorySummaryReportParams) =>
	axiosHelper<IInventorySummaryReport>({
		method: "get",
		url: `/api/v1/farms/${farmId}/reports/inventory-summary`,
		urlParams: {
			date_from,
			date_to,
			asset_id,
			unit,
		},
	});

/**
 * R6 — Time-bucketed material-consumption aggregate
 * GET /api/v1/farms/{farm_id}/reports/material-consumption-aggregate
 */
export const getMaterialConsumptionAggregateReport = ({
	farmId,
	bucket,
	group_by,
	material_asset_id,
	consumer_asset_id,
	reason,
	date_from,
	date_to,
}: IMaterialConsumptionAggregateReportParams) =>
	axiosHelper<IMaterialConsumptionAggregateReport>({
		method: "get",
		url: `/api/v1/farms/${farmId}/reports/material-consumption-aggregate`,
		urlParams: {
			bucket,
			group_by,
			material_asset_id,
			consumer_asset_id,
			reason,
			date_from,
			date_to,
		},
	});

/**
 * R1 PDF — Profitability report download
 * GET /api/v1/farms/{farm_id}/reports/profitability/pdf
 */
export const getProfitabilityReportPdf = ({
	farmId,
	date_from,
	date_to,
	asset_id,
}: IReportPdfParams) =>
	axiosInstance.get<Blob>(`/api/v1/farms/${farmId}/reports/profitability/pdf`, {
		params: {
			date_from,
			date_to,
			asset_id,
		},
		responseType: "blob",
	});

/**
 * R3 PDF — Cost per unit report download
 * GET /api/v1/farms/{farm_id}/reports/cost-per-unit/pdf
 */
export const getCostPerUnitReportPdf = ({
	farmId,
	unit,
	date_from,
	date_to,
	asset_id,
}: IReportPdfParams) =>
	axiosInstance.get<Blob>(`/api/v1/farms/${farmId}/reports/cost-per-unit/pdf`, {
		params: {
			unit,
			date_from,
			date_to,
			asset_id,
		},
		responseType: "blob",
	});
