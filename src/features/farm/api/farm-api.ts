import { axiosHelper } from "@/lib/axios/axios-helper";
import type { IResponse } from "@/lib/axios";
import type {
	IFarm,
	IFarmCurrencyOption,
	IUpdateFarmPayload,
	IV1Farm,
	IV1FarmUpdatePayload,
} from "@/features/farm/types/farm-types";

export const getFarmById = ({ farmId }: { farmId: string }) =>
	axiosHelper<IResponse<IFarm>>({
		method: "get",
		url: `/farms/${farmId}`,
	});

export const getFarmCurrencies = () =>
	axiosHelper<IResponse<IFarmCurrencyOption[]>>({
		method: "get",
		url: "/farms/currencies",
	});

export const updateFarmById = ({
	farmId,
	payload,
}: {
	farmId: string;
	payload: IUpdateFarmPayload;
}) =>
	axiosHelper<IResponse<IFarm>>({
		method: "post",
		url: `/farms/${farmId}`,
		data: payload,
	});

/** Read the v1 farm record (source of truth for `default_currency`). */
export const getV1FarmById = ({ farmId }: { farmId: string }) =>
	axiosHelper<IV1Farm>({
		method: "get",
		url: `/api/v1/farms/${farmId}`,
	});

/** Update the v1 farm record (used for `default_currency`). */
export const updateV1FarmById = ({
	farmId,
	payload,
}: {
	farmId: string;
	payload: IV1FarmUpdatePayload;
}) =>
	axiosHelper<IV1Farm>({
		method: "patch",
		url: `/api/v1/farms/${farmId}`,
		data: payload,
	});
