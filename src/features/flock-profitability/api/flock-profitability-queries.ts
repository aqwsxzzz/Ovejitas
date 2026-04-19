import { useQuery } from "@tanstack/react-query";
import { getFlockProfitabilityReport } from "@/features/flock-profitability/api/flock-profitability-api";
import type { IGetFlockProfitabilityParams } from "@/features/flock-profitability/types/flock-profitability-types";

export const flockProfitabilityQueryKeys = {
	all: ["flock-profitability"] as const,
	report: ({ period, from, to, flockId }: IGetFlockProfitabilityParams) =>
		[
			...flockProfitabilityQueryKeys.all,
			period,
			from,
			to,
			flockId ?? "all",
		] as const,
};

export const useGetFlockProfitabilityReport = (
	params: IGetFlockProfitabilityParams,
	enabled = true,
) =>
	useQuery({
		queryKey: flockProfitabilityQueryKeys.report(params),
		queryFn: () => getFlockProfitabilityReport(params),
		select: (data) => data.data,
		enabled: enabled && Boolean(params.from && params.to),
	});
