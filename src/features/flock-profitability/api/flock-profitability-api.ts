import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	IFlockProfitabilityReport,
	IGetFlockProfitabilityParams,
} from "@/features/flock-profitability/types/flock-profitability-types";

export const getFlockProfitabilityReport = ({
	period,
	from,
	to,
	flockId,
}: IGetFlockProfitabilityParams) =>
	axiosHelper<IResponse<IFlockProfitabilityReport>>({
		method: "get",
		url: "/reports/flock-profitability",
		urlParams: {
			period,
			from,
			to,
			flockId,
		},
	});
