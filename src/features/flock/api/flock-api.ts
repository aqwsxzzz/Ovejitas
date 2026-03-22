import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	ICreateFlockPayload,
	ICreateFlockEventPayload,
	IEggCollection,
	IFlock,
	IFlockEvent,
	IFlockListFilters,
	IUpdateFlockPayload,
} from "@/features/flock/types/flock-types";
import i18next from "i18next";
import { ApiRequestError } from "@/lib/axios/axios-helper";

const getRequestLanguage = (): string => {
	const normalizedLanguage = i18next.language.slice(0, 2);

	return normalizedLanguage || "en";
};

const buildFlockQueryParams = ({
	include,
	withLanguage,
	filters,
	page,
	limit,
}: {
	include?: string;
	withLanguage?: boolean;
	filters?: Partial<IFlockListFilters>;
	page?: number;
	limit?: number;
}) => {
	const params: Record<string, string> = {};

	if (include) params.include = include;
	if (withLanguage) params.language = getRequestLanguage();
	if (filters?.status) params.status = filters.status;
	if (filters?.flockType) params.flockType = filters.flockType;
	if (filters?.speciesId) params.speciesId = filters.speciesId;
	if (typeof page === "number") params.page = String(page);
	if (typeof limit === "number") params.limit = String(limit);

	return Object.keys(params).length > 0 ? params : "";
};

export const getFlocks = ({
	farmId,
	include,
	withLanguage,
	filters,
	page,
	limit,
}: {
	farmId: string;
	include?: string;
	withLanguage?: boolean;
	filters?: Partial<IFlockListFilters>;
	page?: number;
	limit?: number;
}) => {
	const urlParams = buildFlockQueryParams({
		include,
		withLanguage,
		filters,
		page,
		limit,
	});

	return axiosHelper<IResponse<IFlock[]>>({
		method: "get",
		url: "/flocks",
		urlParams,
	}).catch((error) => {
		if (!(error instanceof ApiRequestError) || error.statusCode !== 404) {
			throw error;
		}

		return axiosHelper<IResponse<IFlock[]>>({
			method: "get",
			url: `/farms/${farmId}/flocks`,
			urlParams,
		});
	});
};

export const getFlockById = ({
	flockId,
	include,
	withLanguage,
}: {
	flockId: string;
	include?: string;
	withLanguage?: boolean;
}) =>
	axiosHelper<IResponse<IFlock>>({
		method: "get",
		url: `/flocks/${flockId}`,
		urlParams: buildFlockQueryParams({
			include,
			withLanguage,
		}),
	});

export const createFlock = ({ payload }: { payload: ICreateFlockPayload }) =>
	axiosHelper<IResponse<IFlock>>({
		method: "post",
		url: "/flocks",
		data: payload,
	});

export const updateFlockById = ({
	flockId,
	payload,
}: {
	flockId: string;
	payload: IUpdateFlockPayload;
}) =>
	axiosHelper<IResponse<IFlock>>({
		method: "put",
		url: `/flocks/${flockId}`,
		data: payload,
	});

export const getFlockEvents = ({
	flockId,
	page,
	limit,
}: {
	flockId: string;
	page: number;
	limit: number;
}) =>
	axiosHelper<IResponse<IFlockEvent[]>>({
		method: "get",
		url: `/flocks/${flockId}/events`,
		urlParams: {
			page: String(page),
			limit: String(limit),
		},
	});

export const createFlockEvent = ({
	flockId,
	payload,
}: {
	flockId: string;
	payload: ICreateFlockEventPayload;
}) =>
	axiosHelper<IResponse<IFlockEvent>>({
		method: "post",
		url: `/flocks/${flockId}/events`,
		data: payload,
	});

export const getEggCollections = ({
	flockId,
	page,
	limit,
}: {
	flockId: string;
	page: number;
	limit: number;
}) =>
	axiosHelper<IResponse<IEggCollection[]>>({
		method: "get",
		url: `/flocks/${flockId}/egg-collections`,
		urlParams: {
			page: String(page),
			limit: String(limit),
		},
	});
