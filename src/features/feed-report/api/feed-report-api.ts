import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	IFeedCostByFlockResponse,
	IFeedCostByLot,
} from "@/features/feed-report/types/feed-report-types";

export const getFeedCostByFlock = ({
	filters,
}: {
	filters?: {
		from?: string;
		to?: string;
		flockId?: string;
	};
}) =>
	axiosHelper<IResponse<IFeedCostByFlockResponse>>({
		method: "get",
		url: "/feed-reports/cost-by-flock",
		urlParams: {
			from: filters?.from,
			to: filters?.to,
			flockId: filters?.flockId,
		},
	});

export const getFeedCostByLot = ({ lotId }: { lotId: string }) =>
	axiosHelper<IResponse<IFeedCostByLot>>({
		method: "get",
		url: `/feed-reports/cost-by-lot/${lotId}`,
	});
