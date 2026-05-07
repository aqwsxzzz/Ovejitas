import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	ICreateFeedingSchedulePayload,
	IFeedingSchedule,
	IFeedingScheduleListFilters,
	IUpdateFeedingSchedulePayload,
} from "@/features/feeding-schedule/types/feeding-schedule-types";

export const getFeedingSchedules = ({
	filters,
	page,
	limit,
}: {
	filters?: Partial<IFeedingScheduleListFilters>;
	page?: number;
	limit?: number;
}) =>
	axiosHelper<IResponse<IFeedingSchedule[]>>({
		method: "get",
		url: "/feeding-schedules",
		urlParams: {
			flockId: filters?.flockId,
			feedTypeId: filters?.feedTypeId,
			activeOnly:
				typeof filters?.activeOnly === "boolean"
					? String(filters.activeOnly)
					: undefined,
			page,
			limit,
		},
	});

export const createFeedingSchedule = ({
	payload,
}: {
	payload: ICreateFeedingSchedulePayload;
}) =>
	axiosHelper<IResponse<IFeedingSchedule>>({
		method: "post",
		url: "/feeding-schedules",
		data: payload,
	});

export const updateFeedingScheduleById = ({
	feedingScheduleId,
	payload,
}: {
	feedingScheduleId: string;
	payload: IUpdateFeedingSchedulePayload;
}) =>
	axiosHelper<IResponse<IFeedingSchedule>>({
		method: "put",
		url: `/feeding-schedules/${feedingScheduleId}`,
		data: payload,
	});

export const deleteFeedingScheduleById = ({
	feedingScheduleId,
}: {
	feedingScheduleId: string;
}) =>
	axiosHelper<IResponse<null>>({
		method: "delete",
		url: `/feeding-schedules/${feedingScheduleId}`,
	});
