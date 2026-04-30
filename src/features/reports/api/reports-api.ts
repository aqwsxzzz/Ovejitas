import { axiosHelper } from "@/lib/axios/axios-helper";
import type {
	IProfitabilityReport,
	IProductionReport,
	ICostPerUnitReport,
	ITimelineReport,
	IProfitabilityReportParams,
	IProductionReportParams,
	ICostPerUnitReportParams,
	ITimelineReportParams,
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
 * R2 — SUM(quantity) bucketed over time
 * GET /api/v1/farms/{farm_id}/reports/production
 */
export const getProductionReport = ({
	farmId,
	bucket,
	type,
	date_from,
	date_to,
	asset_id,
	unit,
}: IProductionReportParams) =>
	axiosHelper<IProductionReport>({
		method: "get",
		url: `/api/v1/farms/${farmId}/reports/production`,
		urlParams: {
			bucket,
			type,
			date_from,
			date_to,
			asset_id,
			unit,
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
