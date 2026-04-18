import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	ICreateFeedLotPayload,
	IFeedLot,
	IFeedLotListFilters,
	IUpdateFeedLotPayload,
} from "@/features/feed-lot/types/feed-lot-types";

export const getFeedLots = ({
	filters,
	page,
	limit,
}: {
	filters?: Partial<IFeedLotListFilters>;
	page?: number;
	limit?: number;
}) =>
	axiosHelper<IResponse<IFeedLot[]>>({
		method: "get",
		url: "/feed-lots",
		urlParams: {
			feedTypeId: filters?.feedTypeId,
			hasStock: filters?.hasStock,
			page,
			limit,
		},
	});

export const getFeedLotById = ({ feedLotId }: { feedLotId: string }) =>
	axiosHelper<IResponse<IFeedLot>>({
		method: "get",
		url: `/feed-lots/${feedLotId}`,
	});

export const createFeedLot = ({
	payload,
}: {
	payload: ICreateFeedLotPayload;
}) =>
	axiosHelper<IResponse<IFeedLot>>({
		method: "post",
		url: "/feed-lots",
		data: payload,
	});

export const updateFeedLotById = ({
	feedLotId,
	payload,
}: {
	feedLotId: string;
	payload: IUpdateFeedLotPayload;
}) =>
	axiosHelper<IResponse<IFeedLot>>({
		method: "put",
		url: `/feed-lots/${feedLotId}`,
		data: payload,
	});

export const deleteFeedLotById = ({ feedLotId }: { feedLotId: string }) =>
	axiosHelper<IResponse<null>>({
		method: "delete",
		url: `/feed-lots/${feedLotId}`,
	});
