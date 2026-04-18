import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	ICreateFeedConsumptionPayload,
	IFeedConsumption,
	IFeedConsumptionListFilters,
} from "@/features/feed-consumption/types/feed-consumption-types";

export const getFeedConsumptions = ({
	filters,
	page,
	limit,
}: {
	filters?: Partial<IFeedConsumptionListFilters>;
	page?: number;
	limit?: number;
}) =>
	axiosHelper<IResponse<IFeedConsumption[]>>({
		method: "get",
		url: "/feed-consumptions",
		urlParams: {
			flockId: filters?.flockId,
			feedTypeId: filters?.feedTypeId,
			from: filters?.from,
			to: filters?.to,
			include: filters?.include,
			page,
			limit,
		},
	});

export const getFeedConsumptionById = ({
	feedConsumptionId,
}: {
	feedConsumptionId: string;
}) =>
	axiosHelper<IResponse<IFeedConsumption>>({
		method: "get",
		url: `/feed-consumptions/${feedConsumptionId}`,
	});

export const createFeedConsumption = ({
	payload,
}: {
	payload: ICreateFeedConsumptionPayload;
}) =>
	axiosHelper<IResponse<IFeedConsumption>>({
		method: "post",
		url: "/feed-consumptions",
		data: payload,
	});

export const deleteFeedConsumptionById = ({
	feedConsumptionId,
}: {
	feedConsumptionId: string;
}) =>
	axiosHelper<IResponse<null>>({
		method: "delete",
		url: `/feed-consumptions/${feedConsumptionId}`,
	});
