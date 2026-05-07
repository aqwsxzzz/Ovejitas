import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	ICreateFeedTypePayload,
	IFeedType,
	IUpdateFeedTypePayload,
} from "@/features/feed-type/types/feed-type-types";

export const getFeedTypes = ({
	page,
	limit,
}: {
	page?: number;
	limit?: number;
}) =>
	axiosHelper<IResponse<IFeedType[]>>({
		method: "get",
		url: "/feed-types",
		urlParams: { page, limit },
	});

export const getFeedTypeById = ({ feedTypeId }: { feedTypeId: string }) =>
	axiosHelper<IResponse<IFeedType>>({
		method: "get",
		url: `/feed-types/${feedTypeId}`,
	});

export const createFeedType = ({
	payload,
}: {
	payload: ICreateFeedTypePayload;
}) =>
	axiosHelper<IResponse<IFeedType>>({
		method: "post",
		url: "/feed-types",
		data: payload,
	});

export const updateFeedTypeById = ({
	feedTypeId,
	payload,
}: {
	feedTypeId: string;
	payload: IUpdateFeedTypePayload;
}) =>
	axiosHelper<IResponse<IFeedType>>({
		method: "put",
		url: `/feed-types/${feedTypeId}`,
		data: payload,
	});

export const deleteFeedTypeById = ({ feedTypeId }: { feedTypeId: string }) =>
	axiosHelper<IResponse<null>>({
		method: "delete",
		url: `/feed-types/${feedTypeId}`,
	});
